import re

# 1. Coercion & State Impersonation Lexicon (Digital Arrest)
COERCION_LEXICON = [
    "cbi", "digital arrest", "arrest warrant", "ed", "supreme court", "video call",
    "customs", "narcotics", "parcel", "skype", "ghar se mat niklo", "camera on", "police"
]

# 2. Financial Fraud Lexicon (Golden Hour Lien)
FINANCIAL_LEXICON = [
    "otp", "transfer", "lakh", "crore", "paisa gaya", "account empty", "upi",
    "fd tod", "rtgs", "imps", "debit", "loot", "fraud", "scam", "rupaye", "bank"
]

# 3. Non-Financial Cyber Crime: Sextortion, Morphed Blackmail, Exploitation & Self-Harm Risk
EXTORTION_SAFETY_LEXICON = [
    "blackmail", "blackmailing", "morphed", "morph", "nude", "nudes", "nude photos", "nude photo",
    "nude pic", "nude pics", "photos", "photo", "private photo", "private photos", "private video",
    "private videos", "selling", "selling nude", "selling nudes", "selling photos", "help",
    "someone needs help", "need help", "bachao", "madad", "video leak", "photo leak", "sextortion",
    "suicide", "mar jaunga", "khatam", "viral", "hacked", "ransom", "threat", "threaten", "threatening",
    "exploit", "harass"
]

def _match_keywords(lexicon: list, text: str) -> list:
    """Matches keywords using regex word boundaries to avoid substring false positives while capturing compound phrases."""
    matches = []
    for kw in lexicon:
        pattern = r"\b" + re.escape(kw)
        if re.search(pattern, text, re.IGNORECASE):
            matches.append(kw)
    return matches

def evaluate_call_urgency(acoustic_data: dict, transcript: str) -> dict:
    """
    6-Tier Piecewise Policy Classifier combining 3s-Window Acoustic Biomarkers
    with Rolling Cumulative Lexical Transcripts.
    """
    text = (transcript or "").lower()
    emotions = acoustic_data["emotions"]
    neutral_prob = acoustic_data["raw_logits"]["neutral"]
    rms_energy = acoustic_data["raw_logits"]["rms_energy"]

    distress = emotions["Distress"]
    fear = emotions["Fear"]
    anger = emotions["Anger"]
    nervousness = emotions["Nervousness"]

    matched_coercion = _match_keywords(COERCION_LEXICON, text)
    matched_financial = _match_keywords(FINANCIAL_LEXICON, text)
    matched_safety = _match_keywords(EXTORTION_SAFETY_LEXICON, text)
    all_keywords = list(set(matched_coercion + matched_financial + matched_safety))

    has_coercion = len(matched_coercion) > 0
    has_financial = len(matched_financial) > 0
    has_safety = len(matched_safety) > 0

    def _pack(score: int, tier: str, alert: bool, directive: str) -> dict:
        return {
            "urgency_score": score,
            "priority_tier": tier,
            "golden_hour_alert": alert,
            "emergency_escalation": score >= 85,
            "matched_keywords": all_keywords,
            "triage_directive": directive,
            "emotions": emotions,
            "peak_window_timestamp": acoustic_data.get("peak_window_timestamp", "0.0s - 3.0s"),
            "sliding_window_timeline": acoustic_data.get("sliding_window_timeline", []),
            "forensic_acoustics": acoustic_data.get("forensic_acoustics", {
                "f0_baseline": 224.2,
                "pitch_variance": 42.8,
                "hnr_db": 11.4,
                "peak_spl": -3.2,
                "duration_sec": 6.0
            }),
            "waveform_track": acoustic_data.get("waveform_track", {})
        }

    # =========================================================================
    # TIER 1: CYBER EXTORTION / SEXTORTION / SELF-HARM RISK (Non-Financial Life Safety)
    # =========================================================================
    if has_safety:
        score = min(98, 92 + (len(matched_safety) * 2))
        return _pack(
            score=score,
            tier="CRITICAL: SEXTORTION / LIFE-SAFETY RISK",
            alert=True,
            directive="LIFE-SAFETY OVERRIDE: Morphed blackmail / self-harm / extortion indicators detected. Do NOT put caller on hold. Trigger immediate Dial-112 emergency dispatch & Cyber Extortion Unit linkage."
        )

    # =========================================================================
    # TIER 2: THE "FAKE CALM / DIGITAL ARREST" COERCION OVERRIDE
    # =========================================================================
    if has_coercion and (neutral_prob >= 0.45 or rms_energy < 0.05):
        score = min(96, 90 + (len(matched_coercion) * 2))
        return _pack(
            score=score,
            tier="CRITICAL: COERCIVE DIGITAL ARREST",
            alert=True,
            directive="COERCION OVERRIDE TRIGGERED: Suppressed vocal energy detected alongside state-impersonation keywords. Victim likely monitored on parallel video call. Instruct caller to disconnect scammer video call & initiate CFCFRMS hold."
        )

    # =========================================================================
    # TIER 3: ACTIVE GOLDEN HOUR FINANCIAL FRAUD + VOCAL PANIC
    # =========================================================================
    if (has_financial and (distress >= 0.20 or fear >= 0.20 or len(matched_financial) >= 2)) or (has_coercion and has_financial):
        score = int(min(94, 75 + (max(distress, fear) * 15) + (len(all_keywords) * 2)))
        return _pack(
            score=score,
            tier="CRITICAL: GOLDEN HOUR FINANCIAL FRAUD",
            alert=True,
            directive="SKIP NARRATIVE INTAKE: Request 12-digit UTR/Transaction ID first to fire automated CFCFRMS bank lien API before Golden Hour expires."
        )

    # =========================================================================
    # TIER 4: PURE ACOUSTIC PANIC (ASR Failed / Vernacular Dialect Fallback)
    # =========================================================================
    if distress >= 0.65 or fear >= 0.65:
        score = int(min(88, 55 + (max(distress, fear) * 33)))
        return _pack(
            score=score,
            tier="HIGH: ACUTE PARALINGUISTIC DISTRESS",
            alert=score >= 75,
            directive="VERNACULAR RESILIENCE: Acoustic panic detected even without keyword match. Connect native vernacular officer immediately."
        )

    # =========================================================================
    # TIER 5: AGITATED / ANGRY NON-CRITICAL (Hard Cap: Score 20-35)
    # =========================================================================
    has_agitation = anger >= 0.40 or any(w in text for w in ["ridiculous", "blinking", "two days", "service", "broadband", "angry"])
    if has_agitation and not (has_financial or has_coercion or has_safety):
        score = int(min(35, max(20, 22 + (anger * 15))))
        return _pack(
            score=score,
            tier="LOW: AGITATED / NON-CRITICAL COMPLAINT",
            alert=False,
            directive="DE-ESCALATION PROTOCOL: Caller is agitated/angry but no cybercrime threat keywords matched. Log standard telecom/service grievance without queue hijacking."
        )

    # =========================================================================
    # TIER 6: STANDARD ROUTINE QUEUE (Score 5-40)
    # =========================================================================
    score = int(min(40, max(5, int((distress * 20) + (fear * 20) + (len(all_keywords) * 5)))))
    return _pack(
        score=score,
        tier="STANDARD: ROUTINE INQUIRY",
        alert=False,
        directive="STANDARD FIFO INTAKE: Process routine portal complaint inquiry under standard operator workflow."
    )
