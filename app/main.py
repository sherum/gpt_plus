from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agents.pipeline import run_pipeline
from app.llm import openrouter_model
from app.models import (
    ChatRequest,
    ChatResponse,
    CreateSourceRequest,
    SourceContent,
    SourceDocument,
)
from app.sources import create_source, list_folders, list_sources, read_source, resolve

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROLE_MAP = {"prompt": "user", "response": "assistant"}


@app.exception_handler(ValueError)
def value_error_handler(request: Request, error: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": str(error)})


def to_document(path: str) -> SourceDocument:
    return SourceDocument(filename=path.rsplit("/", 1)[-1], path=path)


@app.get("/folders", response_model=list[str])
def get_folders() -> list[str]:
    return list_folders()


@app.get("/sources", response_model=list[SourceDocument])
def get_sources(folder: str = "") -> list[SourceDocument]:
    return [to_document(path) for path in list_sources(folder)]


@app.get("/sources/{path:path}", response_model=SourceContent)
def get_source(path: str) -> SourceContent:
    if not resolve(path).is_file():
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceContent(filename=path, content=read_source(path))


@app.post("/sources", response_model=SourceDocument)
def post_source(request: CreateSourceRequest) -> SourceDocument:
    return to_document(create_source(request.content, request.folder))


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
