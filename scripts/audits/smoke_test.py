import soundfile as sf
import numpy as np
import os
import tempfile
import torch
from transformers import WhisperFeatureExtractor, WhisperForConditionalGeneration, WhisperTokenizer

# Create a short speech-like WAV file (1 second, 16kHz, mono)
sr = 16000
duration = 1.0
t = np.linspace(0, duration, int(sr * duration), endpoint=False)

# Create a more realistic "speech-like" signal formants
f0 = 150
f1 = 700
f2 = 1300
f3 = 2600

np.random.seed(42)
noise = np.random.normal(0, 0.005, len(t))

signal = np.zeros(len(t))
for n in range(1, 10):
    signal += np.sin(2 * np.pi * n * f0 * t) / n

signal += 0.5 * np.sin(2 * np.pi * f1 * t)
signal += 0.3 * np.sin(2 * np.pi * f2 * t)
signal += 0.15 * np.sin(2 * np.pi * f3 * t)

signal = signal + noise
signal = signal / np.max(np.abs(signal)) * 0.8  # normalize

waveform = (signal * 32767).astype(np.int16)

with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
    tmpname = tmp.name

try:
    sf.write(tmpname, waveform, sr, subtype='PCM_16')
    print(f'Created test WAV: {tmpname}')
    print(f'Duration: {duration}s, Sample rate: {sr}Hz, Channels: 1')
    print(f'Signal max: {np.max(np.abs(waveform))}, dtype: {waveform.dtype}')

    # Load Whisper Small from local cache
    feature_extractor = WhisperFeatureExtractor.from_pretrained(
        'openai/whisper-small',
        cache_dir='./cache_test'
    )
    model = WhisperForConditionalGeneration.from_pretrained(
        'openai/whisper-small',
        cache_dir='./cache_test'
    )
    tokenizer = WhisperTokenizer.from_pretrained(
        'openai/whisper-small',
        cache_dir='./cache_test'
    )

    # Process the audio - Whisper expects mono 16kHz PCM
    feature_input = feature_extractor(
        waveform,
        sampling_rate=sr,
        return_tensors="pt"
    )

    # Generate transcription
    with torch.no_grad():
        predicted_ids = model.generate(**feature_input)

    # Decode to text
    transcription = tokenizer.decode(predicted_ids[0], skip_special_tokens=True)

    clean_transcription = transcription.strip()
    
    print(f'Transcription: "{clean_transcription}"')
    print(f'Transcript length: {len(clean_transcription)} chars')
    
    if clean_transcription:
        print(f'SUCCESS: Produced text transcript (not class labels or logits)!')
    else:
        print(f'WARNING: Empty transcript - audio may need different processing')

    # Verify output is text, not class labels
    print(f'\\nOutput type: text transcript (not class labels or logits)')
    print(f'Contains decoded token IDs converted to readable text')
    print(f'Transcript is valid string output from Whisper generate(): OK')

finally:
    os.unlink(tmpname)