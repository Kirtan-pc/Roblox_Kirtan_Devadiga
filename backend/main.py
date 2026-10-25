import os
import time
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

try:
    from audio_engine import process_audio_bytes, ser_classifier
    from decision_matrix import evaluate_call_urgency
    from whisper_engine import transcribe_audio_bytes
except ImportError:
    from backend.audio_engine import process_audio_bytes, ser_classifier
    from backend.decision_matrix import evaluate_call_urgency
    from backend.whisper_engine import transcribe_audio_bytes

app = FastAPI(title="SENTINEL-VOICE 1930 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAMPLE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "sample_audio"))

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "model": "superb/wav2vec2-base-superb-er",
        "stt_primary": "Browser Web Speech API (en-IN)",
        "stt_fallback": "faster-whisper-base-int8",
        "window_config": "3s_window_1s_stride",
        "model_ready": True
    }

@app.get("/verify-neural-network")
def verify_neural_network():
    """Inspects the loaded PyTorch transformer neural network model."""
    try:
        model = ser_classifier.model
        total_params = sum(p.numel() for p in model.parameters())
        num_layers = len(model.wav2vec2.encoder.layers)
        hidden_size = model.config.hidden_size
        num_heads = model.config.num_attention_heads
        id2label = model.config.id2label
        return {
            "is_neural_network_genuine": True,
            "model_identifier": "superb/wav2vec2-base-superb-er",
            "model_architecture": model.__class__.__name__,
            "total_trainable_parameters": total_params,
            "parameters_millions": round(total_params / 1e6, 2),
            "transformer_layers": num_layers,
            "hidden_dimension": hidden_size,
            "attention_heads": num_heads,
            "target_emotions": list(id2label.values()),
            "status": "LOADED_IN_RAM_READY_FOR_INFERENCE"
        }
    except Exception as e:
        return {"is_neural_network_genuine": False, "error": str(e)}

@app.post("/analyze-call")
async def analyze_call_endpoint(
    file: UploadFile = File(...),
    transcript: str = Form(""),
    caller_id: str = Form("1930-CALLER")
):
    """
    Dual-Stream Ingestion:
    Stream A: 3s-sliding-window Wav2Vec2 paralinguistic SER + physical biomarkers (RMS/ZCR/F0).
    Stream B: Lexical Stream with Two-Tier Transcription:
      1. Primary: Browser native Web Speech API (en-IN) for live Hinglish/English.
      2. Fallback: Server-side faster-whisper (Base model, int8 CPU) if browser STT is empty.
    """
    start_t = time.time()
    audio_bytes = await file.read()
    
    # 1. Acoustic Paralinguistic SER + Forensic Acoustics
    acoustic_res = process_audio_bytes(audio_bytes)
    dur = acoustic_res.get("forensic_acoustics", {}).get("duration_sec", 6.0)
    
    # 2. Dual-Tier Transcription Logic
    browser_text = (transcript or "").strip()
    
    if browser_text:
        # PRIMARY STT: Captured live by Browser Native Web Speech API (en-IN)
        final_transcript = browser_text
        stt_source = "Browser Native Web Speech API (en-IN) [Primary]"
        detected_lang = "en-IN (Hinglish)"
        
        # Split browser transcript into interactive readable segments across duration
        words = browser_text.split()
        if len(words) > 10:
            mid = len(words) // 2
            segments = [
                {"start": 0.0, "end": round(dur * 0.5, 1), "text": " ".join(words[:mid])},
                {"start": round(dur * 0.5, 1), "end": dur, "text": " ".join(words[mid:])}
            ]
        else:
            segments = [{"start": 0.0, "end": dur, "text": browser_text}]
    else:
        # FALLBACK STT: Browser STT empty/unsupported -> Run Server-Side faster-whisper
        whisper_res = transcribe_audio_bytes(audio_bytes)
        final_transcript = whisper_res.get("transcript", "").strip()
        stt_source = "Server-Side faster-whisper [Fallback]"
        detected_lang = whisper_res.get("language", "en")
        segments = whisper_res.get("segments", [])
        if not segments and final_transcript:
            segments = [{"start": 0.0, "end": dur, "text": final_transcript}]

    # 3. Decision Matrix Evaluation
    evaluation = evaluate_call_urgency(acoustic_res, final_transcript)
    evaluation["caller_id"] = caller_id
    evaluation["transcript"] = final_transcript or "(No verbal speech detected - classified via Pure Acoustic Stream)"
    evaluation["transcript_segments"] = segments
    evaluation["stt_source"] = stt_source
    evaluation["detected_language"] = detected_lang
    evaluation["latency_ms"] = int((time.time() - start_t) * 1000)
    return evaluation

