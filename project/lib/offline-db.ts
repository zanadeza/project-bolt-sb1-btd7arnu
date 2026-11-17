import type { DictionaryEntry } from './supabase';

const DB_NAME = 'lingua-db';
const STORE = 'dictionary';
const META_STORE = 'meta';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' });
        store.createIndex('lookup', ['source_lang', 'source_normalized'], { unique: false });
        store.createIndex('prefix', ['source_lang', 'source_word'], { unique: false });
        store.createIndex('category', ['source_lang', 'category'], { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return dbPromise;
}

function tx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function bulkInsert(entries: DictionaryEntry[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    for (const entry of entries) {
      store.put(entry);
    }
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function lookupExact(
  sourceLang: string,
  normalized: string,
): Promise<DictionaryEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    const index = store.index('lookup');
    const req = index.getAll([sourceLang, normalized]);
    req.onsuccess = () => resolve(req.result as DictionaryEntry[]);
    req.onerror = () => reject(req.error);
  });
}

export async function searchPrefix(
  sourceLang: string,
  prefix: string,
  limit = 20,
): Promise<DictionaryEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    const index = store.index('prefix');
    const upper = prefix.slice(0, prefix.length - 1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);
    const range = IDBKeyRange.bound([sourceLang, prefix], [sourceLang, upper]);
    const req = index.getAll(range, limit);
    req.onsuccess = () => resolve(req.result as DictionaryEntry[]);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllByLang(sourceLang: string): Promise<DictionaryEntry[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    const index = store.index('prefix');
    const range = IDBKeyRange.bound([sourceLang, ''], [sourceLang, '\uffff']);
    const req = index.getAll(range);
    req.onsuccess = () => resolve(req.result as DictionaryEntry[]);
    req.onerror = () => reject(req.error);
  });
}

export async function countEntries(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const store = transaction.objectStore(STORE);
    const req = store.count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await tx(META_STORE, 'readwrite', (store) =>
    store.put({ key, value }),
  );
}

export async function getMeta<T>(key: string): Promise<T | null> {
  const result = await tx(META_STORE, 'readonly', (store) =>
    store.get(key) as IDBRequest<{ key: string; value: T } | undefined>,
  );
  return result?.value ?? null;
}
