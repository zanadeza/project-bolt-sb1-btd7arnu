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
import { Star, Trash2, ArrowRight, Heart } from 'lucide-react-native';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { getFavorites, removeFavorite, type FavoriteItem } from '@/lib/storage';

type Props = {
  onGoTranslate: () => void;
};

export default function FavoritesScreen({ onGoTranslate }: Props) {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  const load = useCallback(() => {
    setItems(getFavorites());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = (id: string) => {
    removeFavorite(id);
    setItems(getFavorites());
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
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
      <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item.id)}>
        <Trash2 size={16} color={colors.error[500]} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Star size={22} color={colors.accent[500]} fill={colors.accent[500]} strokeWidth={2} />
            <Text style={styles.headerTitle}>المفضلة · Favorites</Text>
          </View>
          {items.length > 0 && (
            <Text style={styles.countBadge}>{items.length}</Text>
          )}
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Heart size={44} color={colors.neutral[300]} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>لا توجد مفضلات بعد</Text>
            <Text style={styles.emptySub}>
              اضغط على النجمة بجانب الترجمة لإضافتها هنا.{'\n'}
              Tap the star next to a translation to save it here.
            </Text>
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
            refreshing={false}
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
  countBadge: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    color: colors.accent[600],
    backgroundColor: colors.accent[50],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    minWidth: 28,
    textAlign: 'center',
  },
  list: {
    padding: spacing.lg,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.md + 2,
    marginBottom: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.accent[100],
  },
  itemContent: {
    flex: 1,
  },
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
  removeBtn: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
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
    fontFamily: typography.arabic,
    fontSize: 13,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
    lineHeight: 20,
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
