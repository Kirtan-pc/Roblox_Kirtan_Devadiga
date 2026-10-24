from backend.audio_processing import AudioProcessor
import numpy as np
import soundfile as sf
import tempfile
import os

# Create a valid WAV file in memory
proc = AudioProcessor()
t = np.linspace(0, 1, 16000, endpoint=False)
waveform = 0.5 * np.sin(2 * np.pi * 440 * t)

with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
    tmpname = tmp.name

try:
    sf.write(tmpname, waveform, 16000, subtype='FLOAT')
    with open(tmpname, 'rb') as f:
        data = f.read()
    info = proc.validate_and_preprocess(data)
    print(f'Sample rate: {info.original_sample_rate}')
    print(f'Duration: {info.duration_seconds}s')
    print(f'Channels: {info.original_channels}')
    print(f'Status: {info.status}')
finally:
    os.unlink(tmpname)