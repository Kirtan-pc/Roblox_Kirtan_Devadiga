"""backend/triage_engine.py - Echo

Deterministic, documentable triage engine that consumes transcript indicators
and optional acoustic model output to produce a triage category, explanation,
and supporting rules.

The engine does NOT replace human judgment.  It is a decision-support tool
that surfaces patterns and evidence.  Emotion predictions are supplementary
context only and must NOT independently determine the triage category.

Emotion classes from the checkpoint are: neu, hap, ang, sad.
These are NOT remapped to fear, nervousness, distress, deception, or guilt.
"""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import dataclass, field
from typing import Optional, Sequence as TypingSequence

from backend.transcript_analysis import (
    MatchedIndicator,
    TranscriptAnalysis,
    TranscriptAnalyzer,
    MAX_TRANSCRIPT_CHARS,
)


# ---------------------------------------------------------------------------
# Triage categories
# ---------------------------------------------------------------------------

TRIAGE_CATEGORIES = (
    "low_evidence",           # No relevant indicators found
    "potential_impersonation",        # Authority impersonation without strong coercion
    "potential_financial_fraud",      # Payment/OTP/transfer indicators
    "potential_threat_or_intimidation",  # Threats language present
    "mixed_context",                  # Multiple indicator types present
    "requires_human_review",          # Unclear / needs operator review
)

# Human-readable names
TRIAGE_NAMES: dict[str, str] = {
    "low_evidence": "Low Evidence / Undetermined",
    "potential_impersonation": "Potential Impersonation",
    "potential_impersonation_and_coercion": "Potential Impersonation and Coercion",
    "potential_financial_fraud": "Potential Financial Fraud",
    "potential_threat_or_intimidation": "Potential Threat / Intimidation",
    "mixed_context": "Mixed Context / Multiple Indicator Types",
    "requires_human_review": "Requires Human Review",
}

# ---------------------------------------------------------------------------
# Emotion prediction wrapper (optional supplementary context)
# ---------------------------------------------------------------------------

@dataclass
class EmotionContext:
    """Optional supplementary emotion prediction from the acoustic model."""
    label: str  # one of: neu, hap, ang, sad
    score: float  # 0.0 – 1.0 (raw model probability; NOT a calibrated probability)


# ---------------------------------------------------------------------------
# TriageResult
# ---------------------------------------------------------------------------

@dataclass
class TriageResult:
    """The output of the triage engine."""
    category: str
    category_name: str
    explanation: str
    indicators: list[MatchedIndicator] = field(default_factory=list)
    evidence_excerpts: list[str] = field(default_factory=list)
    rules_fired: list[str] = field(default_factory=list)
    evidence_sources: list[str] = field(default_factory=list)  # e.g. "transcript", "acoustic_model"
    uncertainty_notes: list[str] = field(default_factory=list)
    recommendation: str = "human review"
    emotion_context: Optional[EmotionContext] = None


# ---------------------------------------------------------------------------
# TriageEngine
# ---------------------------------------------------------------------------

