"""backend/generate_samples.py - Echo

Generates small, deterministic synthetic WAV fixtures for validating the audio
pipeline (file reading, channel handling, sample rate, duration, preprocessing)
in later milestones.

These are audio-pipeline fixtures only. They are NOT emotion-labelled speech
recordings and must not be interpreted as representing any emotional state.

Usage (from the repository root or the backend directory):
    python backend/generate_samples.py
    python backend/generate_samples.py --output-dir sample_audio
    python backend/generate_samples.py --output-dir /tmp/echo-fixtures --duration 1.0 --seed 7
"""

from __future__ import annotations

import argparse
import math
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

REPO_ROOT = Path(__file__).resolve().parents[1]

DEFAULT_OUTPUT_DIR = REPO_ROOT / "sample_audio"
DEFAULT_SAMPLE_RATE = 16_000
DEFAULT_DURATION = 1.0
DEFAULT_SEED = 42
MAX_AMPLITUDE = 0.9  # headroom to prevent clipping

FIXTURES = [
    {
        "name": "synthetic_tone_low.wav",
        "kind": "tone",
        "frequency_hz": 110.0,
        "description": "Low-frequency synthetic tone.",
    },
    {
        "name": "synthetic_tone_high.wav",
        "kind": "tone",
        "frequency_hz": 880.0,
        "description": "Higher-frequency synthetic tone.",
    },
    {
        "name": "synthetic_signal_variable.wav",
        "kind": "variable",
        "description": "Short, varying synthetic signal (frequency sweep).",
    },
]


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate deterministic synthetic WAV audio-pipeline fixtures."
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_DIR),
        help=f"Directory for generated WAV fixtures (default: {DEFAULT_OUTPUT_DIR})",
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=DEFAULT_DURATION,
        help=f"Duration in seconds for each fixture (default: {DEFAULT_DURATION})",
    )
    parser.add_argument(
        "--sample-rate",
        type=int,
        default=DEFAULT_SAMPLE_RATE,
        help=f"Sample rate in Hz (default: {DEFAULT_SAMPLE_RATE})",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=DEFAULT_SEED,
        help=f"Random seed for deterministic signals (default: {DEFAULT_SEED})",
    )
    return parser.parse_args(argv)


