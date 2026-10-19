"""Tests CRUD. Lancer : pytest -v   (utilise mongomock, pas besoin de MongoDB)"""
import mongomock
from fastapi.testclient import TestClient

from main import app, get_collection

col = mongomock.MongoClient()["test"]["produits"]
app.dependency_overrides[get_collection] = lambda: col
c = TestClient(app)

P = {"nom": "Clavier", "description": "USB", "prix": 25.5, "quantite": 10, "categorie": "Informatique"}


def test_crud_complet():
    # 1. Ajouter
    r = c.post("/produits", json=P)
    assert r.status_code == 201
    pid = r.json()["id"]
    # 2. Liste
    assert [p["id"] for p in c.get("/produits").json()] == [pid]
    # 3. Consulter
    assert c.get(f"/produits/{pid}").json()["nom"] == "Clavier"
    # 4. Modifier
    r = c.put(f"/produits/{pid}", json={**P, "prix": 30})
    assert r.status_code == 200 and r.json()["prix"] == 30
    assert c.get(f"/produits/{pid}").json()["prix"] == 30
    # 5. Supprimer
    assert c.delete(f"/produits/{pid}").status_code == 204
    assert c.get(f"/produits/{pid}").status_code == 404
    assert c.get("/produits").json() == []


def test_validation_et_erreurs():
    assert c.post("/produits", json={**P, "prix": -5}).status_code == 422
    assert c.post("/produits", json={**P, "nom": ""}).status_code == 422
    assert c.get("/produits/abc").status_code == 404
    assert c.delete("/produits/64b7f0f0f0f0f0f0f0f0f0f0").status_code == 404


def test_recherche():
    c.post("/produits", json=P)
    c.post("/produits", json={**P, "nom": "Souris"})
    assert len(c.get("/produits?q=sour").json()) == 1
