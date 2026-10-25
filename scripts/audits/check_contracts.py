from backend.audio_processing import AudioProcessor
from backend.transcript_analysis import TranscriptAnalyzer, get_analyzer

# Audio analysis input/output contract
print("=== AUDIO ANALYSIS CONTRACT ===")
proc = AudioProcessor()
# Input: raw audio bytes
# Output: emotion probabilities (neu, hap, ang, sad) or error
print("  Input: WAV audio bytes")
print("  Output: dict with probabilities, predicted_label, or HTTP 503 if model unavailable")

# Transcript analysis input/output contract
print("\n=== TRANSCRIPT ANALYSIS CONTRACT ===")
analyzer = get_analyzer()
analysis = analyzer.analyze("The CBI will arrest your account.")
print("  Input: str (transcript text)")
print("  Output: TranscriptAnalysis with matched_indicators list")
print("  Categories: authority_impersonation, digital_arrest_threat, urgent_payment_demand,")
print("            otp_credential_request, remote_access_request, unauthorized_transfer,")
print("            threats_intimidation")

# Can they be composed without changing endpoints?
print("\n=== COMPOSABILITY ===")
print("  - Audio and transcript analysis use separate endpoints (/api/v1/analyze vs /api/v1/triage)")
print("  - No shared state needed between the two analyzers")
print("  - Both are deterministic and explainable")
print("  - Both can be called independently via the FastAPI app")

# What STT component would be needed
print("  - Would convert audio to text for transcript analysis")
print("  - Would NOT change existing endpoints; would feed text into /api/v1/triage")

# Local vs external
print("  - WAV2Vec2 base model runs locally (already cached: superb/wav2vec2-base-superb-er)")
print("  - No external API calls needed for transcription")
print("  - Recordings stay on client device; only text is processed")
print("  - Live streaming would require microphone input pipeline")

# Feasibility with existing environment
print("  - Uploaded WAV transcription IS feasible with existing environment")
print("  - The model superb/wav2vec2-base-superb-er is already cached and functional")
print("  - Transcript analysis can run on the transcribed text immediately after")
print("  - Live microphone streaming would require additional ALSA/PortAudio setup")