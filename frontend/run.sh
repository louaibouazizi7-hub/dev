#!/bin/bash
# Frontend React -> port 3000
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
npm run dev
