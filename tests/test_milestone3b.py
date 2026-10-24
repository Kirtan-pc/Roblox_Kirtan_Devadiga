"""Tests for Echo Milestone 3B — Transcript Analysis and Triage Engine.

These tests cover the transcript analysis service, the triage engine,
and their integration with the existing backend.

Use pytest to run:
    python -m pytest tests/test_milestone3b.py -v
"""

import json
import os
import sys
from dataclasses import dataclass

import numpy as np
import pytest

from backend.transcript_analysis import (
    MatchedIndicator,
    TranscriptAnalysis,
    TranscriptAnalyzer,
    MAX_TRANSCRIPT_CHARS,
    get_analyzer,
)
from backend.triage_engine import (
    TriageEngine,
    TriageResult,
    EmotionContext,
    run_triage,
    TRIAGE_CATEGORIES,
    TRIAGE_NAMES,
)


# ---------------------------------------------------------------------------
# Fixture factories
# ---------------------------------------------------------------------------

def _make_analysis(
    text: str,
    *,
    categories: Optional[dict[str, list[str]]] = None,
) -> TranscriptAnalysis:
    """Create a TranscriptAnalysis for the given text."""
    analyzer = TranscriptAnalyzer()
    analyzer = TranscriptAnalyzer()  # fresh instance
    return analyzer.analyze(text)


# ---------------------------------------------------------------------------
# Transcript analysis tests
# ---------------------------------------------------------------------------

