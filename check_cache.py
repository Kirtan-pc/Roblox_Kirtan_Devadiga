import os
import json

cache_dir = os.path.expanduser('~/.cache/huggingface/hub')
if os.path.exists(cache_dir):
    entries = os.listdir(cache_dir)
    print(f'Cache entries ({len(entries)}):')
    for e in entries:
        full = os.path.join(cache_dir, e)
        if os.path.isdir(full):
            config = os.path.join(full, 'config.json')
            has_config = os.path.exists(config)
            print(f'  {e}: is_dir=True, has_config={has_config}')
            if has_config:
                with open(config) as f:
                    try:
                        c = json.load(f)
                        mt = c.get('model_type', 'N/A')
                        t = c.get('task', 'N/A')
                        nn = c.get('name_or_path', 'N/A')[:80]
                        print(f'    model_type={mt}, task={t}')
                        print(f'    name_or_path={nn}')
                    except:
                        print(f'    config read error')
        else:
            print(f'  {e}: is_file=True')