import { Component } from '@angular/core';

import { ConversationStore } from '../../services/conversation';
import { Theme } from '../../services/theme';
import { MODEL_OPTIONS } from '../../models/model-options';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  readonly modelOptions = MODEL_OPTIONS;

  constructor(
    readonly conversation: ConversationStore,
    readonly theme: Theme,
  ) {}
}
