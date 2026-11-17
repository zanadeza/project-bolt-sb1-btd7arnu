import type { TranslationResult } from './translator';

export type HistoryItem = {
  id: string;
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  category: string;
  createdAt: number;
};

export type FavoriteItem = HistoryItem;

const HISTORY_KEY = 'lingua_history';
const FAVORITES_KEY = 'lingua_favorites';
const MAX_HISTORY = 100;

function read(key: string): HistoryItem[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, items: HistoryItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(items));
    }
  } catch {
    // storage full or unavailable
  }
}

export function getHistory(): HistoryItem[] {
  return read(HISTORY_KEY);
}

export function addToHistory(result: TranslationResult): void {
  const items = read(HISTORY_KEY);
  const entry: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: result.source,
    target: result.target,
    sourceLang: result.sourceLang,
    targetLang: result.targetLang,
    category: result.category,
    createdAt: Date.now(),
  };
  const filtered = items.filter((i) => !(i.source === entry.source && i.sourceLang === entry.sourceLang));
  write(HISTORY_KEY, [entry, ...filtered].slice(0, MAX_HISTORY));
}

export function clearHistory(): void {
  write(HISTORY_KEY, []);
}

export function getFavorites(): FavoriteItem[] {
  return read(FAVORITES_KEY);
}

export function isFavorite(source: string, sourceLang: string): boolean {
  return read(FAVORITES_KEY).some(
    (i) => i.source === source && i.sourceLang === sourceLang,
  );
}

export function toggleFavorite(result: TranslationResult): boolean {
  const items = read(FAVORITES_KEY);
  const exists = items.some(
    (i) => i.source === result.source && i.sourceLang === result.sourceLang,
  );
  if (exists) {
    write(
      FAVORITES_KEY,
      items.filter(
        (i) => !(i.source === result.source && i.sourceLang === result.sourceLang),
      ),
    );
    return false;
  }
  const entry: FavoriteItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: result.source,
    target: result.target,
    sourceLang: result.sourceLang,
    targetLang: result.targetLang,
    category: result.category,
    createdAt: Date.now(),
  };
  write(FAVORITES_KEY, [entry, ...items]);
  return true;
}

export function removeFavorite(id: string): void {
  write(
    FAVORITES_KEY,
    read(FAVORITES_KEY).filter((i) => i.id !== id),
  );
}
