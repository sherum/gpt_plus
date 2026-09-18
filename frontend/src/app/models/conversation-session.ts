import { Message } from './message';

export interface ConversationSession {
  selectedSources: string[];
  currentFolder: string;
  linkFolders: boolean;
  narrative: string;
  history: Message[];
}
