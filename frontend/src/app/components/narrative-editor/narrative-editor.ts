import { Component } from '@angular/core';

import { ConversationStore } from '../../services/conversation';

@Component({
  selector: 'app-narrative-editor',
  imports: [],
  templateUrl: './narrative-editor.html',
  styleUrl: './narrative-editor.css',
})
export class NarrativeEditor {
  constructor(readonly conversation: ConversationStore) {}

  onInput(value: string): void {
    this.conversation.narrative.set(value);
  }
}
