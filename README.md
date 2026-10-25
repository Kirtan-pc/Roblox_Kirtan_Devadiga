# ECHO: Dual-Stream Acoustic Paralinguistic Triage Engine

> **AI-Powered Real-Time Speech Emotion Recognition & Urgency Triage for India's 1930 Cyber Helpline (I4C / CFCFRMS)**  
> *Developed by Team Roblox (Kirtan Devadiga) & Vecna Verse*

---

<p align="center">
  <img src="frontend/public/echo-logo.png" alt="ECHO Official Emblem" width="180" />
</p>

<p align="center">
  <b>ECHO</b> (Emotional & Cognitive Helpline Optimization) is a state-of-the-art dual-stream triage engine purpose-built for India's <b>National Cyber Crime Helpline 1930</b> operated by the <b>Indian Cybercrime Coordination Centre (I4C, MHA)</b> and integrated with the <b>Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS)</b>.
</p>

---

## 1. The Challenge & The "Golden Hour"

In financial cyber fraud, the first **2 to 3 hours ("The Golden Hour")** dictate whether stolen funds can be successfully frozen in beneficiary bank accounts or lost forever through multi-layered mule transfers and crypto off-ramping. 

1930 helpline operators face severe cognitive bottlenecks:
- **Static FIFO Queues:** Desperate emergency victims are queued behind non-urgent queries.
- **The "Fake Calm" Digital Arrest Paradox:** Coerced victims held under scammer video surveillance whisper in low, calm, hushed voices. Keyword-only or pitch-only models miss them entirely.
- **The Angry False Alarm:** Frustrated callers venting about minor e-commerce delays scream loudly, triggering false-positive alerts that divert critical resources.

---

## 2. Core Architecture: Dual-Stream Late Fusion

ECHO employs a proprietary **Dual-Stream Late-Fusion Architecture** that processes acoustic physical paralinguistics and semantic lexical intent in parallel:

```
                             [ INCOMING 1930 AUDIO STREAM ]
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
       [ STREAM A: ACOUSTIC ]                           [ STREAM B: LEXICAL ]
  3s Sliding Windows (1s Stride)                     Hinglish Code-Switching ASR
  ├── Wav2Vec 2.0 (94.57M params)                    ├── Real-Time Speech Tokens
  │   ├── superb/wav2vec2-base-superb-er             ├── Financial Fraud Entities
  └── Librosa Biomarker Extraction                   ├── Digital Arrest State Impersonation
      ├── RMS Vocal Energy & SPL Peak                └── Sextortion & Self-Harm Safety
      ├── F0 Pitch Tracking (PYIN)
      ├── ZCR Volatility
      └── HNR (Harmonics-to-Noise dB)
                   │                                               │
                   └───────────────────────┬───────────────────────┘
                                           ▼
                       [ 6-TIER PIECEWISE DECISION MATRIX ]
                           Urgency Score (0 - 100)
                                           │
        ┌──────────────────────────────────┴──────────────────────────────────┐
        ▼                                                                     ▼
[ TIER 1: EMERGENCY ESCALATION ]                                  [ TIER 6: STANDARD QUEUE ]
Score 85-100 (Golden Hour Freeze)                                 Score 0-35 (Standard FIFO)
```

### Key Technical Pillars:
1. **Stream A (Acoustic Paralinguistics):** Evaluates speech in 3.0-second sliding windows with 1.0-second stride. Uses `superb/wav2vec2-base-superb-er` with Librosa acoustic physical biomarkers ($F_0$ pitch tracking, ZCR variance, RMS energy, and HNR). It detects **Fear, Anger, Distress, and Nervousness** independent of caller language, dialect, or accent.
2. **Stream B (Cumulative Lexical Intent):** Transcribes code-switched Hindi-English (Hinglish) tokens, detecting high-risk cyber fraud markers (*CBI, Digital Arrest, Police Station, OTP, Screen Share, Account Freeze, Suicide, Video Leak*).
3. **6-Tier Piecewise Decision Matrix:** Resolves psychological contradictions. If a victim whispers under scammer surveillance (low vocal energy) but utters state impersonation keywords, ECHO automatically overrides the calm voice and assigns a **Score 96 Golden Hour Alert**, instantly catapulting the call to Rank #1.

---

## 3. System Modules & Features

| Module | Route | Functionality |
| :--- | :--- | :--- |
| **1930 Console** | `/` | **Session Detail Tab:** Live audio ingestion, waveform/spectrogram, live mic stream with real-time Hinglish transcript, 5 preset hackathon simulation scenarios.<br>**Forensic Workbench Tab:** Deep-dive $F_0$ baseline trajectory, jitter clusters, HNR dB, peak SPL, and 3-second sliding window breakdown. |
| **Priority Queue** | `/queue` | Auto-sorted descending by Late-Fusion Urgency Score. Supervisors can click any call to immediately inspect in 1930 Console. |
| **Operations Telemetry** | `/operations` | Macro shift metrics, average triage latency SLA (<450ms), queue distribution, and CFCFRMS gateway links. |
| **System Health** | `/health` | Live diagnostic querying `/health` and `/verify-neural-network` to verify the 94.57M Wav2Vec 2.0 neural network weights. |
| **Audit & Privacy** | `/audit` | DPDP Act 2023 compliance, transient RAM processing proof, and BSA 2023 evidentiary disclaimers. |

