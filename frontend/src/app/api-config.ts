// Overridden at build time via the NG_API_BASE_URL define (see vercel.json).
// Falls back to the local backend when the define isn't set, e.g. `ng serve`.
declare const NG_API_BASE_URL: string;

export const API_BASE_URL = typeof NG_API_BASE_URL === 'undefined' ? 'http://localhost:8123' : NG_API_BASE_URL;
