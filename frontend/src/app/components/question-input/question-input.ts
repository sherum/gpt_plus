import { Component } from '@angular/core';

import { ConversationStore } from '../../services/conversation';

@Component({
  selector: 'app-question-input',
  imports: [],
  templateUrl: './question-input.html',
  styleUrl: './question-input.css',
})
export class QuestionInput {
  constructor(readonly conversation: ConversationStore) {}

  onInput(value: string): void {
    this.conversation.question.set(value);
  }

  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      this.conversation.submit();
    }
  }
}
