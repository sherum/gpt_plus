import { Component, computed } from '@angular/core';

import { ConversationStore } from '../../services/conversation';

@Component({
  selector: 'app-context-selector',
  imports: [],
  templateUrl: './context-selector.html',
  styleUrl: './context-selector.css',
})
export class ContextSelector {
  readonly otherFolderSelections = computed(() => {
    const listed = new Set(this.conversation.sources().map((s) => s.path));
    return Array.from(this.conversation.selectedSources()).filter((path) => !listed.has(path));
  });

  constructor(readonly conversation: ConversationStore) {}

  isSelected(path: string): boolean {
    return this.conversation.selectedSources().has(path);
  }
}
