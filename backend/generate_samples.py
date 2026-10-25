import os
import numpy as np
import soundfile as sf

SAMPLE_DIR = "../sample_audio"
os.makedirs(SAMPLE_DIR, exist_ok=True)
sr = 16000

files = {
    "01_calm_inquiry.wav": 220.0,
    "02_panicked_fraud.wav": 880.0,
    "03_fake_calm_coercion.wav": 130.0,
    "04_angry_non_urgent.wav": 660.0,
    "05_sextortion_distress.wav": 920.0
}

t = np.linspace(0, 6, sr * 6, endpoint=False)
for name, freq in files.items():
    # Vary amplitude across time so sliding windows show dynamic progression
    envelope = np.linspace(0.1, 0.5, sr * 6) if "03" not in name else np.ones(sr * 6) * 0.02
    waveform = (envelope * np.sin(2 * np.pi * freq * t)).astype(np.float32)
    sf.write(os.path.join(SAMPLE_DIR, name), waveform, sr)
    print(f"Created 6-second baseline test file: {name}")
