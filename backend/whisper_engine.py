import io
import time
from faster_whisper import WhisperModel

_whisper_model = None

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        print("Initializing faster-whisper (base model)...")
        _whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    return _whisper_model

HINGLISH_PROMPT = (
    "Indian 1930 Cyber Helpline call in Hinglish Hindi-English code-switching: "
    "OTP, transfer, bank account, paise cut gaye, CBI officer, digital arrest, "
    "police, FD tod, video call, blackmail, hacked, supreme court, scam."
)

def transcribe_audio_bytes(audio_bytes: bytes) -> dict:
    """
    Fallback server-side ASR using faster-whisper.
    Ensures task='transcribe' so no unwanted translation occurs.
    Uses HINGLISH_PROMPT to encourage Latin Hinglish transcription.
    """
    try:
        model = get_whisper_model()
        bio = io.BytesIO(audio_bytes)
        
        # task='transcribe' guarantees it will NEVER translate to English/another language
        segments_gen, info = model.transcribe(
            bio,
            beam_size=2,
            task="transcribe",
            initial_prompt=HINGLISH_PROMPT
        )
        
        segments = []
        for s in segments_gen:
            clean_text = s.text.strip()
            if clean_text:
                segments.append({
                    "start": round(s.start, 2),
                    "end": round(s.end, 2),
                    "text": clean_text
                })
        
        full_transcript = " ".join([s["text"] for s in segments]).strip()
        return {
            "transcript": full_transcript,
            "language": info.language,
            "segments": segments
        }
    except Exception as e:
        print("Whisper fallback transcription error:", e)
        return {
            "transcript": "",
            "language": "unknown",
            "segments": []
        }
