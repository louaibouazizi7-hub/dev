#!/bin/bash
# Lance le backend (:8000) et le frontend (:3000). MongoDB (:27017) doit déjà tourner.
cd "$(dirname "$0")"

if ! (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
  echo "MongoDB ne répond pas sur 27017. Démarre-le (ex : sudo systemctl start mongod) puis relance."
  exit 1
fi
echo "[1/2] MongoDB   -> OK (27017)"

echo "[2/2] Backend   -> http://localhost:8000  (docs : /docs)"
./backend/run.sh &
BACK=$!
trap 'kill $BACK 2>/dev/null; exit' INT TERM EXIT

echo "      Frontend  -> http://localhost:3000"
./frontend/run.sh
