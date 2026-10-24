# 🛡️ SENTINEL-VOICE: Real-Time Speech Emotion & Urgency Triage Engine for Cybercrime Response

[![Status](https://img.shields.io/badge/Status-Active_Development-brightgreen.svg)]()
[![Domain](https://img.shields.io/badge/Domain-Cybersecurity_%7C_Law_Enforcement-blue.svg)]()
[![Python](https://img.shields.io/badge/Backend-FastAPI_%7C_PyTorch-yellow.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React_%7C_TailwindCSS-cyan.svg)]()
[![Ethics](https://img.shields.io/badge/AI_Ethics-Decision_Support_Only-purple.svg)]()

> **Assisting Law Enforcement During the "Golden Hour" of Cyber Response through Real-Time Paralinguistic & Lexical Intelligence.**

---

## 📌 Problem Statement & Operational Reality

Cybercrime police and helpline operators (such as India's **1930 National Cyber Crime Helpline** and **Dial 112 ERSS**) handle thousands of calls daily involving distressed victims, suspected fraudsters, and informants. During high-volume windows, recognizing acute emotional distress, coercion (e.g., *Digital Arrest* scams), or financial urgency is exceedingly difficult due to operator cognitive fatigue, ambient noise, and regional code-switching (Hinglish).

Currently, call prioritization relies purely on human instinct and a **First-In, First-Out (FIFO)** queue. There is zero automated acoustic emotion tracking. As a result, high-stakes victims often wait in queues or struggle to articulate 12-digit UTR numbers, losing the critical **"Golden Hour"** (the initial 60-minute window where bank APIs can freeze funds before mule dispersal).

### 🎯 Objective
**SENTINEL-VOICE** is a lightweight, real-time Speech Emotion Recognition (SER) and Lexical Triage co-pilot that taps into live telephony streams or recorded forensic audio to:
1. Classify four core vocal emotional indicators: **Fear, Anger, Distress, and Nervousness**.
2. Compute a dynamic **Dispatch Urgency Score ($0\text{--}100$)** to prioritize critical calls in real time.
3. Assist Investigating Officers (IOs) in scrubbing recorded interrogation/extortion tapes for emotional spikes.
4. Uphold strict ethical guardrails by treating emotion scores strictly as **indicative triage signals**, never as legal evidence of guilt, honesty, or deception.

---

## 👥 Target Users & Personas

| Persona | Role in Cyber Ecosystem | Current Workflow & Pain Point | How SENTINEL-VOICE Helps |
| :--- | :--- | :--- | :--- |
| **1. Call Takers (1930 / Dial 112)** | Frontline operators logging incidents into the NCRP / CFCFRMS portal. | Juggle 50+ waiting calls; suffer from compassion fatigue; rely on manual typing while calming hysterical callers. | Live confidence meters and automated **Golden Hour Alerts** highlight critical callers immediately. |
| **2. Floor Supervisors (Nodal Officers)** | Police inspectors managing call center queues and green-lighting bank freeze requests. | Blind to ongoing calls unless an operator physically waves them over. | Master **Supervisor Triage Matrix** dynamically reorders active calls by real-time distress levels. |
| **3. Investigating Officers (IOs)** | Detectives at Cyber Police Stations analyzing seized audio and interrogating mules. | Spend hours manually listening to long audio recordings to find moments of coercion or panic. | **Forensic Timeline Scrubber** plots an emotional seismic wave over `.wav` files to jump straight to distress peaks. |

---

## 🏗️ System Architecture & Telephony Integration

### 1. Real-World Police Telephony Tap (Production Ready)
Modern police command centers do not use analog landlines; they operate on **IP-PBX systems** (Asterisk, FreeSWITCH, Cisco Unified CM) where officers use PC Softphones connected to the **NCRP/CFCFRMS web portal**. 
* **Passive SIP REC / RTP Forking:** SENTINEL-VOICE connects passively to the IP-PBX via a media-forking bridge, duplicating the live caller audio stream ($8\text{ kHz}$/$16\text{ kHz}$ PCM) to our FastAPI inference engine without interrupting the officer's headset.
* **Hackathon Simulation:** Uses the browser's `MediaDevices.getUserMedia()` Web Audio API and virtual audio routing to capture live microphone and system call audio directly in the browser.

### 2. Dual-Stream Hybrid Inference Pipeline

```text
                       [ Incoming Telephony / Mic Audio Stream ]
                                           │
                                           ▼
                      [ 16kHz Resampling & WebRTC VAD Filter ]
                                           │
                         ┌─────────────────┴─────────────────┐
                         ▼                                   ▼
            [ Stream A: Acoustic SER ]          [ Stream B: Lexical Risk ]
          (3s Sliding Window, 1s Stride)        (Chunked Audio Buffer)
                         │                                   │
                         ▼                                   ▼
           Wav2Vec 2.0 / XLSR Checkpoint        Fast ASR (Whisper / Sarvam AI)
           Language-Agnostic Biomarkers         Hinglish Code-Switching STT
          (Pitch Jitter, Shimmer, Tremor)                    │
                         │                                   ▼
                         │                         Cyber Threat Keyword NLP
                         │                      (OTP, CBI, Arrest, Freeze, Lakh)
                         └─────────────────┬─────────────────┘
                                           ▼
                             [ Late-Fusion Urgency Engine ]
                                           │
                   ┌───────────────────────┴───────────────────────┐
                   ▼                                               ▼
      [ 4-Class Emotion Vector ]                      [ Composite Urgency Index ]
      • Fear        (0.00 - 1.00)                     Score: 0 - 100
      • Anger       (0.00 - 1.00)                     Status: NORMAL | ELEVATED | CRITICAL
      • Distress    (0.00 - 1.00)
      • Nervousness (0.00 - 1.00)
                   │                                               │
                   └───────────────────────┬───────────────────────┘
                                           ▼
                           [ FastAPI WebSocket JSON Broadcast ]
                                           │
                                           ▼
                           [ React + Tailwind Police Dashboard ]
```

### 3. Mathematical Formulation (Late-Fusion Scoring)
Because rural and panicked callers frequently switch dialects (Hinglish, regional vernacular), pure text sentiment fails. Our scoring engine prioritizes **Acoustic Paralinguistics ("How it is said")** over **Lexical Semantics ("What is said")**:

$$\text{UrgencyScore} = \text{clip}\left( \left( \alpha \cdot P_{\text{Distress}} + \beta \cdot P_{\text{Fear}} + \gamma \cdot P_{\text{Anger}} + \delta \cdot S_{\text{LexicalRisk}} \right) \times 100, \, 0, \, 100 \right)$$

Where default operational weights are set to:
* $\alpha = 0.40$ (Acoustic Distress weight)
* $\beta = 0.30$ (Acoustic Fear weight)
* $\gamma = 0.10$ (Acoustic Anger weight)
* $\delta = 0.20$ (Lexical Cyber-Threat Multiplier: triggered by terms like *"Digital Arrest"*, *"CBI"*, *"OTP"*, *"Suicide"*, *"Account Empty"*)

---

## ✨ Key Features & USPs

* **⚡ Live Telemetry Dashboard:** Real-time waveform visualization and sliding-window confidence gauges updating every $1\text{ second}$.
* **🚨 Dynamic "Golden Hour" Queue:** Automatically promotes calls crossing an Urgency Score of $\ge 75$ to the top of the supervisor's dispatch board.
* **🗣️ Language-Agnostic Acoustic Resilience:** Evaluates vocal cord tremors, hyperventilation, and pitch jitter directly from raw waveforms, remaining immune to transcription failures across Indian accents.
* **🔍 Post-Call Forensic Audio Scrubber:** Upload recorded extortion or interrogation `.wav`/`.mp3` files to generate a timestamped emotional heatmap for rapid evidence review.
* **⚖️ Responsible AI & Privacy Guardrails:** 
  * **Zero Raw Audio Persistence:** Live audio chunks are processed transiently in RAM and discarded immediately after inference.
  * **Explicit Non-Evidentiary Banner:** Permanent UI watermarks enforce that emotion predictions are strictly operational triage aids, not polygraphs or legal proof of guilt.

---

## 🛠️ Tech Stack

* **Machine Learning & Audio Processing:**
  * `PyTorch` & `HuggingFace Transformers` (`wav2vec2-base-superb-er` / `wav2vec-english-speech-emotion-recognition`)
  * `OpenAI Whisper` (`whisper-tiny` / `whisper-base`) / `Sarvam AI API` (for Hinglish ASR)
  * `Librosa`, `PyDub`, `NumPy` (16kHz PCM resampling & rolling buffer slicing)
* **Backend & Streaming:**
  * `FastAPI` (Python 3.10+)
  * `WebSockets` (`uvicorn` asynchronous bidirectional streaming)
* **Frontend Interface:**
  * `React.js` (Vite)
  * `Tailwind CSS` & `Lucide Icons` (Dark-mode police command center UI)
  * `Recharts` / `Chart.js` (Live telemetry & forensic timeline plots)

---

## 📂 Repository Structure

```text
sentinel-voice/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI server & WebSocket endpoints (/ws/analyze-stream)
│   │   ├── model_engine.py      # Wav2Vec 2.0 + Lexical fusion inference pipeline
│   │   ├── audio_utils.py       # 16kHz mono resampling & 3s sliding window buffer
│   │   └── schemas.py           # Pydantic data models for telemetry payloads
│   ├── sample_audio/            # Pre-recorded test cases (Distress, Calm, Extortion)
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveTelemetry.jsx    # Real-time emotion gauges & waveform
│   │   │   ├── TriageQueue.jsx      # Dynamic supervisor priority queue
│   │   │   ├── ForensicScrubber.jsx # Post-call recorded audio analyzer
│   │   │   └── EthicsBanner.jsx     # Responsible AI compliance notice
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* **Python** $\ge 3.10$
* **Node.js** $\ge 18.0$
* **FFmpeg** installed on your system path (required for `librosa`/`pydub` audio decoding)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/sentinel-voice.git
cd sentinel-voice
```

### 2. Backend Setup (FastAPI + ML Engine)
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt

# Start the FastAPI server (downloads HuggingFace weights on first run)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup (React Command Dashboard)
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser to access the **SENTINEL-VOICE Operator Console**.

---

## 📡 API & WebSocket Specification

### 1. Live Stream WebSocket: `ws://localhost:8000/ws/analyze-stream`
Accepts raw $16\text{ kHz}$ mono PCM float32 audio chunks and emits JSON telemetry every second:
```json
{
  "call_id": "1930-MH-88412",
  "timestamp_sec": 12.0,
  "emotions": {
    "Fear": 0.84,
    "Anger": 0.06,
    "Distress": 0.78,
    "Nervousness": 0.69
  },
  "detected_keywords": ["digital arrest", "cbi", "transfer"],
  "urgency_score": 88,
  "triage_status": "CRITICAL",
  "advisory": "Indicative signal only. High vocal tremor + extortion keywords detected. Prioritize Golden Hour freeze."
}
```

### 2. Recorded File Analysis: `POST /api/analyze-file`
Accepts a `.wav` or `.mp3` upload and returns an array of timestamped emotion windows for forensic scrubbing.

---

## 🛡️ Responsible AI & Legal Disclaimer

**SENTINEL-VOICE** is architected in strict compliance with ethical policing standards:
1. **Not a Polygraph / Lie Detector:** Scientific consensus confirms that vocal stress does not equate to deception. This system **never** predicts honesty, intent, or criminal guilt.
2. **Human-in-the-Loop Mandate:** All urgency scores act solely as decision-support flags to help overwhelmed operators prioritize call intake. Final investigative actions rest entirely with authorized law enforcement officers.
3. **Data Minimization:** Live audio streams are analyzed in volatile memory buffers and are never written to disk without explicit warrant-backed recording protocols.

---

## 🗺️ Roadmap
- [x] Architecture Design & Real-World 1930 Workflow Mapping
- [ ] Core Wav2Vec 2.0 Acoustic Inference Engine (`model_engine.py`)
- [ ] FastAPI WebSocket Streaming Server
- [ ] React Operator Console & Dynamic Priority Queue
- [ ] Post-Call Forensic Audio Timeline Scrubber
- [ ] Integration with **Bhashini API** for multilingual Indic dialect support

---
*Built with ❤️ for Law Enforcement & Citizen Cyber Safety.*
