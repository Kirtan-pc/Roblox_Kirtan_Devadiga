import os

cache_dir = os.path.expanduser('~/.cache/huggingface/hub')
if os.path.exists(cache_dir):
    entries = os.listdir(cache_dir)
    print('Cache entries:')
    for e in entries:
        full = os.path.join(cache_dir, e)
        if os.path.isdir(full):
            config = os.path.join(full, 'config.json')
            if os.path.exists(config):
                print(f'ASR-capable model found: {e}')
            else:
                print(f'No config.json in: {e}')
    # Also check if any entry has "whisper" or "asr" in the name
    for e in entries:
        full = os.path.join(cache_dir, e)
        if os.path.isdir(full) and ("whisper" in e.lower() or "asr" in e.lower() or "speech" in e.lower()):
            print(f'Potential ASR model: {e}')