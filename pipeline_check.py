from backend.transcript_analysis import TranscriptAnalyzer, get_analyzer
from backend.triage_engine import TriageEngine, TriageResult

# Show the transcript analysis + triage pipeline
analyzer = get_analyzer()

# Example: a transcribed WAV would produce text like this
test_transcripts = [
    "The CBI will arrest your account. Transfer money now.",
    "I am calling to check on my balance.",
    "Please provide your OTP code for verification.",
]

print("=== TRANSCRIPT ANALYSIS + TRIAGE PIPELINE ===")
for transcript in test_transcripts:
    analysis = analyzer.analyze(transcript)
    engine = TriageEngine()
    result = engine.triage(analysis)
    print(f'\nTranscript: "{transcript[:50]}..."')
    print(f'  Categories: ", ".join([i.category for i in analysis.matched_indicators])')
    print(f'  Triage: {result.category} ({result.category_name})')
    print(f'  Rules fired: {result.rules_fired}')
    print(f'  Indicators: {len(result.indicators)}')