import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../api-config';
import { ChatRequest } from '../models/chat-request';
import { ChatResponse } from '../models/chat-response';

@Service()
export class Chat {
  private readonly http = inject(HttpClient);

  send(request: ChatRequest) {
    return this.http.post<ChatResponse>(`${API_BASE_URL}/chat`, request);
  }
}
