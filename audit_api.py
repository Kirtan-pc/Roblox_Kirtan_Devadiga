from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Test GET /health
resp = client.get("/health")
print(f"GET /health: status={resp.status_code}")
body = resp.json()
print(f"  body: status={body.get('status')}, message={body.get('message')}, model_ready={body.get('model_ready')}")

# Test POST /api/v1/analyze with no model (should return 503)
resp = client.post("/api/v1/analyze", files={"file": ("test.wav", b"", "audio/wav")})
print(f"POST /api/v1/analyze (no model): status={resp.status_code}")

# Test POST /api/v1/triage with valid transcript
from backend.transcript_analysis import get_analyzer
analyzer = get_analyzer()
analysis = analyzer.analyze("The CBI will arrest your account. Transfer money now.")

resp = client.post("/api/v1/triage", json={"transcript": "The CBI will arrest your account. Transfer money now."})
print(f"POST /api/v1/triage: status={resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  category: {data.get('category')}")
    expl = data.get('explanation', '')
    if isinstance(expl, str):
        try:
            print(f"  explanation: {expl[:80]}")
        except UnicodeEncodeError:
            print(f"  explanation: [Unicode error in response]")
    else:
        print(f"  explanation: {str(expl)[:80]}")
    ru = data.get('rules_fired', '')
    if isinstance(ru, str):
        print(f"  rules_fired: {ru}")
    else:
        print(f"  rules_fired: {str(ru)}")
    dis = data.get('disclaimer', '')
    if isinstance(dis, str):
        try:
            print(f"  disclaimer: {dis[:80]}")
        except UnicodeEncodeError:
            print(f"  disclaimer: [Unicode error in response]")
    else:
        print(f"  disclaimer: {str(dis)[:80]}")