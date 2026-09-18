import { Message } from './message';

export interface ChatDocument {
  filename: string;
  content: string;
}

export interface ChatRequest {
  selected_documents: ChatDocument[];
  narrative: string;
  question: string;
  conversation_history: Message[];
  tool_agent_model: string;
  primary_agent_model: string;
  final_agent_model: string;
}
