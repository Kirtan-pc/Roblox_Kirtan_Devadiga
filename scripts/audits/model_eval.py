models_info = {
    'openai/whisper-small.en': {
        'multilingual': False,
        'english_only': True,
        'params_approx': '244M',
        'language_support': ['English'],
    },
    'openai/whisper-small': {
        'multilingual': True,
        'english_only': False,
        'params_approx': '244M',
        'language_support': ['English', 'Spanish', 'French', 'German', 'Japanese', 'Portuguese', 'Chinese', 'Korean', 'Italian', 'Russian', 'Arabic'],
    },
    'superb/wav2vec2-base-superb-er': {
        'multilingual': True,
        'english_only': False,
        'params_approx': '86M',
        'language_support': ['Multilingual includes English, Hindi, Marathi, and many others - trained on SUPERB benchmark'],
    },
}

for name, info in models_info.items():
    print(f'\n{name}:')
    print(f'  Multilingual: {info["multilingual"]}')
    print(f'  English only: {info["english_only"]}')
    print(f'  Approx params: {info["params_approx"]}')
    print(f'  Language support: {info["language_support"]}')