import { Component } from '@angular/core';

import { ConversationStore } from '../../services/conversation';

@Component({
  selector: 'app-context-selector',
  imports: [],
  templateUrl: './context-selector.html',
  styleUrl: './context-selector.css',
})
export class ContextSelector {
  constructor(readonly conversation: ConversationStore) {}

  isSelected(filename: string): boolean {
    return this.conversation.selectedSources().has(filename);
  }
}
