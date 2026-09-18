import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../api-config';
import { SourceContent } from '../models/source-content';
import { SourceDocument } from '../models/source-document';

@Service()
export class Source {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<SourceDocument[]>(`${API_BASE_URL}/sources`);
  }

  get(filename: string) {
    return this.http.get<SourceContent>(`${API_BASE_URL}/sources/${encodeURIComponent(filename)}`);
  }

  create(content: string) {
    return this.http.post<SourceDocument>(`${API_BASE_URL}/sources`, { content });
  }
}
