import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "DAIRA API"


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_graphql_endpoint():
    query = """
        query {
            posts(limit: 10) {
                id
                caption
            }
        }
    """
    response = client.post("/graphql", json={"query": query})
    assert response.status_code == 200
