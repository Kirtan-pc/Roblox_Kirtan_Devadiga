# SENTINEL-VOICE: Real-Time Speech Emotion & Urgency Triage for Cybercrime Investigation

An AI-powered Speech Emotion Recognition (SER) and multi-crime call triage platform built for India's **1930 Cyber Helpline** (CFCFRMS / I4C) and State Cyber Cells (ERSS Dial-112).

---

## 1. Core Architecture: Dual-Stream Late Fusion
- **Stream A (Acoustic Paralinguistics — 3s Sliding Window, 1s Stride):** Uses pre-trained `superb/wav2vec2-base-superb-er` + Librosa physical biomarkers (RMS vocal energy & Zero-Crossing Rate volatility) to classify **Fear, Anger, Distress, and Nervousness** independent of caller language or dialect.
- **Stream B (Cumulative Lexical Intent — Hinglish ASR):** Captures code-switched Hindi/English speech tokens across three threat lexicons: **Financial Fraud**, **Coercive Digital Arrest**, and **Sextortion / Self-Harm Safety**.
- **6-Tier Piecewise Policy Classifier:** Resolves psychological contradictions such as the **"Fake Calm" Digital Arrest Paradox** (low vocal energy under scammer video surveillance + high-risk coercion keywords) and filters out **Angry Non-Urgent False Alarms**.

---

## 2. Quick Start

### Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python download_models.py
python generate_samples.py
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 3. Responsible AI & Legal Guardrails
Acoustic emotion predictions and urgency indices are strictly indicative triage signals designed to help cyber helpline officers prioritize Golden Hour assistance—never definitive forensic proof of caller honesty, intent, or legal guilt. Audio streams are processed transiently in a 3-second FIFO ring buffer in RAM and never stored to disk in unencrypted format, ensuring DPDP Act 2023 compliance.

---

## 4. Pre-Submission Verification Audit Table

| Check Area | Verification Step | Expected Pass Condition |
| :--- | :--- | :--- |
| **Zero-Internet Model Check** | Turn off network for 15s and trigger the 5 preset simulations. | All 5 presets return scores in `<450ms` using local `./models_cache`. |
| **3s Sliding Window Check** | Inspect the `3-SECOND SLIDING WINDOW TIMELINE` on the console. | Displays 4 distinct 3-second slices (`0.0s - 3.0s` to `3.0s - 6.0s`) with peak stress highlighting. |
| **Live Mic & Hinglish Check** | Click **Start Live Mic Call**, speak: *"Sir CBI digital arrest bol rahe hain, OTP chala gaya"*, then click **Stop & Run Triage**. | Browser captures speech; backend flags `CBI`, `DIGITAL ARREST`, `OTP` entities and triggers the Golden Hour alert. |
| **Clean Repo Check** | Run `git status` in terminal. | Neither `node_modules/`, `venv/`, nor `models_cache/` appear in tracked or staged files. |

---

## 5. Exact 2-Minute Demo Video Script
- **0:00 – 0:25 (Hook & Problem):** "On India's 1930 helpline, operators face critical bottlenecks during the Golden Hour: static FIFO queues that bury emergency victims, and the 'Fake Calm' paradox—where Digital Arrest victims whisper calmly under scammer surveillance."
- **0:25 – 1:15 (The 5 Edge Cases Live):**
  - **Button 5 (Angry False-Alarm):** High vocal anger (85%), but zero cyber entities. Urgency capped at 21 to prevent queue clogging.
  - **Button 3 ("Fake Calm" Arrest):** Coerced victim speaking in a quiet whisper. Model catches suppressed vocal energy + state impersonation keywords ('CBI', 'digital arrest'), overriding calm voice to trigger Score 96 Golden Hour Alert and auto-promoting to Rank #1.
  - **Button 4 (Sextortion / Threat):** Morphed video blackmail and self-harm keywords trigger Score 98 Life-Safety Escalation linked to Dial-112.
- **1:15 – 1:40 (3-Second Sliding Window & Live Mic Test):** Scrub across the 3s window cards (`0-3s`, `1-4s`, `2-5s`, `3-6s`), then test live mic Hinglish speech.
- **1:40 – 2:00 (Responsible AI Closing):** Highlight the transient RAM buffer and Responsible AI evidentiary disclaimer helping officers freeze funds before the Golden Hour expires.
