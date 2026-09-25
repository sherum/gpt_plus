import { Component } from '@angular/core';

import { TopResize } from '../../directives/top-resize';
import { ConversationStore } from '../../services/conversation';

@Component({
  selector: 'app-question-input',
  imports: [TopResize],
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
