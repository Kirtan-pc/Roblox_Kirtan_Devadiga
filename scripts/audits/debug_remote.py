from backend.transcript_analysis import TranscriptAnalyzer, get_analyzer

analyzer = get_analyzer()
analysis = analyzer.analyze('Install AnyDesk for remote access.')
print('Matched indicators:')
for i in analysis.matched_indicators:
    print(f'  category={i.category!r}, phrase={i.phrase!r}')

# Check the patterns
patterns = analyzer._compiled['remote_access_request']
print('\nRemote access patterns:')
for p in patterns:
    print(f'  Pattern: {p.pattern}')
    text = 'install anydesk for remote access'
    matches = list(p.finditer(text))
    print(f'    Matches on "{text}": {[(m.group(), m.start(), m.end()) for m in matches]}')

text2 = 'install anydesk for remote access'
normalized = analyzer._normalize_whitespace(analyzer._normalize_case(text2))
print(f'\nNormalized: {repr(normalized)}')
matches = list(patterns[0].finditer(normalized))
print(f'    Matches on normalized: {[(m.group(), m.start(), m.end()) for m in matches]}')

# Also try the second pattern
print('\nSecond pattern matches:')
matches2 = list(patterns[1].finditer(normalized))
print(f'    Matches: {[(m.group(), m.start(), m.end()) for m in matches2]}')