#!/bin/bash
set -e
cd "$(dirname "$0")"

if ! command -v docker >/dev/null; then
  echo "Docker is required: https://docs.docker.com/get-docker/"
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env. Add your OPENROUTER_API_KEY to it, then run ./start.sh again."
  exit 1
fi

docker compose up --build -d
echo "Backend:  http://localhost:8123"
echo "Frontend: http://localhost:3200"
