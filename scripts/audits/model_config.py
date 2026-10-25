from transformers import AutoConfig

models = ['openai/whisper-small.en', 'openai/whisper-small']

for name in models:
    try:
        config = AutoConfig.from_pretrained(
            name, 
            cache_dir='./cache_test',
            trust_remote_code=False
        )
        print(f'{name}:')
        print(f'  model_type: {config.model_type}')
        task = getattr(config, 'task', 'N/A')
        print(f'  task: {task}')
    except Exception as e:
        print(f'{name}: ERROR - {str(e)[:80]}')