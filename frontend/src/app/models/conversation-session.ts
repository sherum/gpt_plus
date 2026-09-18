import { Message } from './message';

export interface ConversationSession {
  selectedSources: string[];
  narrative: string;
  history: Message[];
}
