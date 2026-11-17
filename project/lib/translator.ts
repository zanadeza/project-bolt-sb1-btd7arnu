import { lookupExact, searchPrefix } from './offline-db';
import type { DictionaryEntry } from './supabase';

export type TranslationResult = {
  source: string;
  target: string;
  sourceLang: string;
  targetLang: string;
  matched: boolean;
  category: string;
  wordType: string;
  suggestions: DictionaryEntry[];
};

function normalize(text: string, lang: string): string {
  const trimmed = text.trim().toLowerCase();
  if (lang === 'ar') {
    return trimmed
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[إأآا]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, ' ');
  }
  return trimmed.replace(/\s+/g, ' ');
}

function flip(lang: string): string {
  return lang === 'ar' ? 'en' : 'ar';
}

export async function translate(
  text: string,
  sourceLang: string,
): Promise<TranslationResult> {
  const targetLang = flip(sourceLang);
  const normalized = normalize(text, sourceLang);

  if (!normalized) {
    return {
      source: text,
      target: '',
      sourceLang,
      targetLang,
      matched: false,
      category: 'general',
      wordType: 'word',
      suggestions: [],
    };
  }

  const exact = await lookupExact(sourceLang, normalized);

  if (exact.length > 0) {
    const primary = exact[0];
    return {
      source: text,
      target: primary.target_word,
      sourceLang,
      targetLang,
      matched: true,
      category: primary.category,
      wordType: primary.word_type,
      suggestions: exact.slice(1, 5),
    };
  }

  const suggestions = await searchPrefix(sourceLang, normalized, 10);

  return {
    source: text,
    target: suggestions.length > 0 ? suggestions[0].target_word : '',
    sourceLang,
    targetLang,
    matched: false,
    category: suggestions[0]?.category ?? 'general',
    wordType: suggestions[0]?.word_type ?? 'word',
    suggestions,
  };
}
