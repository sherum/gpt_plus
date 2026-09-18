import { Service, signal } from '@angular/core';

import { WorldFolder } from '../models/world-folder';

const DB_NAME = 'world-folders';
const STORE = 'folders';
const DOCUMENT_PATTERN = /\.(txt|md)$/i;
const MODE = { mode: 'readwrite' } as const;

const db: Promise<IDBDatabase> = new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function loadFolders(): Promise<WorldFolder[]> {
  const connection = await db;
  return new Promise((resolve, reject) => {
    const request = connection.transaction(STORE).objectStore(STORE).getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function storeFolder(folder: WorldFolder): Promise<void> {
  const connection = await db;
  return new Promise((resolve, reject) => {
    const request = connection.transaction(STORE, 'readwrite').objectStore(STORE).put(folder);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

function sortByName(folders: WorldFolder[]): WorldFolder[] {
  return folders.sort((a, b) => a.handle.name.localeCompare(b.handle.name));
}

@Service()
export class WorldFolders {
  readonly supported = 'showDirectoryPicker' in window;
  readonly folders = signal<WorldFolder[]>([]);
  readonly ready: Promise<void> = loadFolders().then((folders) => this.folders.set(sortByName(folders)));

  async add(): Promise<WorldFolder> {
    const handle = await window.showDirectoryPicker(MODE);
    for (const existing of this.folders()) {
      if (await existing.handle.isSameEntry(handle)) {
        return existing;
      }
    }
    const folder: WorldFolder = { id: crypto.randomUUID(), handle };
    await storeFolder(folder);
    this.folders.update((folders) => sortByName([...folders, folder]));
    return folder;
  }

  find(id: string): WorldFolder | undefined {
    return this.folders().find((folder) => folder.id === id);
  }

  async hasAccess(folder: WorldFolder): Promise<boolean> {
    return (await folder.handle.queryPermission(MODE)) === 'granted';
  }

  async requestAccess(folder: WorldFolder): Promise<boolean> {
    return (await folder.handle.requestPermission(MODE)) === 'granted';
  }

  async listDocuments(folder: WorldFolder): Promise<string[]> {
    const names: string[] = [];
    for await (const [name, entry] of folder.handle.entries()) {
      if (entry.kind === 'file' && DOCUMENT_PATTERN.test(name) && !name.startsWith('.')) {
        names.push(name);
      }
    }
    return names.sort();
  }

  async read(folder: WorldFolder, filename: string): Promise<string> {
    const fileHandle = await folder.handle.getFileHandle(filename);
    return (await fileHandle.getFile()).text();
  }

  async create(folder: WorldFolder, content: string): Promise<string> {
    const existing = new Set(await this.listDocuments(folder));
    const firstLine = content.split('\n').map((line) => line.trim()).find(Boolean) ?? 'untitled';
    const slug = firstLine.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'untitled';
    let filename = `${slug}.txt`;
    for (let counter = 2; existing.has(filename); counter++) {
      filename = `${slug}_${counter}.txt`;
    }
    const writable = await (await folder.handle.getFileHandle(filename, { create: true })).createWritable();
    await writable.write(content);
    await writable.close();
    return filename;
  }
}
