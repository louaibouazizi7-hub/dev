# Passion Projet (TP1 - CRUD Full Stack)

React (frontend) + FastAPI (backend) + MongoDB (base de données)

```
 Navigateur ──► Frontend React :3000 ──(API REST + CORS)──► Backend FastAPI :8000 ──► MongoDB :27017
```

| Partie        | Techno   | Port  | Dossier     |
|---------------|----------|-------|-------------|
| Frontend      | React    | 3000  | `frontend/` |
| Backend (API) | FastAPI  | 8000  | `backend/`  |
| Base de données | MongoDB | 27017 | service     |

## 1. Installer (Kali Linux, MongoDB déjà lancé)
```bash
cd ~/passion-projet
chmod +x setup.sh start.sh backend/run.sh frontend/run.sh
./setup.sh        # installe Python et Node.js (pas MongoDB)
```

## 2. Lancer
```bash
./start.sh        # vérifie MongoDB :27017, lance backend :8000 et frontend :3000
```
Ouvre http://localhost:3000. Documentation de l'API : http://localhost:8000/docs

Si MongoDB tourne sur une autre adresse : `MONGO_URL=mongodb://hote:port ./backend/run.sh`

## 3. Tester le CRUD
Tests automatiques : `cd backend && source venv/bin/activate && pip install pytest httpx mongomock && pytest -v`

Test manuel avec curl :
```bash
curl -X POST localhost:8000/produits -H "Content-Type: application/json" \
  -d '{"nom":"Clavier","prix":25.5,"quantite":10}'      # Ajouter
curl localhost:8000/produits                              # Liste
curl localhost:8000/produits/<id>                         # Consulter
curl -X PUT localhost:8000/produits/<id> -H "Content-Type: application/json" \
  -d '{"nom":"Clavier","prix":30,"quantite":8}'           # Modifier
curl -X DELETE localhost:8000/produits/<id>               # Supprimer
```
Vérifier dans la base : `mongosh` puis `use passion_projet_db` puis `db.produits.find()`.

## API
| Méthode | Route            | Action                |
|---------|------------------|-----------------------|
| POST    | /produits        | Ajouter               |
| GET     | /produits        | Liste (`?q=` recherche) |
| GET     | /produits/{id}   | Consulter             |
| PUT     | /produits/{id}   | Modifier              |
| DELETE  | /produits/{id}   | Supprimer             |
# dev
