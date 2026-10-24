# SENTINEL-VOICE Application

## Overview
A full-stack application for speech and vocal-pattern analysis in cybercrime response. Implements all 7 screens as specified in the requirements.

## Structure
- `frontend/` - React + Vite + Tailwind CSS application
- `backend/` - FastAPI backend with WebSocket support
- `dashboard.html` - Original reference prototype

## Getting Started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Features
- Operations Overview
- Live Operator Console (matching reference design)
- Supervisor Triage Queue
- Forensic Workbench
- Session Details
- System Health
- Audit & Privacy

All interfaces follow the light-mode design system with blue accents, matching the reference HTML prototype.
