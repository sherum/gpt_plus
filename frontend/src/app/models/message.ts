export interface Message {
  role: 'prompt' | 'response';
  content: string;
}
