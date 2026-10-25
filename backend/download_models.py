import os
import numpy as np
from transformers import pipeline

CACHE_DIR = "./models_cache"
MODEL_ID = "superb/wav2vec2-base-superb-er"

def fetch_model():
    print(f"[1/2] Downloading pretrained Wav2Vec 2.0 SER weights ({MODEL_ID})...")
    os.makedirs(CACHE_DIR, exist_ok=True)
    classifier = pipeline(
        "audio-classification",
        model=MODEL_ID,
        model_kwargs={"cache_dir": CACHE_DIR}
    )
    print("[2/2] Model cached successfully! Running dry-run tensor check...")
    dummy_audio = np.zeros(16000 * 3, dtype=np.float32)  # 3 seconds of silence
    res = classifier(dummy_audio, top_k=4)
    print("Dry-Run Output:", res)

if __name__ == "__main__":
    fetch_model()
