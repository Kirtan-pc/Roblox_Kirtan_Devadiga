import os
import json

cache_dir = os.path.expanduser('~/.cache/huggingface/hub')
print(f'Cache dir: {cache_dir}')
entries = os.listdir(cache_dir)
print(f'Cache entries: {entries}')

for e in entries:
    full = os.path.join(cache_dir, e)
    if os.path.isdir(full):
        config = os.path.join(full, 'config.json')
        if os.path.exists(config):
            with open(config) as f:
                c = json.load(f)
                mt = c.get('model_type', 'N/A')
                nn = c.get('name_or_path', 'N/A')[:60]
                print(f'  {e}: type={mt}, name={nn}')
        else:
            print(f'  {e}: directory (no config)')