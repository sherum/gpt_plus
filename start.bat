@echo off
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker is required: https://docs.docker.com/get-docker/
  exit /b 1
)

if not exist .env (
  copy .env.example .env >nul
  echo Created .env. Add your OPENROUTER_API_KEY to it, then run start.bat again.
  exit /b 1
)

docker compose up --build -d
echo Backend:  http://localhost:8123
echo Frontend: http://localhost:3200
