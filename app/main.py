from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.agents.pipeline import run_pipeline
from app.llm import openrouter_model
from app.models import (
    ChatRequest,
    ChatResponse,
    CreateSourceRequest,
    SourceContent,
    SourceDocument,
)
from app.sources import create_source, list_sources, read_source

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROLE_MAP = {"prompt": "user", "response": "assistant"}


@app.get("/sources", response_model=list[SourceDocument])
def get_sources() -> list[SourceDocument]:
    return [SourceDocument(filename=name) for name in list_sources()]


@app.get("/sources/{filename}", response_model=SourceContent)
def get_source(filename: str) -> SourceContent:
    if filename not in list_sources():
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceContent(filename=filename, content=read_source(filename))


@app.post("/sources", response_model=SourceDocument)
def post_source(request: CreateSourceRequest) -> SourceDocument:
    filename = create_source(request.content)
    return SourceDocument(filename=filename)


@app.post("/chat", response_model=ChatResponse)
def post_chat(request: ChatRequest) -> ChatResponse:
    source_text = "\n\n".join(
        f"# {name}\n{read_source(name)}" for name in request.selected_sources
    )
    history = [
        {"role": ROLE_MAP[message.role], "content": message.content}
        for message in request.conversation_history
    ]
    response = run_pipeline(
        source_text,
        request.narrative,
        request.question,
        openrouter_model(request.tool_agent_model),
        openrouter_model(request.primary_agent_model),
        openrouter_model(request.final_agent_model),
        history,
    )
    return ChatResponse(response=response)
