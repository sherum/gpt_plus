import { Component } from '@angular/core';
import { marked } from 'marked';

import { ConversationStore } from '../../services/conversation';

@Component({
  selector: 'app-conversation',
  imports: [],
  templateUrl: './conversation.html',
  styleUrl: './conversation.css',
})
export class Conversation {
  constructor(readonly conversation: ConversationStore) {}

  renderMarkdown(content: string): string {
    return marked.parse(content, { async: false });
  }
}
