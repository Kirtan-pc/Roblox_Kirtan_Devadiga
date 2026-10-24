"""backend/model_service.py - Echo

Singleton service for loading and running the cached speech-emotion
classification model. The model is loaded once and reused across requests.

Intended checkpoint: superb/wav2vec2-base-superb-er

Design notes:
- Model files are stored in the Hugging Face cache (default ~/.cache/huggingface,
  or HF_HOME/TRANSFORMERS_CACHE if set), never inside the Echo repository.
- The model is NOT downloaded automatically. If it is not cached, initialization
  fails with a clear diagnostic.
- The checkpoint's actual class labels (neu, hap, ang, sad) are returned as-is.
- Labels are indicative only and must not be remapped into validated measures of
  fear, nervousness, coercion, deception, or guilt.
"""

from __future__ import annotations

import threading
from pathlib import Path
from typing import Optional

import torch
from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

DEFAULT_MODEL_ID = "superb/wav2vec2-base-superb-er"


class ModelService:
    """Thread-safe singleton wrapper around a Hugging Face audio classification model."""

    def __init__(self, model_id: str = DEFAULT_MODEL_ID, cache_dir: Optional[str | Path] = None):
        self.model_id = model_id
        self.cache_dir = str(cache_dir) if cache_dir is not None else None
        self._lock = threading.RLock()
        self._feature_extractor: Optional[AutoFeatureExtractor] = None
        self._model: Optional[AutoModelForAudioClassification] = None
        self._device: Optional[str] = None
        self._initialized = False
        self._init_error: Optional[str] = None

    @property
    def is_ready(self) -> bool:
        with self._lock:
            return self._initialized and self._model is not None and self._feature_extractor is not None

    @property
    def init_error(self) -> Optional[str]:
        with self._lock:
            return self._init_error

    @property
    def num_labels(self) -> Optional[int]:
        with self._lock:
            if self._model is not None:
                return int(self._model.config.num_labels)
            return None

    @property
    def id2label(self) -> dict:
        with self._lock:
            if self._model is not None:
                return {str(i): str(lbl) for i, lbl in self._model.config.id2label.items()}
            return {}

    @property
    def labels(self) -> list[str]:
        with self._lock:
            if self._model is not None:
                return [str(self._model.config.id2label[i]) for i in range(int(self._model.config.num_labels))]
            return []

    def initialize(self, offline: bool = True) -> None:
        """Load the model and feature extractor from cache.

        Raises RuntimeError with a clear diagnostic if loading fails.
        Safe to call multiple times; subsequent calls are no-ops.
        """
        with self._lock:
            if self._initialized:
                return

            try:
                loader_kwargs: dict = {}
                if self.cache_dir:
                    loader_kwargs["cache_dir"] = self.cache_dir
                if offline:
                    loader_kwargs["local_files_only"] = True

                self._feature_extractor = AutoFeatureExtractor.from_pretrained(
                    self.model_id, **loader_kwargs
                )
                self._model = AutoModelForAudioClassification.from_pretrained(
                    self.model_id, **loader_kwargs
                )
                self._model.eval()

                self._device = "cuda" if torch.cuda.is_available() else "cpu"
                self._model.to(self._device)

                self._initialized = True
                self._init_error = None
            except Exception as exc:  # noqa: BLE001 - report clearly to caller
                self._initialized = False
                self._init_error = f"Failed to load model '{self.model_id}': {exc}"
                raise RuntimeError(self._init_error) from exc

    def infer(self, waveform, sample_rate: int) -> dict:
        """Run inference on a preprocessed mono waveform.

        Returns a dict with logits, probabilities, and labels.
        """
        if not self.is_ready:
            raise RuntimeError("Model service is not initialized. Call initialize() first.")

        import numpy as np

        # Ensure float32, 1-D, correct length
        waveform = np.asarray(waveform, dtype=np.float32).reshape(-1)

        # Prevent NaN / inf from reaching the model
        if not np.all(np.isfinite(waveform)):
            raise ValueError("Waveform contains non-finite values.")

        inputs = self._feature_extractor(
            waveform, sampling_rate=sample_rate, return_tensors="pt", padding=True
        )
        input_values = inputs.input_values.to(self._device)

        with torch.inference_mode():
            outputs = self._model(input_values=input_values)

        logits = outputs.logits
        if not torch.isfinite(logits).all():
            raise RuntimeError("Model produced non-finite logits.")

        logits_cpu = logits.detach().cpu().numpy()[0]
        num_labels = int(self._model.config.num_labels)
        if logits_cpu.shape[0] != num_labels:
            raise RuntimeError(
                f"Logit dimension {logits_cpu.shape[0]} != num_labels {num_labels}"
            )

        # Stable softmax
        shifted = logits_cpu - np.max(logits_cpu)
        exp_shifted = np.exp(shifted)
        probs = exp_shifted / np.sum(exp_shifted)

        id2label = self.id2label
        label_scores = [
            {"label": id2label.get(str(i), f"label_{i}"), "score": float(probs[i])}
            for i in range(num_labels)
        ]
        label_scores.sort(key=lambda item: item["score"], reverse=True)

        predicted = label_scores[0]

        return {
            "logits_shape": tuple(int(v) for v in logits_cpu.shape),
            "logits_finite": True,
            "num_labels": num_labels,
            "id2label": id2label,
            "probabilities": label_scores,
            "predicted_label": predicted["label"],
            "predicted_score": predicted["score"],
        }