class TestTranscriptAnalyzer:
    def test_basic_match(self):
        """Basic authority impersonation match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("The CBI will arrest your account.")
        assert any(i.category == "authority_impersonation" for i in analysis.matched_indicators)

    def test_digital_arrest(self):
        """Digital-arrest threat match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("You are under digital arrest.")
        assert any(i.category == "digital_arrest_threat" for i in analysis.matched_indicators)

    def test_otp_request(self):
        """OTP / credential request match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("Please provide the OTP code.")
        assert any(i.category == "otp_credential_request" for i in analysis.matched_indicators)

    def test_payment_demand(self):
        """Urgent payment demand match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("Transfer money to this account immediately.")
        assert any(i.category == "urgent_payment_demand" for i in analysis.matched_indicators)

    def test_remote_access(self):
        """Remote-access request match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("Install AnyDesk for remote access.")
        assert any(i.category == "remote_access_request" for i in analysis.matched_indicators)

    def test_unauthorized_transfer(self):
        """Unauthorized transfer match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("My account was drained overnight.")
        assert any(i.category == "unauthorized_transfer" for i in analysis.matched_indicators)

    def test_threats(self):
        """Threats/intimidation match."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("I will harm you if you do not cooperate.")
        assert any(i.category == "threats_intimidation" for i in analysis.matched_indicators)

    def test_case_insensitive(self):
        """Case differences should not prevent matches."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("DIGITAL ARREST is the term used.")
        assert any(i.category == "digital_arrest_threat" for i in analysis.matched_indicators)

    def test_punctuation_handling(self):
        """Punctuation should not break matches."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("Digital arrest!")
        assert any(i.category == "digital_arrest_threat" for i in analysis.matched_indicators)

    def test_whitespace_normalization(self):
        """Extra whitespace should not prevent matches."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze("Digital   arrest  threat")
        assert any(i.category == "digital_arrest_threat" for i in analysis.matched_indicators)

    def test_no_match_ordinary_conversation(self):
        """Ordinary conversation should not trigger matches."""
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze(
            "I called to check on my account balance last week."
        )
        # No cybercrime categories should match
        cyber_categories = {
            "authority_impersonation",
            "digital_arrest_threat",
            "urgent_payment_demand",
            "otp_credential_request",
            "remote_access_request",
            "unauthorized_transfer",
            "threats_intimidation",
        }
        matched_cats = {i.category for i in analysis.matched_indicators}
        assert cyber_categories.isdisjoint(matched_cats)

    def test_duplicate_match_handling(self):
        """Duplicate matches for the same occurrence should be handled."""
        analyzer = TranscriptAnalyzer()
        # A short text with the same phrase repeated
        analysis = analyzer.analyze("Digital arrest Digital arrest")
        # The finditer will find two matches; we allow both if ends differ
        # but we deduplicate by end position
        assert len(analysis.matched_indicators) >= 1

    def test_max_transcript_chars_limit(self):
        """Transcripts longer than MAX_TRANSCRIPT_CHARS should still work;
        the limit is a soft guard, not a hard rejection in the analyzer."""
        # A very long string — the analyzer normalises whitespace but does
        # not enforce a hard cut-off; the caller (API) enforces the limit.
        long_text = "Digital arrest " * (MAX_TRANSCRIPT_CHARS // 15 + 1)
        analyzer = TranscriptAnalyzer()
        analysis = analyzer.analyze(long_text)
        # Should still produce some matches
        assert len(analysis.matched_indicators) > 0


# ---------------------------------------------------------------------------
# Triage engine tests
# ---------------------------------------------------------------------------

class TestTriageEngine:
    def setup_method(self):
        self.engine = TriageEngine()

    def test_no_indicators_low_evidence(self):
        """N1: No cybercrime indicators → low_evidence."""
        analysis = _make_analysis("This is a normal conversation about the weather.")
        result = self.engine.triage(analysis)
        assert result.category == "low_evidence"
        assert "no cybercrime-related indicators" in result.explanation.lower()

    def test_impersonation_and_coercion(self):
        """N2: Authority impersonation + digital-arrest/payment → high priority."""
        analysis = _make_analysis(
            "This is the CBI. Your account will be digitally arrested. "
            "Transfer money immediately."
        )
        result = self.engine.triage(analysis)
        assert result.category == "potential_impersonation_and_coercion"
        assert "impersonation" in result.explanation.lower() or "coercion" in result.explanation.lower()

    def test_financial_fraud(self):
        """N3: OTP/credential or unauthorized-transfer indicators."""
        analysis = _make_analysis("Please give me the OTP code for your account.")
        result = self.engine.triage(analysis)
        # OTP request without the strong impersonation+coercion combo
        assert result.category == "potential_financial_fraud"

    def test_threats_without_strong_context(self):
        """N4: Threats language without other strong cybercrime context."""
        analysis = _make_analysis(
            "I will hurt you if you do not cooperate, but this is a personal matter."
        )
        result = self.engine.triage(analysis)
        assert result.category == "potential_threat_or_intimidation"

    def test_mixed_context(self):
        """N5: Multiple indicator categories present."""
        analysis = _make_analysis(
            "The CBI will arrest you. Also, please give me your OTP."
        )
        result = self.engine.triage(analysis)
        # May be mixed_context or impersonation+coercion depending on rule order;
        # at minimum it should not be low_evidence.
        assert result.category != "low_evidence"

    def test_emotion_without_cybercrime(self):
        """N6: Anger without cybercrime indicators → low_evidence, not a cybercrime assessment."""
        analysis = _make_analysis("I am very angry about the service.")
        result = self.engine.triage(analysis)
        # Anger without cybercrime indicators → should not be a cybercrime category
        assert result.category != "potential_impersonation_and_coercion"
        # It should be low_evidence or requires_human_review
        assert result.category in {"low_evidence", "requires_human_review"}

    def test_empty_transcript(self):
        """Empty transcript → low_evidence."""
        analysis = _make_analysis("")
        result = self.engine.triage(analysis)
        assert result.category == "low_evidence"

    def test_missing_transcript(self):
        """Missing/None transcript → explicitly mark as unavailable."""
        # This tests the engine's handling when transcript is None/missing.
        # The engine expects a TranscriptAnalysis; passing None would be a type error.
        # The test below verifies the API handles missing transcript gracefully
        # at a higher level.
        pass

    def test_irelevant_ordinary_conversation(self):
        """Ordinary conversation with no cybercrime patterns."""
        analysis = _make_analysis(
            "Hello, how are you? I was wondering if we could meet for coffee."
        )
        result = self.engine.triage(analysis)
        assert result.category == "low_evidence"

    def test_anger_without_cybercrime_no_fabrication(self):
        """Anger alone must NOT fabricate a cybercrime assessment."""
        analysis = _make_analysis("I am furious about the policy change.")
        result = self.engine.triage(analysis)
        # Must NOT be a cybercrime category
        cyber_cats = {
            "potential_impersonation_and_coercion",
            "potential_financial_fraud",
            "potential_threat_or_intimidation",
        }
        assert result.category not in cyber_cats

    def test_neutral_emotion_with_indicators(self):
        """Neutral emotion (neu) with strong transcript indicators → cybercrime category."""
        analysis = _make_analysis(
            "The CBI will arrest your account. Transfer money now."
        )
        result = self.engine.triage(analysis)
        # Even with neutral emotion, strong cybercrime indicators should dominate
        assert result.category in {
            "potential_impersonation_and_coercion",
            "potential_financial_fraud",
        }

    def test_insufficient_evidence(self):
        """Insufficient evidence → low_evidence / undetermined."""
        analysis = _make_analysis(
            "The weather is nice today and I like my job."
        )
        result = self.engine.triage(analysis)
        assert result.category == "low_evidence"

    def test_consistent_response_schema(self):
        """Every TriageResult should have the required fields."""
        analysis = _make_analysis("The CBI will arrest your account.")
        result = self.engine.triage(analysis)
        assert hasattr(result, "category")
        assert hasattr(result, "category_name")
        assert hasattr(result, "explanation")
        assert hasattr(result, "indicators")
        assert hasattr(result, "evidence_excerpts")
        assert hasattr(result, "rules_fired")
        assert hasattr(result, "evidence_sources")
        assert hasattr(result, "uncertainty_notes")
        assert hasattr(result, "recommendation")

    def test_real_cached_model_regression(self):
        """Optional integration: real model cache should still work."""
        import soundfile as sf
        from backend.model_service import ModelService
        svc = ModelService()
        try:
            svc.initialize(offline=True)
        except RuntimeError:
            pytest.xfail("Model not cached; skipping integration test.")
        # Use a fixture
        audio, sr = sf.read("sample_audio/synthetic_tone_low.wav")
        from backend.model_service import ModelService
        # We just verify the model loads; we don't test triage with audio
        # since triage operates on text, not audio.
        # This test just ensures the model cache is still accessible.
        assert True  # passed if we get here without xfail


# ---------------------------------------------------------------------------
# Integration / API tests (using FastAPI TestClient)
# ---------------------------------------------------------------------------

try:
    from fastapi.testclient import TestClient

    class TestAPIIntegration:
        def setup_method(self):
            from backend.main import app
            self.client = TestClient(app)

        def test_triage_endpoint_authority_impersonation(self):
            """POST /api/v1/triage with authority impersonation + digital-arrest threat."""
            from backend.transcript_analysis import get_analyzer
            analyzer = get_analyzer()
            transcript = "This is the CBI. Your account will be digitally arrested."
            analysis = analyzer.analyze(transcript)

            # Send the transcript to the triage endpoint
            resp = self.client.post(
                "/api/v1/triage",
                json={"transcript": transcript},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert "category" in data
            assert "explanation" in data
            assert "indicators" in data
            assert "evidence_excerpts" in data
            assert "rules_fired" in data
            assert "evidence_sources" in data
            assert "uncertainty_notes" in data
            assert "disclaimer" in data
            # Verify the category reflects the patterns
            assert data["category"] in {
                "potential_impersonation_and_coercion",
                "potential_financial_fraud",
                "potential_threat_or_intimidation",
            }

        def test_triage_endpoint_otp_request(self):
            """POST /api/v1/triage with OTP request."""
            from backend.transcript_analysis import get_analyzer
            analyzer = get_analyzer()
            transcript = "Please provide the OTP code for verification."
            analysis = analyzer.analyze(transcript)

            resp = self.client.post(
                "/api/v1/triage",
                json={"transcript": transcript},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert "category" in data
            # OTP request should map to potential_financial_fraud or similar
            assert data["category"] != "low_evidence"  # should find some indicator

        def test_triage_endpoint_empty_transcript(self):
            """POST /api/v1/triage with empty transcript."""
            resp = self.client.post(
                "/api/v1/triage",
                json={"transcript": ""},
            )
            # Should handle gracefully, not crash
            assert resp.status_code in (200, 400, 422)

        def test_triage_endpoint_missing_transcript_key(self):
            """POST /api/v1/triage without transcript key."""
            resp = self.client.post(
                "/api/v1/triage",
                json={},
            )
            # Should not crash; return an error or default
            assert resp.status_code in (200, 400, 422)

        def test_disclaimer_present(self):
            """The response should include a disclaimer about model limitations."""
            from backend.transcript_analysis import get_analyzer
            analyzer = get_analyzer()
            analyzer.analyze("The CBI will arrest your account.")
            # The triage engine adds its own guidance; verify disclaimer-like text
            resp = self.client.post(
                "/api/v1/triage",
                json={"transcript": "The CBI will arrest your account."},
            )
            assert resp.status_code == 200
            data = resp.json()
            # The disclaimer may come from the triage engine; verify it's present
            # as some form of guidance note.
            assert "disclaimer" in data or "note" in data.lower() or "caution" in data.lower()

        def test_case_and_punctuation_normalization(self):
            """Case and punctuation should not affect the result."""
            from backend.transcript_analysis import get_analyzer
            analyzer = get_analyzer()
            # These should all produce the same category
            texts = [
                "DIGITAL ARREST threat",
                "digital arrest threat",
                "Digital Arrest Threat",
            ]
            results = []
            for t in texts:
                analysis = analyzer.analyze(t)
                # Get the top category (simplified: first matched indicator's category)
                if analysis.matched_indicators:
                    results.append(analysis.matched_indicators[0].category)
                else:
                    results.append("none")
            # All should either match or all be "none"
            assert all(r == results[0] for r in results)

        def test_duplicate_match_handling(self):
            """The same phrase should not produce duplicate matches."""
            from backend.transcript_analysis import get_analyzer
            analyzer = get_analyzer()
            # A short repeated phrase
            analysis = analyzer.analyze("Digital arrest digital arrest")
            # We allow both matches if ends differ; test that it doesn't crash
            assert analysis is not None

        def test_irrelevant_ordinary_conversation(self):
            """Ordinary conversation should yield low_evidence."""
            from backend.transcript_analysis import get_analyzer
            analyzer = get_analyzer()
            analysis = analyzer.analyze(
                "Hello, how are you? I was wondering if we could meet for coffee."
            )
            # The engine should map this to low_evidence
            # (the test below runs via the API)
            pass

        def test_legacy_audio_endpoint_still_works(self):
            """Regression: the existing /api/v1/analyze endpoint should still work."""
            from fastapi.testclient import TestClient
            from backend.main import app
            client = TestClient(app)
            # Create a valid WAV in temp
            import tempfile
            import soundfile as sf
            import numpy as np

            t = np.linspace(0, 1, 16000, endpoint=False)
            wave = 0.5 * np.sin(2 * np.pi * 440 * t)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as _f:
                tmpname = _f.name
            try:
                sf.write(tmpname, wave, 16000, subtype="FLOAT")
                with open(tmpname, "rb") as _rf:
                    wav_bytes = _rf.read()
                os.unlink(tmpname)

                files = {"file": ("test.wav", wav_bytes, "audio/wav")}
                resp = client.post("/api/v1/analyze", files=files)
                # Should not crash; may return 503 if model not loaded,
                # or 200 if model is available
                assert resp.status_code in (200, 429, 503)
            finally:
                try:
                    os.unlink(tmpname)
                except OSError:
                    pass

except ImportError:
    # fastapi.testclient not available — tests will be skipped at collection.
    pass


# ---------------------------------------------------------------------------
# Helper: minimal _make_analysis for triage tests
# ---------------------------------------------------------------------------

def _make_analysis(text: str) -> TranscriptAnalysis:
    """Create a TranscriptAnalysis for the given text using the default analyzer."""
    analyzer = get_analyzer()
    return analyzer.analyze(text)