import { Service, effect, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

@Service()
export class Theme {
  readonly dark = signal(localStorage.getItem(STORAGE_KEY) === 'dark');

  constructor() {
    effect(() => {
      const value = this.dark() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-bs-theme', value);
      localStorage.setItem(STORAGE_KEY, value);
    });
  }

  toggle(): void {
    this.dark.update((value) => !value);
  }
}
