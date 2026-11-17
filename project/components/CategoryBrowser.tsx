import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Folder } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { getAllByLang } from '@/lib/offline-db';
import type { DictionaryEntry } from '@/lib/supabase';

type Props = {
  onBack: () => void;
};

const categories = [
  { key: 'greeting', ar: 'تحيات', en: 'Greetings' },
  { key: 'family', ar: 'عائلة', en: 'Family' },
  { key: 'food', ar: 'طعام', en: 'Food' },
  { key: 'travel', ar: 'سفر', en: 'Travel' },
  { key: 'number', ar: 'أرقام', en: 'Numbers' },
  { key: 'time', ar: 'وقت', en: 'Time' },
  { key: 'weather', ar: 'طقس', en: 'Weather' },
  { key: 'color', ar: 'ألوان', en: 'Colors' },
  { key: 'animal', ar: 'حيوانات', en: 'Animals' },
  { key: 'body', ar: 'الجسم', en: 'Body' },
  { key: 'health', ar: 'صحة', en: 'Health' },
  { key: 'general', ar: 'عام', en: 'General' },
  { key: 'emergency', ar: 'طوارئ', en: 'Emergency' },
  { key: 'shopping', ar: 'تسوق', en: 'Shopping' },
];

export default function CategoryBrowser({ onBack }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [items, setItems] = useState<DictionaryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategory = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const all = await getAllByLang('ar');
      const filtered = all.filter((e) => e.category === category);
      setItems(filtered);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) {
      loadCategory(selected);
    }
  }, [selected, loadCategory]);

  if (selected) {
    const cat = categories.find((c) => c.key === selected);
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setSelected(null)}>
              <ChevronLeft size={22} color={colors.primary[600]} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{cat?.ar} · {cat?.en}</Text>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>...جارٍ التحميل</Text>
            </View>
          ) : items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>لا توجد مدخلات في هذه الفئة</Text>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.wordCard}>
                  <View style={styles.wordRow}>
                    <Text style={[styles.wordAr, { fontFamily: typography.arabic }]}>
                      {item.source_word}
                    </Text>
                    <Text style={styles.wordArrow}>→</Text>
                    <Text style={styles.wordEn}>{item.target_word}</Text>
                  </View>
                  <View style={styles.wordTypeRow}>
                    <Text style={styles.wordType}>
                      {item.word_type === 'phrase' ? 'جملة · Phrase' : 'كلمة · Word'}
                    </Text>
                  </View>
                </View>
              )}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={22} color={colors.primary[600]} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تصفح الفئات · Categories</Text>
        </View>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.key}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.catCard}
              onPress={() => setSelected(item.key)}
              activeOpacity={0.7}
            >
              <View style={styles.catIconWrap}>
                <Folder size={24} color={colors.primary[600]} strokeWidth={2} />
              </View>
              <Text style={styles.catAr}>{item.ar}</Text>
              <Text style={styles.catEn}>{item.en}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] } as ViewStyle,
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: colors.neutral[800],
  },
  list: {
    padding: spacing.lg,
  },
  catCard: {
    flex: 1,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    margin: spacing.sm / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  catIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  catAr: {
    fontFamily: typography.arabicBold,
    fontSize: 15,
    color: colors.neutral[800],
    marginBottom: 2,
  },
  catEn: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.neutral[400],
  },
  wordCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  wordAr: {
    flex: 1,
    fontSize: 18,
    color: colors.neutral[800],
    textAlign: 'right',
  },
  wordArrow: {
    fontSize: 16,
    color: colors.neutral[300],
  },
  wordEn: {
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: colors.primary[700],
  },
  wordTypeRow: {
    marginTop: spacing.sm,
  },
  wordType: {
    fontFamily: typography.arabic,
    fontSize: 11,
    color: colors.neutral[400],
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: typography.arabic,
    fontSize: 14,
    color: colors.neutral[400],
  },
});
