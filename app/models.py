from typing import Literal

from pydantic import BaseModel


class SourceDocument(BaseModel):
    filename: str


class SourceContent(BaseModel):
    filename: str
    content: str


class CreateSourceRequest(BaseModel):
    content: str


class Message(BaseModel):
    role: Literal["prompt", "response"]
    content: str


class ChatRequest(BaseModel):
    selected_sources: list[str]
    narrative: str
    question: str
    conversation_history: list[Message] = []
    tool_agent_model: str
    primary_agent_model: str
    final_agent_model: str


class ChatResponse(BaseModel):
    response: str