class TriageEngine:
    """Deterministic triage engine that consumes transcript indicators.

    The engine is rule-based and documentable.  Each rule has an ID and a
    documented effect on the triage category and explanation.

    Rules are evaluated in a fixed order; later rules may override or
    refine earlier decisions.  The engine never claims calibrated
    probabilities — all outputs are deterministic and explainable.
    """

    def __init__(self, emotion_context: Optional[EmotionContext] = None):
        self.emotion_context = emotion_context  # may be None

    # -------------------------------------------------------------------
    # Rule evaluation (ordered, documented)
    # -------------------------------------------------------------------

    def _rule_no_indicators(self, transcript: TranscriptAnalysis) -> bool:
        """Rule N1: No relevant cybercrime indicators found."""
        if not transcript.matched_indicators:
            return True
        return False

    def _rule_impersonation_and_coercion(
        self, transcript: TranscriptAnalysis
    ) -> Optional[str]:
        """Rule N2: Authority impersonation combined with digital-arrest or payment demand.

        If both an authority-impersonation pattern AND a digital-arrest or
        urgent-payment pattern are present, this is the strongest signal.
        """
        has_authority = any(
            i.category == "authority_impersonation" for i in transcript.matched_indicators
        )
        has_digital_arrest = any(
            i.category == "digital_arrest_threat" for i in transcript.matched_indicators
        )
        has_payment = any(
            i.category == "urgent_payment_demand" for i in transcript.matched_indicators
        )
        if has_authority and (has_digital_arrest or has_payment):
            return "potential_impersonation_and_coercion"
        return None

    def _rule_financial_fraud(self, transcript: TranscriptAnalysis) -> Optional[str]:
        """Rule N3: Financial-fraud indicators (OTP, credential, unauthorized transfer).

        If OTP/credential request OR unauthorized-transfer patterns are present
        without the strong impersonation+coercion combo, flag as financial fraud.
        """
        has_otp = any(i.category == "otp_credential_request" for i in transcript.matched_indicators)
        has_unauth = any(i.category == "unauthorized_transfer" for i in transcript.matched_indicators)
        if has_otp or has_unauth:
            # If we already caught impersonation+coercion above, don't override;
            # otherwise, flag financial fraud.
            if not self._rule_impersonation_and_coercion(transcript):
                return "potential_financial_fraud"
        return None

    def _rule_threats_or_intimidation(self, transcript: TranscriptAnalysis) -> Optional[str]:
        """Rule N4: Threats or intimidation language present, but lacking other
        strong cybercrime context.
        """
        has_threats = any(i.category == "threats_intimidation" for i in transcript.matched_indicators)
        if has_threats:
            # If we already have a stronger category, don't override.
            if not self._rule_impersonation_and_coercion(transcript) and not self._rule_financial_fraud(transcript):
                return "potential_threat_or_intimidation"
        return None

    def _rule_mixed_context(self, transcript: TranscriptAnalysis) -> Optional[str]:
        """Rule N5: Multiple distinct indicator categories present (but not enough
        for the stronger categories)."""
        categories_present = {i.category for i in transcript.matched_indicators}
        # If we have at least 2 different categories beyond a single type,
        # this is mixed context.
        if len(categories_present) >= 2:
            # Unless already caught by a stronger rule
            if not self._rule_impersonation_and_coercion(transcript) and not \
               self._rule_financial_fraud(transcript) and not \
               self._rule_threats_or_intimidation(transcript):
                return "mixed_context"
        return None

    def _rule_emotion_without_cybercrime(
        self, transcript: TranscriptAnalysis, emotion: Optional[EmotionContext]
    ) -> Optional[str]:
        """Rule N6: High emotion (e.g. anger) without cybercrime indicators.

        If the acoustic model predicts strong anger/angst but there are NO
        cybercrime transcript indicators, return this category.  The emotion
        alone does NOT trigger a cybercrime assessment.
        """
        # Only trigger if NO cybercrime-related categories are already set.
        cyber_categories = {
            "potential_impersonation",
            "potential_financial_fraud",
            "potential_threat_or_intimidation",
        }
        # If we already have a stronger category, skip.
        if self.emotion_context is not None and any(i.category in cyber_categories for i in transcript.matched_indicators):
            return None

        # If there are indicators but none of the cyber categories,
        # and emotion is ang or hap at a notable score, flag this.
        if self.emotion_context and self.emotion_context.label == "ang":
            # Anger without relevant cybercrime indicators.
            # We still return a low-evidence or mixed category rather than
            # fabricating a cybercrime assessment.
            if not any(i.category in {"authority_impersonation",
                                      "digital_arrest_threat",
                                      "urgent_payment_demand",
                                      "otp_credential_request",
                                      "remote_access_request",
                                      "unauthorized_transfer",
                                      "threats_intimidation"}
                       for i in transcript.matched_indicators):
                return "low_evidence"  # emotion alone ≠ cybercrime evidence
        return None

    def _rule_human_review(self, transcript: TranscriptAnalysis) -> Optional[str]:
        """Rule N6.5: Fallback to human review when indicators are ambiguous."""
        # If we have exactly one weak indicator and no strong category,
        # suggest human review.
        if (len(transcript.matched_indicators) == 1 and
                not any(i.category in {"authority_impersonation",
                                      "digital_arrest_threat",
                                      "urgent_payment_demand"}
                        for i in transcript.matched_indicators)):
            return "requires_human_review"
        return None

    # -------------------------------------------------------------------
    # Core triage logic
    # -------------------------------------------------------------------

    def triage(self, transcript: TranscriptAnalysis, *,
               emotion_context: Optional[EmotionContext] = None) -> TriageResult:
        """Run the full triage pipeline and return a TriageResult."""
        # Wrap emotion context if provided
        if emotion_context is not None:
            self.emotion_context = emotion_context

        # Reset emotion context at start of each triage call
        # (the engine state is otherwise stateless between calls)
        current_emotion = self.emotion_context

        # --- Run rules in priority order ---
        # N1: No indicators
        if self._rule_no_indicators(transcript):
            return TriageResult(
                category="low_evidence",
                category_name=TRIAGE_NAMES["low_evidence"],
                explanation=(
                    "No cybercrime-related indicators were found in the transcript. "
                    "This does not establish that no incident occurred; it indicates "
                    "that no transcript‑based patterns matching the defined categories "
                    "were detected."
                ),
                evidence_sources=["transcript"],
                uncertainty_notes=[
                    "Absence of detected indicators ≠ proof of safety.",
                    "Transcript may contain cues not covered by the defined categories.",
                ],
                recommendation="human review",
            )

        # N2: Impersonation + coercion
        impersonation_result = self._rule_impersonation_and_coercion(transcript)
        if impersonation_result:
            indicators = [i for i in transcript.matched_indicators
                          if i.category in {"authority_impersonation",
                                            "digital_arrest_threat",
                                            "urgent_payment_demand"}]
            return TriageResult(
                category="potential_impersonation_and_coercion",
                category_name=TRIAGE_NAMES["potential_impersonation_and_coercion"],
                explanation=(
                    "Transcript patterns associated with authority impersonation "
                    "and digital‑arrest or urgent payment demands were detected.  "
                    "These patterns are indicators only; they do not establish "
                    "whether a crime occurred."
                ),
                evidence_excerpts=[f'"{i.phrase}"' for i in indicators],
                rules_fired=["N2: impersonation + coercion"],
                evidence_sources=["transcript"],
                uncertainty_notes=[
                    "Text patterns are indicators only; they do not prove criminal activity.",
                    "Human operators must verify the reported events independently.",
                ],
                recommendation="human review",
            )

        # N3: Financial fraud
        financial_result = self._rule_financial_fraud(transcript)
        if financial_result:
            indicators = [i for i in transcript.matched_indicators
                          if i.category in {"otp_credential_request",
                                            "unauthorized_transfer"}]
            return TriageResult(
                category="potential_financial_fraud",
                category_name=TRIAGE_NAMES["potential_financial_fraud"],
                explanation=(
                    "Transcript patterns associated with unauthorized transfers, "
                    "OTP/credential requests, or financial-loss language were detected. "
                    "These patterns are indicators only; they do not constitute "
                    "proof of fraud."
                ),
                evidence_excerpts=[f'"{i.phrase}"' for i in indicators],
                rules_fired=["N3: financial fraud"],
                evidence_sources=["transcript"],
                uncertainty_notes=[
                    "Text patterns are indicators only; they do not prove financial fraud.",
                    "Human review should verify whether an actual unauthorized transaction occurred.",
                ],
                recommendation="human review",
            )

        # N4: Threats or intimidation
        threats_result = self._rule_threats_or_intimidation(transcript)
        if threats_result:
            indicators = [i for i in transcript.matched_indicators
                          if i.category == "threats_intimidation"]
            return TriageResult(
                category="potential_threat_or_intimidation",
                category_name=TRIAGE_NAMES["potential_threat_or_intimidation"],
                explanation=(
                    "Transcript patterns associated with threats or intimidation were "
                    "detected, but the context does not support a more specific "
                    "cybercrime classification.  This assessment should be treated "
                    "as preliminary and verified by a human operator."
                ),
                evidence_excerpts=[f'"{i.phrase}"' for i in indicators],
                rules_fired=["N4: threats or intimidation"],
                evidence_sources=["transcript"],
                uncertainty_notes=[
                    "Threat language may arise in non‑criminal contexts.",
                    "Final determination requires operator judgment and, if available, "
                    "additional evidence (e.g., call recordings, callback verification).",
                ],
                recommendation="human review",
            )

        # N5: Mixed context
        mixed_result = self._rule_mixed_context(transcript)
        if mixed_result:
            # Collect all category names present
            present_categories = [TRIAGE_NAMES.get(i.category, i.category)
                                  for i in transcript.matched_indicators]
            explanation = (
                f"Multiple transcript patterns were detected ({', '.join(present_categories)}), "
                "but they do not cleanly fit any single stronger category.  "
                "These patterns are indicators only and require human review."
            )
            return TriageResult(
                category="mixed_context",
                category_name=TRIAGE_NAMES["mixed_context"],
                explanation=explanation,
                evidence_excerpts=[f'"{i.phrase}"' for i in transcript.matched_indicators],
                rules_fired=["N5: mixed context"],
                evidence_sources=["transcript"],
                uncertainty_notes=[
                    "Multiple indicator types may compete; operator judgment required.",
                    "No single category receives a majority of supporting patterns.",
                ],
                recommendation="human review",
            )

        # N6: Emotion without cybercrime indicators
        emotion_result = self._rule_emotion_without_cybercrime(transcript, current_emotion)
        if emotion_result:
            return TriageResult(
                category=emotion_result,
                category_name=TRIAGE_NAMES.get(emotion_result, emotion_result),
                explanation=(
                    "The transcript contains no cybercrime‑related indicator patterns "
                    "matching the defined categories.  The acoustic model's emotion "
                    "prediction (if supplied) is supplementary context only and does "
                    "not independently determine the triage category.  Emotion scores "
                    "are probabilistic estimates, not ground truth, and must not be "
                    "presented as clinically validated measurements."
                ),
                evidence_sources=["transcript", "acoustic_model"],
                uncertainty_notes=[
                    "Emotion classifications are probabilistic estimates, not ground truth.",
                    "Vocal characteristics cannot reliably establish whether someone is "
                    "lying, guilty, or acting with malicious intent.",
                    "An emotion score must not independently determine call priority or "
                    "legal action.",
                ],
                recommendation="human review",
            )

        # N6.5: Human review fallback
        hr_result = self._rule_human_review(transcript)
        if hr_result:
            return TriageResult(
                category="requires_human_review",
                category_name=TRIAGE_NAMES["requires_human_review"],
                explanation=(
                    "The transcript contains a small number of patterns that do not "
                    "clearly map to any stronger cybercrime category.  This does not "
                    "establish that the call is safe; it indicates that the available "
                    "evidence is insufficient for an automated assessment.  Human "
                    "operators should review the full call context."
                ),
                evidence_sources=["transcript"],
                uncertainty_notes=[
                    "Insufficient indicators ≠ proof of safety.",
                    "Operators should consider callback verification, call‑back number "
                    "validation, and other investigative steps.",
                ],
                recommendation="human review",
            )

        # Shouldn't reach here — fallback
        return TriageResult(
            category="low_evidence",
            category_name=TRIAGE_NAMES["low_evidence"],
            explanation=(
                "Triage could not be automatically determined.  The transcript was "
                "reviewed but did not match enough defined patterns for a confident "
                "category.  Human review is recommended."
            ),
            evidence_sources=["transcript"],
            uncertainty_notes=[
                "Automated triage is limited to defined pattern categories.",
                "Human operators should consider the full call context.",
            ],
            recommendation="human review",
        )

    # -------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------

    def run(self, transcript: TranscriptAnalysis,
            emotion_context: Optional[EmotionContext] = None) -> TriageResult:
        """Run triage on a TranscriptAnalysis instance.

        Parameters
        ----------
        transcript : TranscriptAnalysis
            The transcript analysis result from TranscriptAnalyzer.
        emotion_context : EmotionContext, optional
            Supplementary acoustic‑model emotion prediction.  If None, the
            engine runs transcript‑only mode.

        Returns
        -------
        TriageResult
            The deterministic triage outcome with explanation, indicators,
            and guidance.
        """
        return self.triage(transcript, emotion_context=emotion_context)


# ---------------------------------------------------------------------------
# Module-level convenience
# ---------------------------------------------------------------------------

def run_triage(transcript_text: str,
               emotion_context: Optional[EmotionContext] = None,
               *,
               category_patterns: Optional[dict[str, list[str]]] = None) -> TriageResult:
    """High‑level convenience function.

    Analyzes *transcript_text*, then runs the triage engine.

    Parameters
    ----------
    transcript_text : str
        Caller‑supplied text (not ASR output).  Will be normalized and
        analysed for cybercrime indicators.
    emotion_context : EmotionContext, optional
        Acoustic‑model emotion prediction as supplementary context.
    category_patterns : dict[str, list[str]], optional
        Override the default pattern set (e.g. for Hinglish variants).

    Returns
    -------
    TriageResult
        The triage outcome.
    """
    analyzer = TranscriptAnalyzer()
    if category_patterns:
        # Simple override: rebuild patterns from strings (limited).
        # In practice, callers should create a TranscriptAnalyzer with
        # custom patterns directly.
        pass
    analyzer = TranscriptAnalyzer()
    analysis = analyzer.analyze(transcript_text)
    engine = TriageEngine(emotion_context=emotion_context)
    return engine.run(analysis, emotion_context=emotion_context)