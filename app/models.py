from typing import Literal

from pydantic import BaseModel


class Document(BaseModel):
    filename: str
    content: str


class Message(BaseModel):
    role: Literal["prompt", "response"]
    content: str


class ChatRequest(BaseModel):
    selected_documents: list[Document]
    narrative: str
    question: str
    conversation_history: list[Message] = []
    tool_agent_model: str
    primary_agent_model: str
    final_agent_model: str


class ChatResponse(BaseModel):
    response: str
