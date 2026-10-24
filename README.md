# Echo — Real-Time Speech Emotion Analysis for Cybercrime Investigation

**Planned capabilities only.** Echo is a proposed decision-support prototype, not completed or production-ready software.

---

## Project Overview

Echo is a proposed real-time speech emotion analysis and cybercrime call-triage assistance system intended to help operators prioritize potentially urgent calls.

The planned system will combine:

* Acoustic emotion analysis using a pretrained speech-emotion-recognition model.
* Speech transcription.
* Detection of relevant cybercrime and coercion-related language.
* A deterministic decision matrix that combines acoustic and textual signals.
* A dashboard displaying indicative urgency scores and call-priority information.

These are **planned capabilities, not completed functionality**. No inference, API, or dashboard code exists in this baseline.

---

## Problem Statement

Cybercrime helpline operators handle high volumes of distressed, coercive, or fraud-related calls. Call prioritization today relies on human judgment and first-in, first-out queuing, which means high-stakes callers can wait while critical windows close. Echo is intended to surface indicative urgency signals—acoustic distress and coercion-related language—so operators can review and prioritize calls faster, while a human remains responsible for every decision.

---

## Core Objectives

1. Provide real-time acoustic emotion indicators from live or recorded call audio.
2. Transcribe speech and flag cybercrime- and coercion-related language.
3. Combine acoustic and textual indicators through a transparent, deterministic decision matrix.
4. Surface indicative urgency scores in an operator dashboard for call triage.
5. Operate strictly as decision support: emotion scores never independently determine priority or legal action.

---

## Planned System Architecture

```text
Audio Input
    |
    v
Audio Preprocessing
    |
    v
Speech Emotion Analysis -------> Acoustic Indicators
    |
    +----> Speech Transcription -> Textual Indicators
                                  |
                                  v
                         Deterministic Decision Matrix
                                  |
                                  v
                       Indicative Priority Assessment
                                  |
                                  v
                         React Operator Dashboard
```

This architecture is **planned**. No streaming, inference, or dashboard components are implemented in this baseline.

---

## Repository Structure

```text
Echo/
├── .gitignore
├── README.md
├── sample_audio/
│   └── .gitkeep
│
├── backend/
│   ├── requirements.txt
│   ├── download_models.py
│   ├── generate_samples.py
│   ├── audio_engine.py
│   ├── decision_matrix.py
│   └── main.py
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        └── App.jsx
```

Configuration and documentation files contain baseline content. The backend and frontend source files are reserved for later milestones and contain only minimal responsibility comments.

---

## Technology Stack

**Backend (planned):** Python, FastAPI, Uvicorn, PyTorch, torchaudio, Hugging Face Transformers, Librosa, SoundFile, NumPy, Pydantic, WebSockets.

**Frontend (planned):** React, Vite, Tailwind CSS v3, PostCSS, Autoprefixer, Axios, Lucide React.

**Artifacts (not created):** Pretrained model weights, audio samples, virtual environments, dependency lockfiles.

---

## Environment & Setup

### Supported environment

Python 3.11 (tested with Python 3.11.9) is the supported environment for the pinned backend dependencies in `backend/requirements.txt`. Python 3.14+ does not have installable wheels for several pinned packages (notably `torch==2.4.0` and `torchaudio==2.4.0`), so Python 3.11 is recommended for local development.

### Virtual environment and dependencies

From the repository root:

```bash
# Create an isolated virtual environment (Python 3.11)
py -3.11 -m venv .venv

# Activate it (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt
```

### Windows PyTorch DLL-loading note

On some Windows machines, importing `torch==2.4.0` can fail with `OSError: [WinError 126] ... fbgemm.dll or one of its dependencies`. This is a machine-specific system-library issue, not a problem with the dependency pins. Confirming that `vcruntime140.dll` exists does not by itself identify which transitive dependency `fbgemm.dll` cannot load. If you encounter this error, install the Microsoft Visual C++ Redistributable for your system and retry; the exact missing DLL should be identified before changing `requirements.txt`.

### What is intentionally not installed

Do not install model weights, virtual environments, `node_modules`, or real recordings into the repository. These are excluded by `.gitignore`.

---

## Development Roadmap

* Milestone 1 (current): Repository baseline — structure, configuration, documentation.
* Milestone 2: Backend model downloads, audio preprocessing, and sample generation.
* Milestone 3: Speech emotion recognition, transcription, and keyword detection.
* Milestone 4: Deterministic decision matrix and FastAPI/WebSocket APIs.
* Milestone 5: React operator dashboard and end-to-end integration.

No milestones beyond Milestone 1 have been started.

---

## Responsible AI and Ethical Considerations

* Emotion classifications are probabilistic estimates, not ground truth.
* Vocal characteristics cannot reliably establish whether someone is lying, guilty, or acting with malicious intent.
* An emotion score must not independently determine call priority or legal action.
* Acoustic emotion categories and mapped distress indicators must not be presented as clinically validated measurements.
* Human operators retain responsibility for reviewing and acting on alerts.
* The system is a decision-support prototype, not a replacement for trained investigators or official emergency procedures.
* Synthetic or properly consented recordings should be used for development and demonstrations.
* Real caller recordings, personally identifiable information, credentials, and sensitive case data must not be committed to the repository.

This system is not validated, not production-ready, and not officially affiliated with any law-enforcement agency.

---

## Current Development Status

* Repository baseline: being initialized.
* Backend inference: not implemented.
* Decision matrix: not implemented.
* REST/WebSocket APIs: not implemented.
* Frontend dashboard: not implemented.
* Model weights: not downloaded.
* Audio evaluation dataset: not created.

No test results, performance figures, or completed-feature claims are made in this baseline.