---

## 4. Repository Structure

```
Roblox_Kirtan_Devadiga/
├── backend/                        # FastAPI AI Microservice
│   ├── audio_engine.py             # 3s Sliding Window & Acoustic Biomarkers
│   ├── decision_matrix.py          # 6-Tier Piecewise Decision Matrix
│   ├── download_models.py          # Offline Model Preloader
│   ├── generate_samples.py         # Synthetic Scenario WAV Generator
│   ├── main.py                     # API Routes & WebSockets
│   ├── model_service.py            # Wav2Vec 2.0 & PyTorch Inference
│   ├── whisper_engine.py           # Whisper Lexical ASR Engine
│   └── requirements.txt            # Python Dependencies
├── frontend/                       # Vite + React + Tailwind Tactical UI
│   ├── public/                     # Static Assets & echo-logo.png
│   ├── src/
│   │   ├── components/             # Reusable UI & Forensic Components
│   │   ├── layouts/                # ApplicationShell & TopUtilityBar
│   │   ├── pages/                  # 1930 Console, Queue, Operations, Health, Audit
│   │   └── store/                  # Global Triage Zustand Store
│   ├── index.html                  # App Entrypoint
│   └── package.json                # Frontend Dependencies
├── sample_audio/                   # 5 Hackathon Simulation Scenarios (.wav)
│   ├── 01_calm_inquiry.wav         # Baseline Standard Inquiry (Score: ~18)
│   ├── 02_panicked_fraud.wav       # Financial OTP Fraud (Score: ~88)
│   ├── 03_fake_calm_coercion.wav   # Digital Arrest Paradox (Score: ~96)
│   ├── 04_angry_non_urgent.wav     # Angry False Alarm (Score: ~24)
│   └── 05_sextortion_distress.wav  # Critical Life-Safety Sextortion (Score: ~98)
├── tests/                          # Automated PyTest Test Suite
│   ├── test_backend.py             # Endpoint & Contract Verification
│   └── test_milestone3b.py         # 6-Tier Matrix & Stress Tests
├── .env.example                    # Sample Environment Configuration
├── .gitignore                      # Git Ignore Configuration
└── README.md                       # Project Documentation
```

---

## 5. Quick Start Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **FFmpeg** (recommended for audio processing)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Pre-download AI models and generate synthetic scenario audio
python download_models.py
python generate_samples.py

# Launch FastAPI backend server
uvicorn main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000` with Swagger docs at `http://127.0.0.1:8000/docs`.

### Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install node dependencies
npm install

# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Pre-Submission Verification & Audit

| Verification Check | Procedure | Expected Result |
| :--- | :--- | :--- |
| **Zero-Internet Fallback** | Disconnect Wi-Fi/Internet for 15s and trigger any preset simulation. | All 5 presets return inference in `<450ms` using local `./models_cache`. |
| **3s Sliding Window Inspection** | Go to 1930 Console > Forensic Workbench. | Displays 4 distinct 3-second slices (`0.0s-3.0s` to `3.0s-6.0s`) with peak acoustic energy highlighting. |
| **Live Mic Hinglish Ingestion** | Click **Start Live Mic Call**, speak: *"Sir CBI digital arrest bol rahe hain, OTP chala gaya"*, click **Stop & Run Triage**. | Real-time transcript streams word-by-word; backend flags entities and triggers Golden Hour alert. |
| **Repository Cleanliness** | Run `git status` in terminal. | No `node_modules/`, `venv/`, or heavy `models_cache/` appear in git status. |

---

## 7. Responsible AI, Ethics & Legal Framework

1. **Indicative Triage Signal Only:** ECHO's emotion predictions and urgency indices are strictly operational prioritization indicators to assist human helpline officers during the Golden Hour. They are never definitive legal proof of caller guilt, innocence, or intent.
2. **DPDP Act 2023 Compliance:** Incoming audio streams are ingested in a 3-second FIFO ring buffer in RAM and are never permanently persisted in unencrypted form on disk without explicit operator authorization.
3. **BSA 2023 Electronic Evidence Guardrails:** All forensic paralinguistic parameters ($F_0$ pitch, HNR, ZCR) conform to Section 63 electronic records standards, ensuring clear metadata chains of custody.

---

## 8. License & Acknowledgements

Developed for India's Cyber Crime Helpline 1930 and CFCFRMS under the **Smart India Hackathon (SIH)** framework.  
*Team Roblox: Kirtan Devadiga & Vecna Verse.*
