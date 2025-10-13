from fastapi.testclient import TestClient
from app.main import app
from app.db import mongodb
import uuid

client = TestClient(app)

# Monkeypatch the collections to use in-memory dicts to avoid touching real MongoDB
class DummyColl:
    def __init__(self):
        self.storage = {}
    async def find_one(self, q):
        # minimal email lookup
        if isinstance(q, dict) and "email" in q:
            for v in self.storage.values():
                if v.get("email") == q["email"]:
                    return v
        if "_id" in q:
            return self.storage.get(q["_id"]) 
        return None
    async def insert_one(self, doc):
        _id = str(uuid.uuid4())
        doc_copy = dict(doc)
        doc_copy["_id"] = _id
        self.storage[_id] = doc_copy
        class R:
            inserted_id = _id
        return R()

# Replace the collections
mongodb.UserCollection = DummyColl()
mongodb.ClientProfileCollection = DummyColl()


def test_register():
    payload = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "hunter2abc",
        "role": "participant"
    }
    r = client.post("/auth/register", json=payload)
    print(r.status_code, r.text)
    assert r.status_code == 201
    data = r.json()
    assert data["email"] == "testuser@example.com"
    assert "id" in data


if __name__ == '__main__':
    test_register()
