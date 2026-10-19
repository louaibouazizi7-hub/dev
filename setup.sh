#!/bin/bash
# Installation pour Kali Linux (Debian) : Python et Node.js seulement.
# MongoDB est supposé déjà installé et lancé (port 27017).
set -e
sudo apt update
sudo apt install -y python3 python3-venv python3-pip nodejs npm

echo "Node : $(node -v)   (Vite 5 demande Node 18 ou plus)"
if (echo > /dev/tcp/127.0.0.1/27017) 2>/dev/null; then
  echo "MongoDB détecté sur le port 27017 : OK"
else
  echo "ATTENTION : MongoDB ne répond pas sur 27017. Lance-le avant ./start.sh"
fi
echo "Installation terminée. Lance maintenant : ./start.sh"
