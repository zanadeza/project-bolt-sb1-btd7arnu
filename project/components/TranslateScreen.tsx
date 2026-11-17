import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeftRight,
  Star,
  Star as StarOutline,
  Copy,
  Check,
  Volume2,
  Search,
  X,
  BookOpen,
} from 'lucide-react-native';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { translate, type TranslationResult } from '@/lib/translator';
import { addToHistory, isFavorite, toggleFavorite } from '@/lib/storage';
import type { DictionaryEntry } from '@/lib/supabase';

type Lang = 'ar' | 'en';

const langLabels: Record<Lang, string> = {
  ar: 'العربية',
  en: 'English',
};

const langDirections: Record<Lang, 'rtl' | 'ltr'> = {
  ar: 'rtl',
  en: 'ltr',
};

export default function TranslateScreen() {
  const [sourceLang, setSourceLang] = useState<Lang>('ar');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [fav, setFav] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<DictionaryEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetLang: Lang = sourceLang === 'ar' ? 'en' : 'ar';

  const runTranslate = useCallback(
    async (text: string, lang: Lang) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setResult(null);
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        const res = await translate(trimmed, lang);
        setResult(res);
        setSuggestions(res.suggestions);
        setFav(isFavorite(res.source, res.sourceLang));
        if (res.matched || res.target) {
          addToHistory(res);
        }
      } catch {
        setResult(null);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      setResult(null);
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runTranslate(input, sourceLang);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, sourceLang, runTranslate]);

  const swapLangs = () => {
    setSourceLang(targetLang);
    setInput(result?.target || '');
    setResult(null);
  };

  const handleFav = () => {
    if (!result) return;
    const nowFav = toggleFavorite(result);
    setFav(nowFav);
  };

  const copyResult = async () => {
    if (!result?.target) return;
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(result.target);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const speak = () => {
    if (!result?.target) return;
    try {
      if (Platform.OS === 'web' && 'speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(result.target);
        utter.lang = targetLang === 'ar' ? 'ar-SA' : 'en-US';
        window.speechSynthesis.speak(utter);
      }
    } catch {
      // ignore
    }
  };

  const pickSuggestion = (entry: DictionaryEntry) => {
    setInput(entry.source_word);
    runTranslate(entry.source_word, sourceLang);
    Keyboard.dismiss();
  };

  return (
    <LinearGradient
      colors={[colors.neutral[50], colors.primary[50], colors.neutral[100]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>المترجم · Translator</Text>
        </View>

        <View style={styles.langSwitcher}>
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>{langLabels[sourceLang]}</Text>
          </View>
          <TouchableOpacity style={styles.swapBtn} onPress={swapLangs} activeOpacity={0.7}>
            <LinearGradient
              colors={[colors.primary[500], colors.primary[700]]}
              style={styles.swapCircle}
            >
              <ArrowLeftRight size={20} color={colors.neutral[0]} strokeWidth={2} />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.langPill}>
            <Text style={styles.langPillText}>{langLabels[targetLang]}</Text>
          </View>
        </View>

        <View style={styles.inputCard}>
          <TextInput
            style={[
              styles.input,
              { textAlign: langDirections[sourceLang] === 'rtl' ? 'right' : 'left' },
              sourceLang === 'ar' && { fontFamily: typography.arabic, fontSize: 20 },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder={sourceLang === 'ar' ? 'اكتب النص للترجمة...' : 'Type text to translate...'}
            placeholderTextColor={colors.neutral[400]}
            multiline
            autoCorrect={false}
            autoCapitalize="none"
          />
          {input.length > 0 && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => {
                setInput('');
                setResult(null);
                setSuggestions([]);
              }}
            >
              <X size={18} color={colors.neutral[400]} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>

        {result && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultLabelRow}>
                <BookOpen size={16} color={colors.primary[600]} strokeWidth={2} />
                <Text style={styles.resultLabel}>{langLabels[targetLang]}</Text>
                {result.matched ? (
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>مطابق · Exact</Text>
                  </View>
                ) : (
                  <View style={[styles.matchBadge, { backgroundColor: colors.warning[500] + '22' }]}>
                    <Text style={[styles.matchBadgeText, { color: colors.warning[500] }]}>تقريبي · Close</Text>
                  </View>
                )}
              </View>
              <View style={styles.resultActions}>
                <TouchableOpacity onPress={handleFav} style={styles.iconBtn}>
                  {fav ? (
                    <Star size={20} color={colors.accent[500]} fill={colors.accent[500]} strokeWidth={2} />
                  ) : (
                    <StarOutline size={20} color={colors.neutral[400]} strokeWidth={2} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={speak} style={styles.iconBtn}>
                  <Volume2 size={20} color={colors.primary[600]} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity onPress={copyResult} style={styles.iconBtn}>
                  {copied ? (
                    <Check size={20} color={colors.success[500]} strokeWidth={2} />
                  ) : (
                    <Copy size={20} color={colors.primary[600]} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text
              style={[
                styles.resultText,
                { textAlign: langDirections[targetLang] === 'rtl' ? 'right' : 'left' },
                targetLang === 'ar' && { fontFamily: typography.arabicBold, fontSize: 24 },
              ]}
            >
              {result.target || (sourceLang === 'ar' ? 'لم يتم العثور على ترجمة' : 'No translation found')}
            </Text>

            {result.category !== 'general' && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryText}>{result.category}</Text>
              </View>
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingRow}>
            <Text style={styles.loadingText}>...جارٍ البحث</Text>
          </View>
        )}

        {suggestions.length > 0 && !loading && (
          <View style={styles.suggestionsCard}>
            <Text style={styles.suggestionsTitle}>
              {sourceLang === 'ar' ? 'اقتراحات ذات صلة' : 'Related suggestions'}
            </Text>
            {suggestions.slice(0, 6).map((s, i) => (
              <TouchableOpacity
                key={`${s.id}-${i}`}
                style={styles.suggestionItem}
                onPress={() => pickSuggestion(s)}
              >
                <View style={styles.suggestionContent}>
                  <Text
                    style={[
                      styles.suggestionSource,
                      sourceLang === 'ar' && { fontFamily: typography.arabic },
                    ]}
                  >
                    {s.source_word}
                  </Text>
                  <Text style={styles.suggestionArrow}>→</Text>
                  <Text
                    style={[
                      styles.suggestionTarget,
                      targetLang === 'ar' && { fontFamily: typography.arabic },
                    ]}
                  >
                    {s.target_word}
                  </Text>
                </View>
                <Text style={styles.suggestionCategory}>{s.category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!result && !loading && !input.trim() && (
          <View style={styles.emptyState}>
            <Search size={40} color={colors.neutral[300]} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>
              {sourceLang === 'ar' ? 'ابدأ بالكتابة للترجمة' : 'Start typing to translate'}
            </Text>
            <Text style={styles.emptySub}>
              {sourceLang === 'ar'
                ? 'قاعدة البيانات محملة وجاهزة بدون إنترنت'
                : 'Dictionary loaded and ready offline'}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 } as ViewStyle,
  safe: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: colors.neutral[700],
    letterSpacing: 0.5,
  },
  langSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  langPill: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  langPillText: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: colors.neutral[700],
  },
  swapBtn: {},
  swapCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary[700],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  inputCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 18,
    color: colors.neutral[800],
    minHeight: 80,
    lineHeight: 28,
    padding: 0,
  },
  clearBtn: {
    padding: spacing.xs,
    marginTop: 4,
  },
  resultCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary[100],
    shadowColor: colors.primary[600],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resultLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultLabel: {
    fontFamily: typography.bodyMedium,
    fontSize: 14,
    color: colors.neutral[600],
  },
  matchBadge: {
    backgroundColor: colors.success[500] + '1a',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  matchBadgeText: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    color: colors.success[600],
  },
  resultActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    padding: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  resultText: {
    fontFamily: typography.headingRegular,
    fontSize: 22,
    color: colors.neutral[900],
    lineHeight: 32,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  categoryText: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    color: colors.primary[700],
    textTransform: 'capitalize',
  },
  loadingRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  loadingText: {
    fontFamily: typography.arabic,
    fontSize: 14,
    color: colors.neutral[400],
  },
  suggestionsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  suggestionsTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 13,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  suggestionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  suggestionSource: {
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: colors.neutral[800],
  },
  suggestionArrow: {
    fontSize: 14,
    color: colors.neutral[300],
  },
  suggestionTarget: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.primary[700],
    flex: 1,
  },
  suggestionCategory: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.neutral[400],
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 16,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  emptySub: {
    fontFamily: typography.arabic,
    fontSize: 13,
    color: colors.neutral[400],
    marginTop: spacing.xs,
  },
});
