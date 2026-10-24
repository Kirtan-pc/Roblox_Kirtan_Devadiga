"""backend/main.py - Echo

FastAPI application for Echo Milestone 3A.

Provides two endpoints:
- GET  /health     — basic application status
- POST /api/v1/analyze  — WAV audio upload + model inference

Uses a singleton ModelService and AudioProcessor so model loading
happens only once at startup, not per-request.
"""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from backend.audio_processing import AudioProcessor, AudioError
from backend.model_service import ModelService

# ---------------------------------------------------------------------------
# Lifespan: load the model once on process start
# ---------------------------------------------------------------------------

model_service: ModelService | None = None
audio_processor: AudioProcessor | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model_service, audio_processor

    # Initialise once when the server starts
    model_service = ModelService()
    try:
        model_service.initialize(offline=True)
    except RuntimeError as exc:
        # Model could not be cached; mark service unready but keep running
        model_service = None  # type: ignore[assignment]

    audio_processor = AudioProcessor()

    yield  # <-- server runs here

    # Optional: clean up on shutdown (nothing persistent to close)
    model_service = None
    audio_processor = None


# ---------------------------------------------------------------------------
# FastAPI app construction
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Echo — Backend Prototype",
    version="0.1.0",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _analysis_id() -> str:
    return uuid.uuid4().hex[:12]


def _format_response(
    status: str,
    model_id: str,
    original_sample_rate: int,
    processed_sample_rate: int,
    original_channels: int,
    duration: float,
    probabilities: list[dict[str, float | str]],
    predicted_label: str,
    inference_duration_ms: float,
    analysis_id: str,
    processing_status: str = "completed",
) -> dict:
    """Build the standardised analysis response."""
    return {
        "analysis_id": analysis_id,
        "status": processing_status,
        "model_id": model_id,
        "original_input_sample_rate": original_sample_rate,
        "processed_input_sample_rate": processed_sample_rate,
        "original_input_channel_count": original_channels,
        "audio_duration_seconds": round(duration, 4),
        "model_probabilities": probabilities,
        "predicted_label": predicted_label,
        "predicted_label_score": probabilities[0]["score"] if probabilities else 0.0,
        "inference_duration_ms": round(inference_duration_ms, 2),
        "disclaimer": (
            "NOTE: This prediction is an indicative acoustic model output, "
            "not proof of psychological state, honesty, deception, or guilt."
        ),
    }


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health() -> dict:
    """Liveness / model-ready check.

    Returns the application state and whether the model has been
    loaded from its local cache.
    """
    model_ready = model_service is not None and model_service.is_ready if model_service else False

    return {
        "status": "ok" if model_ready else "degraded",
        "message": "API operational" if model_ready else "model not loaded from cache",
        "model_ready": model_ready,
    }


@app.post("/api/v1/analyze")
async def analyze_wav(file: UploadFile = File(...)) -> dict:
    """Accept a single WAV upload and return structured emotion analysis.

    The file is read entirely into memory, validated, then processed.
    The model runs only once (startup); per-request overhead is minimal.
    """
    global model_service, audio_processor

    analysis_id = _analysis_id()
    processing_status = "processing"

    # --- Basic request-level validation ---
    if model_service is None or not model_service.is_ready:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded from cache. The server started but could not initialise "
            "the speech-emotion classification model.",
        )

    if audio_processor is None:
        raise HTTPException(status_code=500, detail="Audio processor not initialised.")

    # --- Read upload into memory; do NOT trust the client filename ---
    try:
        file_bytes = await file.read()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail="Unable to read uploaded file.",
        ) from exc

    if not file_bytes:
        raise HTTPException(
            status_code=400,
            detail="Empty upload: no audio data received.",
        )

    # --- Validate and preprocess ---
    try:
        mono_waveform, audio_info = audio_processor.validate_and_preprocess(file_bytes)
    except AudioError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - avoid leaking internal details
        raise HTTPException(
            status_code=400,
            detail="Unable to process the uploaded audio.",
        ) from exc

    # --- Run inference ---
    t0 = __import__("time").perf_counter()
    try:
        result = model_service.infer(mono_waveform, audio_info.original_sample_rate)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail="Inference failed.",
        ) from exc
    t1 = __import__("time").perf_counter()
    inference_ms = (t1 - t0) * 1000.0

    # --- Build response ---
    probabilities = result["probabilities"]
    predicted_label = result["predicted_label"]

    response = _format_response(
        status="completed",
        model_id=model_service.model_id,
        original_sample_rate=audio_info.original_sample_rate,
        processed_sample_rate=audio_info.processed_sample_rate,
        original_channels=audio_info.original_channels,
        duration=audio_info.duration_seconds,
        probabilities=probabilities,
        predicted_label=predicted_label,
        inference_duration_ms=inference_ms,
        analysis_id=analysis_id,
        processing_status=processing_status,
    )

    return JSONResponse(content=response)


@app.post("/api/v1/triage")
async def triage_endpoint(transcript_data: dict) -> dict:
    """POST /api/v1/triage: analyze a transcript and return triage result."""
    transcript = transcript_data.get("transcript", "")
    from backend.transcript_analysis import get_analyzer
    from backend.triage_engine import TriageEngine
    
    analyzer = get_analyzer()
    analysis = analyzer.analyze(transcript)
    engine = TriageEngine()
    result = engine.triage(analysis)
    
    return {
        "category": result.category,
        "category_name": result.category_name,
        "explanation": result.explanation,
        "indicators": [i.phrase for i in result.indicators],
        "evidence_excerpts": result.evidence_excerpts,
        "rules_fired": result.rules_fired,
        "evidence_sources": result.evidence_sources,
        "uncertainty_notes": result.uncertainty_notes,
        "recommendation": result.recommendation,
        "disclaimer": "This assessment is based on pattern matching only and does not establish guilt or criminal intent.",
    }


# --- Global exception handler for unexpected errors ---
# Do not expose stack traces or internal paths to clients.
@app.exception_handler(Exception)
async def _global_exception_handler(request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )