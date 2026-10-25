import re
from backend.transcript_analysis import CATEGORIES, TranscriptAnalyzer

# Check the compiled patterns
print('CATEGORIES structure:')
for cat, patterns in CATEGORIES.items():
    print(f'  {cat}:')
    for p in patterns:
        compiled = re.compile(p, re.IGNORECASE)
        print(f'    Pattern: {p}')
        # Test on 'you are under digital arrest'
        text = 'you are under digital arrest'
        matches = list(compiled.finditer(text))
        print(f'    Matches on "{text}": {[(m.group(), m.start(), m.end()) for m in matches]}')

# Test the full analyzer
analyzer = TranscriptAnalyzer()
analysis = analyzer.analyze('You are under digital arrest.')
print('\nFull analyze results:')
for i in analysis.matched_indicators:
    print(f'  category={i.category!r}, phrase={i.phrase!r}, start={i.start}, end={i.end}')

# Test each test case from the test file
test_cases = [
    ("Digital arrest", "digital_arrest_threat"),
    ("You are under digital arrest.", "digital_arrest_threat"),
    ("DIGITAL ARREST is the term used.", "digital_arrest_threat"),
    ("Digital arrest!", "digital_arrest_threat"),
    ("Digital   arrest  threat", "digital_arrest_threat"),
    ("Install AnyDesk for remote access.", "remote_access_request"),
]
print('\nTest case analysis:')
for text, expected_cat in test_cases:
    analysis = analyzer.analyze(text)
    cat_names = {i.category for i in analysis.matched_indicators}
    has_expected = expected_cat in cat_names
    print(f'  "{text[:30]}..." -> categories: {cat_names}, has {expected_cat}: {has_expected}')