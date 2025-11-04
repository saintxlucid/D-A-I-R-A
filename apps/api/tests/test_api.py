import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_graphql_introspection():
    response = client.post(
        "/graphql",
        json={
            "query": """
                query {
                    __schema {
                        types {
                            name
                        }
                    }
                }
            """
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "__schema" in data["data"]
