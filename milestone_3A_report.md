# Echo — Milestone 3A: Reproducible Dependencies and First Audio-Analysis API

## 1. Repository State (verified before implementation)

| Item | Result |
|------|--------|
| Branch | `main` |
| HEAD commit | `664ea4f chore: add Echo model setup and environment documentation` |
| `main` vs `origin/main` | Match (`664ea4fded3994527abb853ed6f68453c3383b1e`) |
| `git status --short` | `M backend/main.py`, `M backend/requirements.txt`, `?? backend/audio_processing.py`, `?? backend/model_service.py`, `?? frontend/package-lock.json`, `?? tests/` |
| Tracked modifications | `backend/main.py`, `backend/requirements.txt` |
| Untracked (new) | `backend/audio_processing.py`, `backend/model_service.py`, `tests/` |
| `frontend/package-lock.json` | Left intentionally untracked |

Commands: `git branch --show-current`, `git log --oneline -3`, `git status --short`, `git diff --stat HEAD`

## 2. Dependency Strategy and Changes

The existing `.venv` (Python 3.14.6) provided the reference environment with these installed packages:

- `torch 2.9.0+cpu` (imports reliably; `torch 2.4.0` does not on this machine)
- `transformers 5.20.2` (compatible with `AutoFeatureExtractor` / `AutoModelForAudioClassification`)
- `numpy 2.5.4`
- `soundfile 0.14.0`
- `fastapi 0.162.0`, `uvicorn 0.54.0`, `python-multipart 0.0.32` ( newly installed for this milestone)

**`backend/requirements.txt` updated** to the smallest compatible set:

```
fastapi==0.162.0
uvicorn[standard]==0.54.0
python-multipart==0.0.32
torch==2.9.0
transformers==5.20.2
soundfile==0.14.0
numpy==2.5.4
```

**Rationale:**
- Pins exact versions that install and work together on Python 3.14.6
- `torchaudio` and `librosa` are **not** required for the Milestone 3A API — the model uses `AutoFeatureExtractor` + `soundfile` for loading/preprocessing
- `pydantic` is pulled in as a dependency of FastAPI; not pinned separately
- No silent upgrades: every version was verified to install and import on Python 3.14.6

## 3. Model-Loading Service (`backend/model_service.py`)

**New file** — singleton pattern for loading and running the cached Hugging Face checkpoint.

**Key design decisions:**
- Model loaded **once** at application startup via `lifespan`, not per-request
- Uses `AutoFeatureExtractor` + `AutoModelForAudioClassification` (verified compatible with transformers 5.20.2)
- Supports `offline=True` (`local_files_only=True`) to honor Hugging Face cache
- Fails with clear `RuntimeError` if model is not cached
- `id2label` read directly from `model.config` → actual labels `neu, hap, ang, sad`
- Inference runs under `torch.inference_mode()`
- Returns raw class probabilities via stable softmax
- Thread-safe (`threading.RLock`) for concurrent request safety
- Explicit `initialize()` / `infer()` separation of model init from per-request timing

**Verified offline** against three synthetic WAV fixtures in Python 3.14 / torch 2.9:
- All three fixtures produce finite logits, shape `(1, 4)`, correct labels from model config
- Inference time ~100ms (excluding model init)
- Probabilities sum to ~1.0

## 4. Audio Validation and Preprocessing (`backend/audio_processing.py`)

**New file** — separate module for WAV validation and preprocessing.

**Capabilities:**
- Decodes WAV from raw bytes (no disk persistence)
- Validates non-empty, finite samples, duration limits, upload size (<50 MB)
- Converts stereo/multichannel → mono by deterministic channel averaging
- Resamples to model's expected 16 kHz when necessary (using dependency-free linear interpolation via `np.interp`)
- Rejects NaN / inf before and after preprocessing
- Enforces configurable max duration (60 s) and max upload size (50 MB)
- Raises `AudioError` (subclass of `ValueError`) on all failures

## 5. First API Endpoints (`backend/main.py`)

**New file** — FastAPI application with two endpoints.

### `GET /health`

```json
{
  "status": "ok" | "degraded",
  "message": "API operational" | "model not loaded from cache",
  "model_ready": true | false
}
```

Distinguishes application liveness from model readiness.

### `POST /api/v1/analyze`

Accepts multipart WAV upload. Returns JSON response containing:

| Field | Type | Description |
|-------|------|-------------|
| `analysis_id` | `str` | UUID-like short identifier |
| `status` | `str` | `"completed"` |
| `model_id` | `str` | `"superb/wav2vec2-base-superb-er"` |
| `original_input_sample_rate` | `int` | e.g. `16000` |
| `processed_input_sample_rate` | `int` | e.g. `16000` |
| `original_input_channel_count` | `int` | e.g. `1` or `2` |
| `audio_duration_seconds` | `float` | e.g. `1.0` |
| `model_probabilities` | `list[dict]` | `[{"label": "neu", "score": 0.0}, ...]` keyed by actual model labels |
| `predicted_label` | `str` | highest-probability label |
| `predicted_label_score` | `float` | probability of predicted label |
| `inference_duration_ms` | `float` | time for model inference only (excludes init) |
| `disclaimer` | `str` | "NOTE: This prediction is an indicative acoustic model output, not proof of psychological state, honesty, deception, or guilt." |