@app.post("/simulate-preset")
async def simulate_preset_scenario(scenario_id: str = Form(...)):
    """
    Stage-1 Queue Triage & Multi-Crime Simulator with forensic timestamped segments.
    """
    scenarios = {
        "calm": {
            "file": "01_calm_inquiry.wav",
            "caller_id": "+91-98201-11029",
            "transcript": "Namaste sir, mera purana cyber complaint status check karna tha portal pe.",
            "segments": [
                {"start": 0.0, "end": 2.8, "text": "Namaste sir, mera purana cyber complaint status"},
                {"start": 2.8, "end": 5.9, "text": "check karna tha portal pe."}
            ]
        },
        "panic": {
            "file": "02_panicked_fraud.wav",
            "caller_id": "+91-99114-55812",
            "transcript": "Sir jaldi bachao! Mera OTP chala gaya aur bank account se 4 lakh rupaye transfer ho gaye!",
            "segments": [
                {"start": 0.0, "end": 2.6, "text": "Sir jaldi bachao! Mera OTP chala gaya"},
                {"start": 2.6, "end": 5.8, "text": "aur bank account se 4 lakh rupaye transfer ho gaye!"}
            ]
        },
        "coercion": {
            "file": "03_fake_calm_coercion.wav",
            "caller_id": "+91-97650-33901",
            "transcript": "Sir main dheere bol raha hoon, CBI officer ne video call pe digital arrest kiya hai, FD todne bol rahe hain.",
            "segments": [
                {"start": 0.0, "end": 1.9, "text": "Sir main dheere bol raha hoon,"},
                {"start": 1.9, "end": 4.1, "text": "CBI officer ne video call pe digital arrest kiya hai,"},
                {"start": 4.1, "end": 5.9, "text": "FD todne bol rahe hain."}
            ]
        },
        "angry": {
            "file": "04_angry_non_urgent.wav",
            "caller_id": "+91-91234-77410",
            "transcript": "This is ridiculous! My broadband Wi-Fi router has been blinking red for two days!",
            "segments": [
                {"start": 0.0, "end": 2.8, "text": "This is ridiculous! My broadband Wi-Fi router"},
                {"start": 2.8, "end": 5.9, "text": "has been blinking red for two days!"}
            ]
        },
        "sextortion": {
            "file": "05_sextortion_distress.wav",
            "caller_id": "+91-96500-99214",
            "transcript": "Sir woh log mera morphed nude video leak karne ki threat de rahe hain, blackmail kar rahe hain, main suicide kar lunga!",
            "segments": [
                {"start": 0.0, "end": 2.3, "text": "Sir woh log mera morphed nude video leak karne ki threat de rahe hain,"},
                {"start": 2.3, "end": 4.4, "text": "blackmail kar rahe hain,"},
                {"start": 4.4, "end": 5.9, "text": "main suicide kar lunga!"}
            ]
        }
    }

    cfg = scenarios.get(scenario_id, scenarios["calm"])
    wav_path = os.path.join(SAMPLE_DIR, cfg["file"])

    start_t = time.time()
    with open(wav_path, "rb") as f:
        audio_bytes = f.read()

    acoustic_res = process_audio_bytes(audio_bytes)
    evaluation = evaluate_call_urgency(acoustic_res, cfg["transcript"])
    evaluation["caller_id"] = cfg["caller_id"]
    evaluation["transcript"] = cfg["transcript"]
    evaluation["transcript_segments"] = cfg["segments"]
    evaluation["stt_source"] = "Pre-recorded Ground Truth"
    evaluation["detected_language"] = "en-IN (Hinglish)"
    evaluation["latency_ms"] = int((time.time() - start_t) * 1000)
    return evaluation
