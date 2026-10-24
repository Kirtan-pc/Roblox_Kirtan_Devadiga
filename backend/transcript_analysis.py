"""backend/transcript_analysis.py - Echo

Analyzes caller-supplied text for cybercrime-related indicators.

This module does NOT perform speech recognition. It accepts text explicitly
supplied by the caller and identifies patterns associated with common
cybercrime scenarios.

Indicator categories are configurable and explained.  Matches are
deterministic and based on phrase/pattern matching rather than machine
learning.  The module does not claim comprehensive language coverage and
should not be used as evidence of criminal activity.

Phrase matching handles case differences, punctuation, extra whitespace,
and common spelling variations where appropriate.  English/Hinglish
variants are supported through a configurable approach.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set

# ---------------------------------------------------------------------------
# Indicator categories and their matching patterns
# ---------------------------------------------------------------------------

# Each category has a list of raw regex pattern strings.  They are
# compiled to re.Pattern objects in TranscriptAnalyzer.__init__.
# Patterns are kept simple and focused; they are not exhaustive and do
# not claim comprehensive coverage.

CATEGORIES: Dict[str, list[str]] = {
    # Authority impersonation: fake law-enforcement, government, bank
    "authority_impersonation": [
        r"\b(cbi|fbi|police|enforcement|officer|agent)\b",
        r"\b(digital arrest|cyber arrest|digital arrest scam)\b",
        r"\b(law enforcement|law enforcer)\b",
    ],
    # Digital-arrest threats: fake arrest, seizure, frozen account
    "digital_arrest_threat": [
        r"\b(digital arrest|cyber arrest|digital arrest scam)\b",
        r"\b(arrest|detain|custody|seize)\b",
        r"\b(frozen|blocked|suspended)\b",
        r"\b(account.*(block|freeze|seize|restrict))\b",
        r"\b(digitally\s+arrested|arrested\s+digital)\b",
    ],
    # Urgent payment demands: money transfers, UPI, bank transfers
    "urgent_payment_demand": [
        r"\b(transfer|send|movement).*?(money|funds|payment)\b",
        r"\b(UPI|unified payments).*?(request|demand)\b",
        r"\b(pay.*(fine|penalty|fee|fine).*account)\b",
    ],
    # OTP / credential requests: one-time passwords, PINs, passwords
    "otp_credential_request": [
        r"\b(otp|one.time.password|pin|password)\b",
        r"\b(share.*(otp|code|password)|give.*(otp|code|password))\b",
        r"\b(request.*(otp|code)|need.*(otp|code))\b",
    ],
    # Remote-access application requests: AnyDesk, TeamViewer, etc.
    "remote_access_request": [
        r"\b(AnyDesk|TeamViewer|UltraViewer|Ammyy).*?(install|download|run)\b",
        r"\b(remote.*app|screen.*share|control).*?(install|download)\b",
        r"(install|download|run).*?(AnyDesk|TeamViewer|UltraViewer|Ammyy)\b",
    ],
    # Unauthorized transfer / financial loss indicators
    "unauthorized_transfer": [
        r"\b(account.*(empty|drained|stolen|compromised))\b",
        r"\b(money.*(lost|sent|transferred without.*consent))\b",
        r"\b(unauthorized.*(transfer|access|charge))\b",
    ],
    # Threats and intimidation
    "threats_intimidation": [
        r"\b(threaten|intimidate|harm|hurt|violence)\b",
        r"\b(kidnap|harm.*family|hurt).*?(me|my|family)\b",
    ],
}

# Friendly name mapping for display
CATEGORY_NAMES: Dict[str, str] = {
    "authority_impersonation": "Authority Impersonation",
    "digital_arrest_threat": "Digital Arrest Threat",
    "urgent_payment_demand": "Urgent Payment Demand",
    "otp_credential_request": "OTP / Credential Request",
    "remote_access_request": "Remote Access Request",
    "unauthorized_transfer": "Unauthorized Transfer / Financial Loss",
    "threats_intimidation": "Threats / Intimidation",
}


# ---------------------------------------------------------------------------
# Data containers
# ---------------------------------------------------------------------------

@dataclass
class MatchedIndicator:
    """A single pattern match within a transcript."""
    category: str
    phrase: str
    explanation: str
    start: int
    end: int


@dataclass
class TranscriptAnalysis:
    """Result of transcript analysis."""
    matched_indicators: List[MatchedIndicator] = field(default_factory=list)
    original_text: str = ""
    normalized_text: str = ""
    # Track which occurrences were already matched to avoid duplicates
    matched_occurrences: Set[int] = field(default_factory=set)


# ---------------------------------------------------------------------------
# TranscriptAnalyzer class
# ---------------------------------------------------------------------------

class TranscriptAnalyzer:
    """Analyzes text for cybercrime-related indicators."""

    def __init__(
        self,
        *,
        # Allow per-instance overrides of patterns (for Hinglish variants, etc.)
        category_patterns: Optional[Dict[str, list[str]]] = None,
    ):
        self.category_patterns = category_patterns or CATEGORIES
        self._compiled: Dict[str, list[re.Pattern[str]]] = {
            cat: [re.compile(p, re.IGNORECASE) for p in patterns]
            for cat, patterns in self.category_patterns.items()
        }

    # -------------------------------------------------------------------
    # Normalisation helpers
    # -------------------------------------------------------------------

    @staticmethod
    def _normalize_case(text: str) -> str:
        """Case-fold for matching."""
        return text.lower()

    @staticmethod
    def _normalize_whitespace(text: str) -> str:
        """Collapse runs of whitespace and strip leading/trailing."""
        return re.sub(r"\s+", " ", text).strip()

    # -------------------------------------------------------------------
    # Core matching
    # -------------------------------------------------------------------

    def analyze(self, text: str) -> TranscriptAnalysis:
        """Run indicator analysis on the supplied text.

        Returns a TranscriptAnalysis instance containing matched indicators,
        the original text, and a normalized version.
        """
        normalized = self._normalize_whitespace(self._normalize_case(text))
        analysis = TranscriptAnalysis(
            original_text=text,
            normalized_text=normalized,
        )

        seen_ends: Set[int] = set()

        for category, patterns in self._compiled.items():
            for pattern in patterns:
                for m in pattern.finditer(normalized):
                    end_pos = int(m.end())
                    # Avoid duplicate matches for overlapping/identical occurrences
                    # Use (category, end_pos) so same end position in different categories
                    # is not suppressed (e.g., "digital arrest" in authority_impersonation
                    # and "arrest" in digital_arrest_threat both capture different phrases).
                    dedup_key = (category, end_pos)
                    if dedup_key in seen_ends:
                        continue
                    seen_ends.add(dedup_key)

                    start_pos = int(m.start())
                    # Extract phrase from normalized text since match positions are in normalized coords
                    phrase = normalized[start_pos:end_pos]
                    explanation = self._category_explanation(category)

                    analysis.matched_indicators.append(
                        MatchedIndicator(
                            category=category,
                            phrase=phrase.strip(),
                            explanation=explanation,
                            start=start_pos,
                            end=end_pos,
                        )
                    )

        return analysis

    # -------------------------------------------------------------------
    # Explanation generation
    # -------------------------------------------------------------------

    def _category_explanation(self, category: str) -> str:
        """Produce a short human-readable explanation for a match."""
        templates: Dict[str, str] = {
            "authority_impersonation": "Phrase appears to reference a law-enforcement or government authority.",
            "digital_arrest_threat": "Phrase contains language associated with arrest threats or account seizure.",
            "urgent_payment_demand": "Phrase indicates an urgent request for a money transfer or payment.",
            "otp_credential_request": "Phrase requests a one-time password, PIN, or other authentication credential.",
            "remote_access_request": "Phrase requests installation of remote-access software.",
            "unauthorized_transfer": "Phrase describes an unauthorized account access, theft, or financial loss.",
            "threats_intimidation": "Phrase contains language associated with threats or intimidation.",
        }
        return templates.get(category, "Phrase matches a defined cybercrime indicator category.")

    # -------------------------------------------------------------------
    # Public API
    # -------------------------------------------------------------------

    def get_analysis(self, text: str) -> TranscriptAnalysis:
        """Convenience method: analyze text and return the result."""
        return self.analyze(text)


# ---------------------------------------------------------------------------
# Module-level convenience
# ---------------------------------------------------------------------------

def get_analyzer() -> TranscriptAnalyzer:
    """Return a default TranscriptAnalyzer instance with the standard pattern set."""
    return TranscriptAnalyzer()


# ---------------------------------------------------------------------------
# Request-size limit
# ---------------------------------------------------------------------------

MAX_TRANSCRIPT_CHARS = 10_000  # 10 KB of client-supplied text


# ---------------------------------------------------------------------------
# Exported symbols
# ---------------------------------------------------------------------------

__all__ = [
    "TranscriptAnalyzer",
    "MatchedIndicator",
    "TranscriptAnalysis",
    "get_analyzer",
    "MAX_TRANSCRIPT_CHARS",
    "CATEGORIES",
    "CATEGORY_NAMES",
]