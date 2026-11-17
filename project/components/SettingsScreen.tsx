import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ViewStyle,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Settings as SettingsIcon,
  Database,
  WifiOff,
  Info,
  Globe,
  ChevronRight,
  Library,
  RefreshCw,
} from 'lucide-react-native';
import { colors, spacing, radius, typography } from '@/lib/theme';
import { countEntries } from '@/lib/offline-db';
import { useDictionarySync } from '@/lib/useDictionarySync';

type Props = {
  onBrowseCategories: () => void;
};

export default function SettingsScreen({ onBrowseCategories }: Props) {
  const [entryCount, setEntryCount] = useState(0);
  const { download, state, progress, loaded, total } = useDictionarySync();

  useEffect(() => {
    countEntries().then(setEntryCount).catch(() => {});
  }, []);

  const handleRedownload = () => {
    Alert.alert(
      'إعادة تحميل القاموس',
      'سيتم إعادة تحميل قاعدة البيانات. متابعة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'متابعة', onPress: () => download() },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <SettingsIcon size={22} color={colors.primary[600]} strokeWidth={2} />
          <Text style={styles.headerTitle}>الإعدادات · Settings</Text>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>قاعدة البيانات · Database</Text>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Database size={20} color={colors.primary[600]} strokeWidth={2} />
                  <View>
                    <Text style={styles.rowTitle}>عدد المدخلات</Text>
                    <Text style={styles.rowSub}>Dictionary entries</Text>
                  </View>
                </View>
                <Text style={styles.rowValue}>{entryCount.toLocaleString()}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <WifiOff size={20} color={colors.success[500]} strokeWidth={2} />
                  <View>
                    <Text style={styles.rowTitle}>وضع عدم الاتصال</Text>
                    <Text style={styles.rowSub}>Offline mode</Text>
                  </View>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>نشط · Active</Text>
                </View>
              </View>

              {state === 'downloading' ? (
                <View style={styles.divider} />
              ) : null}
              {state === 'downloading' && (
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <RefreshCw size={20} color={colors.primary[600]} strokeWidth={2} />
                    <View>
                      <Text style={styles.rowTitle}>جارٍ التحديث...</Text>
                      <Text style={styles.rowSub}>{loaded} / {total} · {progress}%</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>تصفح · Browse</Text>

            <TouchableOpacity style={styles.card} onPress={onBrowseCategories} activeOpacity={0.7}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Library size={20} color={colors.primary[600]} strokeWidth={2} />
                  <View>
                    <Text style={styles.rowTitle}>تصفح حسب الفئة</Text>
                    <Text style={styles.rowSub}>Browse by category</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.neutral[300]} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>صيانة · Maintenance</Text>

            <TouchableOpacity style={styles.card} onPress={handleRedownload} activeOpacity={0.7}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <RefreshCw size={20} color={colors.primary[600]} strokeWidth={2} />
                  <View>
                    <Text style={styles.rowTitle}>إعادة تحميل القاموس</Text>
                    <Text style={styles.rowSub}>Re-download dictionary</Text>
                  </View>
                </View>
                <ChevronRight size={20} color={colors.neutral[300]} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>حول التطبيق · About</Text>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Info size={20} color={colors.primary[600]} strokeWidth={2} />
                  <View>
                    <Text style={styles.rowTitle}>لِنْجُوَا · Lingua</Text>
                    <Text style={styles.rowSub}>Offline Arabic - English Translator</Text>
                  </View>
                </View>
                <Text style={styles.rowValue}>v1.0</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <Globe size={20} color={colors.primary[600]} strokeWidth={2} />
                  <View>
                    <Text style={styles.rowTitle}>اللغات المدعومة</Text>
                    <Text style={styles.rowSub}>Supported languages</Text>
                  </View>
                </View>
                <Text style={styles.rowValue}>AR · EN</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>صُنع بحب · Made with care</Text>
          </View>
        </ScrollView>
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
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: colors.neutral[800],
  },
  scroll: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 13,
    color: colors.neutral[500],
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  card: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  rowTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 14,
    color: colors.neutral[800],
  },
  rowSub: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.neutral[400],
    marginTop: 2,
  },
  rowValue: {
    fontFamily: typography.heading,
    fontSize: 15,
    color: colors.primary[700],
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing.md,
  },
  activeBadge: {
    backgroundColor: colors.success[500] + '1a',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  activeText: {
    fontFamily: typography.arabic,
    fontSize: 11,
    color: colors.success[600],
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  footerText: {
    fontFamily: typography.arabic,
    fontSize: 12,
    color: colors.neutral[300],
  },
});
