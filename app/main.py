from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.pipeline import run_pipeline
from app.llm import openrouter_model
from app.models import ChatRequest, ChatResponse

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ROLE_MAP = {"prompt": "user", "response": "assistant"}


@app.post("/chat", response_model=ChatResponse)
def post_chat(request: ChatRequest) -> ChatResponse:
    source_text = "\n\n".join(
        f"# {document.filename}\n{document.content}" for document in request.selected_documents
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
