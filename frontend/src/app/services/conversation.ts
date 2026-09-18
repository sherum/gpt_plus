import { Service, effect, inject, signal } from '@angular/core';

import { Chat } from './chat';
import { Source } from './source';
import { ChatRequest } from '../models/chat-request';
import { ConversationSession } from '../models/conversation-session';
import { Message } from '../models/message';
import { SourceDocument } from '../models/source-document';

const STORAGE_KEY = 'last-conversation-session';

@Service()
export class ConversationStore {
  private readonly sourceService = inject(Source);
  private readonly chatService = inject(Chat);

  readonly sources = signal<SourceDocument[]>([]);
  readonly selectedSources = signal<Set<string>>(new Set());
  readonly narrative = signal('');
  readonly question = signal('');
  readonly history = signal<Message[]>([]);
  readonly loading = signal(false);
  readonly savingSource = signal(false);
  readonly error = signal<string | null>(null);

  readonly previewContent = signal('');

  readonly toolAgentModel = signal('anthropic/claude-haiku-4.5');
  readonly primaryAgentModel = signal('openai/gpt-5.4-mini');
  readonly finalAgentModel = signal('openai/gpt-5.6-sol');

  constructor() {
    this.sourceService.list().subscribe({
      next: (docs) => this.sources.set(docs),
      error: () => this.error.set('Unable to load world-building sources.'),
    });

    const saved = this.loadSession();
    if (saved) {
      this.selectedSources.set(new Set(saved.selectedSources));
      this.narrative.set(saved.narrative);
      this.history.set(saved.history);
    }

    effect(() => {
      const history = this.history();
      if (history.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const session: ConversationSession = {
        selectedSources: Array.from(this.selectedSources()),
        narrative: this.narrative(),
        history,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    });
  }

  private loadSession(): ConversationSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as ConversationSession;
    } catch {
      return null;
    }
  }

  toggleSource(filename: string): void {
    const next = new Set(this.selectedSources());
    if (next.has(filename)) {
      next.delete(filename);
      this.previewContent.set('');
    } else {
      next.add(filename);
      this.sourceService.get(filename).subscribe({
        next: (result) => this.previewContent.set(result.content),
        error: () => this.previewContent.set('Unable to load preview.'),
      });
    }
    this.selectedSources.set(next);
  }

  saveSource(content: string): void {
    if (!content.trim() || this.savingSource()) {
      return;
    }
    this.savingSource.set(true);
    this.sourceService.create(content).subscribe({
      next: (doc) => {
        this.sources.update((s) => [...s, doc]);
        this.savingSource.set(false);
      },
      error: () => {
        this.error.set('Unable to save source document.');
        this.savingSource.set(false);
      },
    });
  }

  submit(): void {
    const question = this.question().trim();
    if (!question || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const request: ChatRequest = {
      selected_sources: Array.from(this.selectedSources()),
      narrative: this.narrative(),
      question,
      conversation_history: this.history(),
      tool_agent_model: this.toolAgentModel(),
      primary_agent_model: this.primaryAgentModel(),
      final_agent_model: this.finalAgentModel(),
    };
    this.chatService.send(request).subscribe({
      next: (result) => {
        this.history.update((h) => [
          ...h,
          { role: 'prompt', content: question },
          { role: 'response', content: result.response },
        ]);
        this.question.set('');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The request failed. Please try again.');
        this.loading.set(false);
      },
    });
  }

  newConversation(): void {
    this.history.set([]);
    this.question.set('');
    this.error.set(null);
  }
}
