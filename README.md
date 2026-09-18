# GPT Plus: Science-Fiction Writing Assistant

A web app for exploring story ideas against your own world-building notes.
Select source documents, paste your current narrative, ask a question, and a
multi-agent LLM pipeline (two primary agents, each with three tool agents,
plus a final agent) answers. Follow-up questions keep the conversation context.

Stack: FastAPI + LiteLLM (backend), Angular + Bootstrap (frontend), Docker Compose.

## Requirements

- Docker (Docker Desktop on Windows/macOS, Docker Engine + Compose on Linux)
- An OpenRouter API key: https://openrouter.ai/keys

## Setup

1. Clone the repo and open a terminal in its folder.
2. Run the start script once. It creates a `.env` file and stops:
   - Linux/macOS: `./start.sh`
   - Windows: `start.bat`
3. Open `.env` and paste your key:

       OPENROUTER_API_KEY=your-key-here

   `.env` is listed in `.gitignore`. Never commit it.
4. Run the start script again, then open http://localhost:4200

To stop: `./stop.sh` (Linux/macOS) or `stop.bat` (Windows).

## Choosing models

Pick a model for each role from the dropdowns in the app header:

- Tool agents: the six specialist agents (use a fast, cheap model)
- Primary agents: the two independent analysts
- Final agent: selects the best answer (use your strongest model)

Any model available on OpenRouter works. To add one to the dropdowns, add its
OpenRouter id (for example `anthropic/claude-haiku-4.5`) to
`frontend/src/app/models/model-options.ts`. Defaults are set in
`frontend/src/app/services/conversation.ts`.

## World-building sources

Put your own `.txt`, `.md`, or `.pdf` files in the `sources/` folder. They appear
as checkboxes in the app; only the ones you tick are sent to the models. Your
files are gitignored, so they stay private. A sample file is included.

Each subfolder of `sources/` is selectable from the Folder dropdown, so you can
keep one folder per book. Tick "Link folders" to keep your selected documents
when you switch folders (for example, one book drawing on several folders);
with it unticked, switching folders clears the selection. Documents selected
from other folders are listed under "Selected from other folders".

## Troubleshooting

- Port 4200 or 8123 in use: stop the other program or edit the ports in `docker-compose.yml`.
- Authentication errors: check `OPENROUTER_API_KEY` in `.env`, then restart with the stop and start scripts.
- View logs: `docker compose logs -f`

## License

MIT