def generate_tone(sample_rate: int, duration: float, frequency_hz: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    num_samples = max(1, int(round(sample_rate * duration)))
    t = np.arange(num_samples, dtype=np.float32) / float(sample_rate)
    signal = (0.5 * np.sin(2.0 * math.pi * frequency_hz * t)).astype(np.float32)
    noise = (0.02 * rng.standard_normal(num_samples)).astype(np.float32)
    signal = signal + noise
    return np.clip(signal, -MAX_AMPLITUDE, MAX_AMPLITUDE)


def generate_variable(sample_rate: int, duration: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    num_samples = max(1, int(round(sample_rate * duration)))
    t = np.arange(num_samples, dtype=np.float32) / float(sample_rate)
    # Frequency sweep from low to mid, amplitude-modulated.
    freq = 200.0 + 600.0 * (t / max(t[-1], 1e-6))
    phase = 2.0 * math.pi * np.cumsum(freq) / float(sample_rate)
    envelope = 0.5 * (1.0 + np.sin(2.0 * math.pi * 1.5 * t))
    signal = (0.4 * np.sin(phase) * envelope).astype(np.float32)
    noise = (0.02 * rng.standard_normal(num_samples)).astype(np.float32)
    signal = signal + noise
    return np.clip(signal, -MAX_AMPLITUDE, MAX_AMPLITUDE)


def generate_signal(kind: str, sample_rate: int, duration: float, frequency_hz: float, seed: int) -> np.ndarray:
    if kind == "tone":
        return generate_tone(sample_rate, duration, frequency_hz, seed)
    if kind == "variable":
        return generate_variable(sample_rate, duration, seed)
    raise ValueError(f"Unknown fixture kind: {kind}")


def validate_fixture(path: Path, sample_rate: int, duration: float, expected_channels: int = 1) -> dict:
    """Reopen and validate a written WAV file. Returns metadata or raises."""
    if not path.exists():
        raise FileNotFoundError(f"Fixture was not created: {path}")
    size = path.stat().st_size
    if size == 0:
        raise ValueError(f"Fixture is empty: {path}")

    data, sr = sf.read(path, always_2d=False)
    if sr != sample_rate:
        raise ValueError(f"Sample rate mismatch: expected {sample_rate} Hz, got {sr} Hz")

    if data.ndim == 1:
        channels = 1
        data = data.reshape(-1, 1)
    else:
        channels = data.shape[1]

    if channels != expected_channels:
        raise ValueError(f"Channel count mismatch: expected {expected_channels}, got {channels}")

    num_samples = data.shape[0]
    measured_duration = num_samples / float(sample_rate)
    if measured_duration <= 0:
        raise ValueError("Measured duration is not positive.")
    if abs(measured_duration - duration) > 0.02:
        raise ValueError(f"Duration mismatch: expected ~{duration} s, got {measured_duration:.4f} s")

    if not np.all(np.isfinite(data)):
        raise ValueError("Waveform contains non-finite values.")
    if np.max(np.abs(data)) > MAX_AMPLITUDE + 1e-6:
        raise ValueError("Waveform exceeds permitted amplitude range (clipping).")

    return {
        "path": str(path),
        "size_bytes": size,
        "sample_rate": int(sr),
        "channels": int(channels),
        "duration_seconds": round(measured_duration, 4),
        "finite": True,
        "max_amplitude": round(float(np.max(np.abs(data))), 4),
    }


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    if args.duration <= 0:
        print(f"ERROR: --duration must be positive, got {args.duration}", file=sys.stderr)
        return 2
    if args.sample_rate <= 0:
        print(f"ERROR: --sample-rate must be positive, got {args.sample_rate}", file=sys.stderr)
        return 2

    output_dir = Path(args.output_dir)
    try:
        output_dir.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        print(f"ERROR: cannot create output directory {output_dir}: {exc}", file=sys.stderr)
        return 1

    results = []
    failures = []

    for fixture in FIXTURES:
        name = fixture["name"]
        kind = fixture["kind"]
        path = output_dir / name

        try:
            signal = generate_signal(
                kind,
                args.sample_rate,
                args.duration,
                fixture.get("frequency_hz", 440.0),
                args.seed,
            )
            # Write as PCM_16 WAV via soundfile.
            sf.write(path, signal, args.sample_rate, subtype="PCM_16")

            metadata = validate_fixture(path, args.sample_rate, args.duration)
            metadata["name"] = name
            metadata["description"] = fixture["description"]
            results.append(metadata)
            print(
                f"OK  {name}: {metadata['duration_seconds']} s, "
                f"{metadata['sample_rate']} Hz, {metadata['channels']} channel(s), "
                f"{metadata['size_bytes']} bytes"
            )
        except Exception as exc:  # noqa: BLE001
            failures.append((name, str(exc)))
            print(f"FAIL {name}: {exc}", file=sys.stderr)

    print("\n=== Audio fixture report ===")
    print(f"Output directory: {output_dir}")
    print(f"Sample rate: {args.sample_rate} Hz")
    print(f"Duration: {args.duration} s")
    print(f"Generated: {len(results)}, Failed: {len(failures)}")
    for r in results:
        print(f"  - {r['name']}: {r['description']}")
        print(
            f"      path={r['path']} size={r['size_bytes']}B "
            f"sr={r['sample_rate']}Hz ch={r['channels']} dur={r['duration_seconds']}s "
            f"max_amp={r['max_amplitude']} finite={r['finite']}"
        )

    if failures:
        print("\nFailures:")
        for name, err in failures:
            print(f"  - {name}: {err}")
        return 1

    print("\nNote: these are synthetic pipeline fixtures, not emotion-labelled speech.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
