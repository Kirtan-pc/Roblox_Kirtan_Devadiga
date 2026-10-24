"""backend/audio_processing.py - Echo

Audio validation and preprocessing for WAV uploads.

Responsibilities:
- Decode WAV audio safely using soundfile.
- Validate sample rate, channel count, duration, and sample count.
- Convert stereo/multichannel to mono deterministically (channel averaging).
- Resample to the model's expected sample rate when necessary.
- Reject empty, malformed, or non-finite audio.
- Never persist uploaded audio to disk.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

import numpy as np
import soundfile as sf


class AudioError(ValueError):
    """Raised when an uploaded audio file fails validation or preprocessing."""


@dataclass
class AudioInfo:
    original_sample_rate: int
    original_channels: int
    original_sample_count: int
    processed_sample_rate: int
    processed_sample_count: int
    duration_seconds: float


class AudioProcessor:
    """Validates and preprocesses WAV audio for model inference."""

    def __init__(
        self,
        target_sample_rate: int = 16_000,
        max_duration_seconds: float = 60.0,
        max_upload_bytes: int = 50 * 1024 * 1024,  # 50 MB
    ):
        self.target_sample_rate = target_sample_rate
        self.max_duration_seconds = max_duration_seconds
        self.max_upload_bytes = max_upload_bytes

    def validate_and_preprocess(self, file_bytes: bytes) -> tuple[np.ndarray, AudioInfo]:
        """Decode, validate, and preprocess a WAV file from raw bytes.

        Returns (mono_waveform_float32, AudioInfo).
        Raises AudioError on any validation failure.
        """
        if not file_bytes:
            raise AudioError("Empty upload: no audio data received.")
        if len(file_bytes) > self.max_upload_bytes:
            raise AudioError(
                f"Upload too large: {len(file_bytes)} bytes (max {self.max_upload_bytes})."
            )

        # Decode from memory; do not persist to disk
        try:
            import io

            audio, sample_rate = sf.read(io.BytesIO(file_bytes), always_2d=False)
        except Exception as exc:  # noqa: BLE001 - translate to client-safe error
            raise AudioError(f"Unable to decode WAV audio: {exc}") from exc

        if audio is None or audio.size == 0:
            raise AudioError("Empty audio: no samples decoded.")

        # Determine channel count
        if audio.ndim == 1:
            channels = 1
            audio = audio.reshape(-1, 1)
        else:
            channels = audio.shape[1]

        if channels < 1:
            raise AudioError("Invalid audio: zero channels.")

        # Convert to float64 for safe processing
        audio = audio.astype(np.float64)

        # Reject NaN / inf
        if not np.all(np.isfinite(audio)):
            raise AudioError("Audio contains non-finite sample values.")

        original_sample_count = int(audio.shape[0])
        duration = original_sample_count / float(sample_rate)

        if duration <= 0:
            raise AudioError("Invalid audio: non-positive duration.")
        if duration > self.max_duration_seconds:
            raise AudioError(
                f"Audio duration {duration:.2f}s exceeds maximum {self.max_duration_seconds}s."
            )

        # Convert to mono: average across channels (deterministic)
        mono = np.mean(audio, axis=1)

        # Resample to target sample rate if necessary
        if sample_rate != self.target_sample_rate:
            mono = self._resample(mono, sample_rate, self.target_sample_rate)
            processed_sample_rate = self.target_sample_rate
        else:
            processed_sample_rate = sample_rate

        processed_sample_count = int(mono.shape[0])
        processed_duration = processed_sample_count / float(processed_sample_rate)

        # Reject empty after resampling
        if processed_sample_count == 0:
            raise AudioError("Audio became empty after preprocessing.")

        # Final finite check
        if not np.all(np.isfinite(mono)):
            raise AudioError("Audio contains non-finite values after preprocessing.")

        info = AudioInfo(
            original_sample_rate=int(sample_rate),
            original_channels=channels,
            original_sample_count=original_sample_count,
            processed_sample_rate=int(processed_sample_rate),
            processed_sample_count=processed_sample_count,
            duration_seconds=float(processed_duration),
        )

        return mono.astype(np.float32), info

    @staticmethod
    def _resample(waveform: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        """Resample a 1-D waveform using linear interpolation.

        This is dependency-free (no scipy/librosa) and sufficient for
        16 kHz model input. The waveform is not amplified.
        """
        if orig_sr == target_sr:
            return waveform

        orig_length = waveform.shape[0]
        target_length = int(round(orig_length * target_sr / orig_sr))

        if target_length == 0:
            return np.empty(0, dtype=np.float64)

        # Linear interpolation across the original time axis
        orig_times = np.linspace(0.0, 1.0, orig_length, endpoint=False)
        target_times = np.linspace(0.0, 1.0, target_length, endpoint=False)

        resampled = np.interp(target_times, orig_times, waveform)
        return resampled.astype(np.float64)
