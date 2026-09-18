import { Component } from '@angular/core';

import { Header } from './components/header/header';
import { ContextSelector } from './components/context-selector/context-selector';
import { Conversation } from './components/conversation/conversation';
import { NarrativeEditor } from './components/narrative-editor/narrative-editor';
import { QuestionInput } from './components/question-input/question-input';

@Component({
  imports: [Header, ContextSelector, Conversation, NarrativeEditor, QuestionInput],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