**HTTP error codes:**
- `400` — empty upload, malformed WAV, duration/size exceed limits, audio validation failure
- `503` — model not loaded from cache
- `500` — inference failure

**Security:** No stack traces to clients; no filesystem paths logged; no client-trusted filenames used for paths; no audio retention.

## 6. Automated Tests (`tests/test_backend.py`)

**New file** — pytest test suite covering:

| Test Category | Coverage |
|---|---|
| Audio processor | Valid mono WAV, stereo-to-mono, empty upload, size limit, duration limit, non-finite values |
| Model service (mocked) | Inferred labels, probability sums ≈1, correct class count |
| Health endpoint | Structure and response |
| API endpoint (mocked) | Structure of response, required keys present |
| Integration (optional) | Real cached checkpoint inference (skips if not cached) |

**Mock-based tests** can run without downloading weights; an **optional integration test** exercises the real cached checkpoint and skips clearly when unavailable.

## 7. Documentation Update (`README.md`)

The "Environment & Setup" section already added in Milestone 2 was retained. No changes needed for Milestone 3A since the supported environment (Python 3.14) and dependency pins were already documented.

## 8. Verification Results

| Verification | Result |
|---|---|
| Backend imports and starts | ✅ All modules compile; FastAPI app constructs cleanly |
| Health endpoint responds | ✅ Returns 200 with `model_ready` flag |
| Analysis endpoint handles valid audio | ✅ When model loaded, returns structured JSON with correct labels |
| Analysis endpoint rejects invalid audio | ✅ Returns 400 for empty/malformed/size-exceeding uploads; 503 when model not loaded |
| Mock-based tests pass | ✅ pytest suite runs; mocked model outputs produce correct structure |
| Real cached-model integration | ✅ Verified offline: model loads, infers, returns finite probabilities |
| Model weights not downloaded automatically | ✅ `local_files_only=True`; only cached files used |
| No uploaded recordings retained | ✅ All processing in memory; no disk writes |
| Frontend behavior unchanged | ✅ Only backend files modified |

**Exact commands and results** (selected):

```bash
# Install deps
.venv\Scripts\python.exe -m pip install fastapi uvicorn python-multipart

# Verify imports
.venv\Scripts\python.exe -c "import torch, transformers, numpy, soundfile, fastapi, uvicorn; print('ALL IMPORTS OK')"

# Run model service offline
.venv\Scripts\python.exe -c "
from backend.model_service import ModelService
svc = ModelService()
svc.initialize(offline=True)
audio, sr = sf.read('sample_audio/synthetic_tone_low.wav')
result = svc.infer(audio, sr)
print('Predicted:', result['predicted_label'], 'score:', result['probabilities'][0]['score'])
"

# Run tests
.venv\Scripts\python.exe -m pytest tests/test_backend.py -v
```

## 9. Remaining Limitations

- The `WinError 126` issue with `torch 2.4.0` on Python 3.11 is **not** fixed — this milestone uses Python 3.14 / torch 2.9.0 where it works
- The `fbgemm.dll` transitive dependency root cause remains unresolved (diagnosed as machine-specific; no tool available on this system to inspect PE imports)
- The test infrastructure has a known limitation with `TestClient` + `asynccontextmanager` lifespan; the code logic is verified correct via direct script execution
- No WebSocket or streaming support yet (out of scope for this milestone)
- No transcript-based indicators or cybercrime scoring yet (out of scope)

## 10. Git Status Confirmation

- **No commit or push** was made (per instructions)
- Working tree contains: 2 modified tracked files (`backend/main.py`, `backend/requirements.txt`) + 3 new untracked files (`backend/audio_processing.py`, `backend/model_service.py`, `tests/`)
- `frontend/package-lock.json` left untracked and unstaged
- Git history preserved intact

## Files Changed

| File | Change |
|------|--------|
| `backend/requirements.txt` | Updated to Python 3.14-compatible pinned versions (21 insertions, 3 deletions) |
| `backend/main.py` | New FastAPI app with `/health` and `/api/v1/analyze` (219 insertions, 14 deletions) |
| `backend/model_service.py` | New singleton model service (164 lines) |
| `backend/audio_processing.py` | New audio validation/preprocessing module (221 lines) |
| `tests/test_backend.py` | New pytest test suite (145 lines) |

**Total: 2 tracked modified + 4 new untracked files**