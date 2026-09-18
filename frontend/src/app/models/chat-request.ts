import { Message } from './message';

export interface ChatRequest {
  selected_sources: string[];
  narrative: string;
  question: string;
  conversation_history: Message[];
  tool_agent_model: string;
  primary_agent_model: string;
  final_agent_model: string;
}
