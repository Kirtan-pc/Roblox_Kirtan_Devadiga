"""backend/download_models.py - Echo

Downloads/caches the pretrained speech-emotion-recognition checkpoint and runs a
genuine inference smoke test to verify the pipeline loads and executes.

Intended checkpoint: superb/wav2vec2-base-superb-er

Usage (from the repository root or the backend directory):
    python backend/download_models.py
    python backend/download_models.py --model-id superb/wav2vec2-base-superb-er
    python backend/download_models.py --offline
    python backend/download_models.py --cache-dir /path/to/cache

Design notes:
- Model files are stored in the Hugging Face cache (default ~/.cache/huggingface,
  or HF_HOME/TRANSFORMERS_CACHE if set), never inside the Echo repository.
- This script only downloads/caches the model and runs a smoke test. It does not
  implement the emotion-analysis engine, decision matrix, API, or dashboard.
- The checkpoint predicts labels from its own configuration (e.g. neu/hap/ang/sad).
  Those labels are indicative only and must not be remapped into validated fear,
  nervousness, coercion, deception, or guilt scores.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Repository root resolved from this file so the script works regardless of CWD.
REPO_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_MODEL_ID = "superb/wav2vec2-base-superb-er"
DEFAULT_SAMPLE_RATE = 16_000
SMOKE_TEST_SECONDS = 2.0
SMOKE_TEST_SEED = 42


def _fail(message: str) -> int:
    print(f"ERROR: {message}", file=sys.stderr)
    return 1


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download/cache a Hugging Face speech-emotion model and run an inference smoke test."
    )
    parser.add_argument(
        "--model-id",
        default=DEFAULT_MODEL_ID,
        help=f"Hugging Face model checkpoint (default: {DEFAULT_MODEL_ID})",
    )
    parser.add_argument(
        "--cache-dir",
        default=None,
        help="Optional Hugging Face cache directory. Defaults to the standard HF cache "
        "(~/.cache/huggingface) or HF_HOME/TRANSFORMERS_CACHE if set.",
    )
    parser.add_argument(
        "--offline",
        action="store_true",
        help="Use only locally cached files. Do not attempt to download.",
    )
    return parser.parse_args(argv)


def load_model_and_processor(model_id: str, cache_dir: str | None, offline: bool):
    """Load processor and model. Returns (processor, model, device).

    AutoFeatureExtractor / AutoModelForAudioClassification are used so the concrete
    classes are selected from the checkpoint config rather than assumed. (AutoProcessor /
    AutoModelForSequenceClassification are incompatible with this audio checkpoint.)
    """
    import torch
    from transformers import AutoModelForAudioClassification, AutoFeatureExtractor

    processor_kwargs: dict = {}
    model_kwargs: dict = {}
    if cache_dir:
        processor_kwargs["cache_dir"] = cache_dir
        model_kwargs["cache_dir"] = cache_dir

    if offline:
        processor_kwargs["local_files_only"] = True
        model_kwargs["local_files_only"] = True

    processor = AutoFeatureExtractor.from_pretrained(model_id, **processor_kwargs)
    model = AutoModelForAudioClassification.from_pretrained(model_id, **model_kwargs)
    model.eval()

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    return processor, model, device


def _softmax(x):
    import numpy as np

    x = x - np.max(x)
    exp_x = np.exp(x)
    return exp_x / np.sum(exp_x)


def smoke_test(processor, model, device, sample_rate: int = DEFAULT_SAMPLE_RATE) -> dict:
    """Run a genuine inference smoke test on a synthetic in-memory waveform.

    Verifies preprocessing, inference, finite logits, output dimensionality, and
    the model's configured label mapping.
    """
    import numpy as np
    import torch

    rng = np.random.default_rng(SMOKE_TEST_SEED)
    num_samples = int(sample_rate * SMOKE_TEST_SECONDS)
    t = np.arange(num_samples) / sample_rate
    # Deterministic synthetic tone + noise, normalized to avoid clipping.
    waveform = 0.5 * np.sin(2 * np.pi * 440 * t) + 0.1 * rng.standard_normal(num_samples)
    waveform = waveform.astype(np.float32)
    peak = float(np.max(np.abs(waveform))) or 1e-6
    waveform = (waveform / peak) * 0.9

    inputs = processor(waveform, sampling_rate=sample_rate, return_tensors="pt", padding=True)
    input_values = inputs.input_values.to(device)

    with torch.inference_mode():
        outputs = model(input_values=input_values)

    logits = outputs.logits
    if not torch.isfinite(logits).all():
        raise RuntimeError("Model produced non-finite logits.")

    logits_cpu = logits.detach().cpu().numpy()[0]
    num_labels = int(model.config.num_labels)
    if logits_cpu.shape[0] != num_labels:
        raise RuntimeError(
            f"Logit dimension {logits_cpu.shape[0]} != num_labels {num_labels}"
        )

    probs = _softmax(logits_cpu)
    id2label = model.config.id2label

    label_scores = [
        {"label": id2label.get(i, f"label_{i}"), "score": float(probs[i])}
        for i in range(num_labels)
    ]
    label_scores.sort(key=lambda item: item["score"], reverse=True)

    return {
        "num_samples": num_samples,
        "sample_rate": sample_rate,
        "logits_shape": tuple(int(v) for v in logits_cpu.shape),
        "logits_finite": bool(torch.isfinite(logits).all().item()),
        "num_labels": num_labels,
        "id2label": {str(i): str(label) for i, label in id2label.items()},
        "top_label_scores": label_scores,
    }


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    print(f"Model ID: {args.model_id}")
    print(f"Cache directory: {args.cache_dir or '<default HF cache>'}")
    print(f"Offline mode: {args.offline}")

    try:
        processor, model, device = load_model_and_processor(
            args.model_id, args.cache_dir, offline=args.offline
        )
    except ModuleNotFoundError as exc:
        return _fail(
            "Required dependency missing: "
            f"{exc.name}. Install the backend dependencies (see backend/requirements.txt)."
        )
    except Exception as exc:  # noqa: BLE001 - report download/load failures clearly
        return _fail(f"Failed to load model '{args.model_id}': {exc}")

    print("Processor loaded: OK")
    print("Model loaded: OK")
    print(f"Device used: {device}")
    print(f"Model num_labels: {model.config.num_labels}")

    try:
        report = smoke_test(processor, model, device)
    except Exception as exc:  # noqa: BLE001
        return _fail(f"Inference smoke test failed: {exc}")

    print("Smoke test: PASSED")
    print(f"  Waveform samples: {report['num_samples']} @ {report['sample_rate']} Hz")
    print(f"  Logits shape: {report['logits_shape']} (finite: {report['logits_finite']})")
    print("  Label mapping (from model config):")
    for idx, label in report["id2label"].items():
        print(f"    {idx}: {label}")
    print("  Top output scores:")
    for item in report["top_label_scores"]:
        print(f"    {item['label']}: {item['score']:.4f}")

    print("\nNote: output labels come from the model configuration and are indicative only.")
    print("They are not validated measures of fear, nervousness, coercion, deception, or guilt.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
