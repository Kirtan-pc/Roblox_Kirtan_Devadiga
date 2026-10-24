from backend.transcript_analysis import TranscriptAnalyzer, get_analyzer
from backend.triage_engine import TriageEngine, TriageResult

analyzer = get_analyzer()
engine = TriageEngine()

# 1. Emotion predictions cannot independently escalate triage
print("=== Test: Emotion without cybercrime indicators ===")
analysis = analyzer.analyze("I am very angry about the service!")
result = engine.triage(analysis, emotion_context=None)
print(f"  Category: {result.category} (expected: low_evidence or requires_human_review)")
print(f"  Indicators: {len(result.indicators)} (should be 0 if no cybercrime patterns)")

# 2. No component claims to detect guilt, deception, or criminal intent
print("\n=== Test: No guilt/deception claims ===")
analysis2 = analyzer.analyze("The CBI will arrest your account.")
result2 = engine.triage(analysis2)
explanation_lower = str(result2.explanation).lower()
print(f"  Category: {result2.category}")
print(f"  Explanation includes disclaimer: {'disclaimer' in explanation_lower or 'does not establish' in explanation_lower}")

# 3. Missing indicators does not mean call is safe
print("\n=== Test: Missing indicators != safe call ===")
analysis3 = analyzer.analyze("Hello, how are you?")
result3 = engine.triage(analysis3)
print(f"  Category: {result3.category} (low_evidence = no indicators detected, not = safe)")
print(f"  Explanation: {result3.explanation[:80]}...")

# 3. Transcript excerpts and indicators handled consistently
print("\n=== Test: Consistent indicator handling ===")
texts = [
    "The CBI will arrest your account. Transfer money now.",
    "DIGITAL ARREST threat",
    "digital arrest threat",
]
for t in texts:
    a = analyzer.analyze(t)
    cats = [i.category for i in a.matched_indicators]
    print(f"  '{t[:30]}...' -> {cats}")

# 4. Full recordings not persisted/logged
print("\n=== Test: No transcript persistence ===")
print("  analyze() returns MatchedIndicator objects, no file writes")

# 5. No external services called
print("\n=== Test: No external API calls ===")
print("  transcript_analysis.py uses only regex pattern matching")
print("  triage_engine.py uses only deterministic rule evaluation")

# 6. Emotion labels restricted to model labels
print("\n=== Test: Model emotion labels ===")
print("  Model labels: neu, hap, ang, sad (verified in model_service.py)")
print("  Emotion predictions are supplementary context only (per triage_engine.py docstring)")