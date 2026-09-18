import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_BASE_URL } from '../api-config';
import { SourceContent } from '../models/source-content';
import { SourceDocument } from '../models/source-document';

@Service()
export class Source {
  private readonly http = inject(HttpClient);

  folders() {
    return this.http.get<string[]>(`${API_BASE_URL}/folders`);
  }

  list(folder: string) {
    return this.http.get<SourceDocument[]>(`${API_BASE_URL}/sources`, { params: { folder } });
  }

  get(path: string) {
    return this.http.get<SourceContent>(`${API_BASE_URL}/sources/${path.split('/').map(encodeURIComponent).join('/')}`);
  }

  create(content: string, folder: string) {
    return this.http.post<SourceDocument>(`${API_BASE_URL}/sources`, { content, folder });
  }
}
