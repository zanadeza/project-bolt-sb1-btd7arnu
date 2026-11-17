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
import { History, Trash2, Star as StarOutline, ArrowRight } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { getHistory, clearHistory, type HistoryItem } from '@/lib/storage';

type Props = {
  onGoTranslate: () => void;
};

export default function HistoryScreen({ onGoTranslate }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setItems(getHistory());
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleClear = () => {
    clearHistory();
    setItems([]);
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={styles.itemTop}>
          <Text
            style={[
              styles.itemSource,
              item.sourceLang === 'ar' && { fontFamily: typography.arabic, textAlign: 'right' },
            ]}
            numberOfLines={2}
          >
            {item.source}
          </Text>
          <ArrowRight size={16} color={colors.neutral[300]} strokeWidth={2} />
          <Text
            style={[
              styles.itemTarget,
              item.targetLang === 'ar' && { fontFamily: typography.arabic, textAlign: 'right' },
            ]}
            numberOfLines={2}
          >
            {item.target || '—'}
          </Text>
        </View>
        <View style={styles.itemMeta}>
          <View style={styles.langTags}>
            <Text style={styles.langTag}>{item.sourceLang.toUpperCase()}</Text>
            <Text style={styles.langArrow}>→</Text>
            <Text style={styles.langTag}>{item.targetLang.toUpperCase()}</Text>
          </View>
          <Text style={styles.categoryTag}>{item.category}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <History size={22} color={colors.primary[600]} strokeWidth={2} />
            <Text style={styles.headerTitle}>السجل · History</Text>
          </View>
          {items.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Trash2 size={18} color={colors.error[500]} strokeWidth={2} />
              <Text style={styles.clearText}>مسح</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <StarOutline size={44} color={colors.neutral[300]} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>لا يوجد سجل بعد</Text>
            <Text style={styles.emptySub}>Your translation history will appear here.</Text>
            <TouchableOpacity style={styles.goBtn} onPress={onGoTranslate}>
              <Text style={styles.goBtnText}>ابدأ الترجمة · Start translating</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            onRefresh={load}
            refreshing={refreshing}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] } as ViewStyle,
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.neutral[0],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: colors.neutral[800],
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
  },
  clearText: {
    fontFamily: typography.arabic,
    fontSize: 13,
    color: colors.error[500],
  },
  list: {
    padding: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  itemContent: {},
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  itemSource: {
    flex: 1,
    fontFamily: typography.bodyMedium,
    fontSize: 15,
    color: colors.neutral[800],
  },
  itemTarget: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.primary[700],
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  langTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  langTag: {
    fontFamily: typography.bodyBold,
    fontSize: 10,
    color: colors.neutral[500],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langArrow: {
    fontSize: 10,
    color: colors.neutral[300],
  },
  categoryTag: {
    fontFamily: typography.body,
    fontSize: 10,
    color: colors.primary[600],
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 18,
    color: colors.neutral[500],
    marginTop: spacing.md,
  },
  emptySub: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.neutral[400],
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  goBtn: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
  },
  goBtnText: {
    fontFamily: typography.arabic,
    fontSize: 14,
    color: colors.neutral[0],
  },
});
