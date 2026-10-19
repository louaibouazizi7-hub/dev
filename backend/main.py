import os
from typing import Optional

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pymongo import MongoClient

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = MongoClient(MONGO_URL)


def get_collection():
    return client["passion_projet_db"]["produits"]


app = FastAPI(title="Passion Projet - API")

# CORS : autorise le frontend React (port 3000) à appeler l'API (port 8000)
FRONTEND_PORT = os.getenv("FRONTEND_PORT", "3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"http://localhost:{FRONTEND_PORT}", f"http://127.0.0.1:{FRONTEND_PORT}"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProduitIn(BaseModel):
    nom: str = Field(min_length=1, max_length=100)
    description: str = ""
    prix: float = Field(ge=0)
    quantite: int = Field(ge=0, default=0)
    categorie: str = ""


class ProduitOut(ProduitIn):
    id: str


def to_out(doc) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


def to_oid(produit_id: str) -> ObjectId:
    try:
        return ObjectId(produit_id)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail="Produit introuvable")


@app.get("/")
def hello():
    return {"message": "hello - API TP1 en marche"}


# CREATE
@app.post("/produits", response_model=ProduitOut, status_code=201)
def ajouter(produit: ProduitIn, col=Depends(get_collection)):
    doc = produit.model_dump()
    res = col.insert_one(doc)
    doc["_id"] = res.inserted_id
    return to_out(doc)


# READ (liste)
@app.get("/produits", response_model=list[ProduitOut])
def lister(q: Optional[str] = None, col=Depends(get_collection)):
    filtre = {"nom": {"$regex": q, "$options": "i"}} if q else {}
    return [to_out(d) for d in col.find(filtre).sort("_id", -1)]


# READ (un seul)
@app.get("/produits/{produit_id}", response_model=ProduitOut)
def consulter(produit_id: str, col=Depends(get_collection)):
    doc = col.find_one({"_id": to_oid(produit_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return to_out(doc)


# UPDATE
@app.put("/produits/{produit_id}", response_model=ProduitOut)
def modifier(produit_id: str, produit: ProduitIn, col=Depends(get_collection)):
    oid = to_oid(produit_id)
    res = col.update_one({"_id": oid}, {"$set": produit.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return to_out(col.find_one({"_id": oid}))


# DELETE
@app.delete("/produits/{produit_id}", status_code=204)
def supprimer(produit_id: str, col=Depends(get_collection)):
    res = col.delete_one({"_id": to_oid(produit_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    return Response(status_code=204)
