from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

# Test POST /api/v1/triage with empty transcript
resp = client.post("/api/v1/triage", json={"transcript": ""})
print(f"POST /api/v1/triage (empty): status={resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  category: {data.get('category')}")

# Test POST /api/v1/triage without transcript key
resp = client.post("/api/v1/triage", json={})
print(f"POST /api/v1/triage (no key): status={resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  category: {data.get('category')}")

# Test POST /api/v1/triage with missing transcript field
resp = client.post("/api/v1/triage", json={"other": "data"})
print(f"POST /api/v1/triage (missing transcript): status={resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    print(f"  category: {data.get('category')}")
PYEOF