import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.config import settings

# Override database URL to use SQLite for tests
settings.DATABASE_URL = "sqlite:///:memory:"

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


def test_graphql_endpoint_exists():
    # Just test that the endpoint exists, not the actual query
    # since we don't have a database running
    response = client.post("/graphql", json={"query": "{ __typename }"})
    assert response.status_code == 200
