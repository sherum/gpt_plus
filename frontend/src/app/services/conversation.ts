import { Service, effect, inject, signal } from '@angular/core';

import { Chat } from './chat';
import { WorldFolders } from './world-folders';
import { ChatDocument, ChatRequest } from '../models/chat-request';
import { ConversationSession } from '../models/conversation-session';
import { Message } from '../models/message';
import { SourceDocument } from '../models/source-document';
import { WorldFolder } from '../models/world-folder';

const STORAGE_KEY = 'last-conversation-session';

@Service()
export class ConversationStore {
  private readonly worldFolders = inject(WorldFolders);
  private readonly chatService = inject(Chat);

  readonly folders = this.worldFolders.folders;
  readonly folderAccessSupported = this.worldFolders.supported;
  readonly currentFolder = signal('');
  readonly needsAccess = signal(false);
  readonly linkFolders = signal(false);
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
    const saved = this.loadSession();
    if (saved) {
      this.selectedSources.set(new Set(saved.selectedSources));
      this.currentFolder.set(saved.currentFolder ?? '');
      this.linkFolders.set(saved.linkFolders ?? false);
      this.narrative.set(saved.narrative);
      this.history.set(saved.history);
    }
    this.worldFolders.ready.then(() => this.loadSources());

    effect(() => {
      const history = this.history();
      if (history.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      const session: ConversationSession = {
        selectedSources: Array.from(this.selectedSources()),
        currentFolder: this.currentFolder(),
        linkFolders: this.linkFolders(),
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

  private async loadSources(): Promise<void> {
    const folder = this.worldFolders.find(this.currentFolder());
    this.needsAccess.set(false);
    this.sources.set([]);
    if (!folder) {
      return;
    }
    if (!(await this.worldFolders.hasAccess(folder))) {
      this.needsAccess.set(true);
      return;
    }
    const names = await this.worldFolders.listDocuments(folder);
    this.sources.set(names.map((filename) => ({ filename, path: `${folder.id}/${filename}` })));
  }

  private async ensureAccess(folder: WorldFolder): Promise<void> {
    if (!(await this.worldFolders.hasAccess(folder)) && !(await this.worldFolders.requestAccess(folder))) {
      throw new Error(`Access denied to ${folder.handle.name}`);
    }
  }

  private async readDocument(path: string): Promise<ChatDocument> {
    const [id, filename] = path.split('/');
    const folder = this.worldFolders.find(id)!;
    await this.ensureAccess(folder);
    return {
      filename: `${folder.handle.name}/${filename}`,
      content: await this.worldFolders.read(folder, filename),
    };
  }

  documentLabel(path: string): string {
    const [id, filename] = path.split('/');
    return `${this.worldFolders.find(id)?.handle.name ?? 'unknown folder'}/${filename}`;
  }

  async addFolder(): Promise<void> {
    try {
      const folder = await this.worldFolders.add();
      await this.changeFolder(folder.id);
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        this.error.set('Unable to add the folder.');
      }
    }
  }

  async changeFolder(id: string): Promise<void> {
    if (!this.linkFolders()) {
      this.selectedSources.set(new Set());
    }
    this.previewContent.set('');
    this.currentFolder.set(id);
    await this.loadSources();
  }

  async grantAccess(): Promise<void> {
    await this.worldFolders.requestAccess(this.worldFolders.find(this.currentFolder())!);
    await this.loadSources();
  }

  async toggleSource(path: string): Promise<void> {
    const next = new Set(this.selectedSources());
    if (next.has(path)) {
      next.delete(path);
      this.previewContent.set('');
    } else {
      next.add(path);
      this.readDocument(path).then(
        (document) => this.previewContent.set(document.content),
        () => this.previewContent.set('Unable to load preview.'),
      );
    }
    this.selectedSources.set(next);
  }

  async saveSource(content: string): Promise<void> {
    if (!content.trim() || this.savingSource()) {
      return;
    }
    const folder = this.worldFolders.find(this.currentFolder());
    if (!folder) {
      this.error.set('Add or select a folder before saving a document.');
      return;
    }
    this.savingSource.set(true);
    try {
      await this.ensureAccess(folder);
      await this.worldFolders.create(folder, content);
      await this.loadSources();
    } catch {
      this.error.set('Unable to save source document.');
    } finally {
      this.savingSource.set(false);
    }
  }

  submit(): void {
    const question = this.question().trim();
    if (!question || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.readSelectedDocuments().then(
      (documents) => this.send(question, documents),
      () => {
        this.error.set('Unable to read the selected documents.');
        this.loading.set(false);
      },
    );
  }

  private async readSelectedDocuments(): Promise<ChatDocument[]> {
    const documents: ChatDocument[] = [];
    for (const path of this.selectedSources()) {
      documents.push(await this.readDocument(path));
    }
    return documents;
  }

  private send(question: string, documents: ChatDocument[]): void {
    const request: ChatRequest = {
      selected_documents: documents,
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
