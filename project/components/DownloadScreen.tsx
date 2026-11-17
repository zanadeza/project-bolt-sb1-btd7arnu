import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, CheckCircle2, AlertCircle, RefreshCw, Languages, WifiOff } from 'lucide-react-native';
import { useDictionarySync } from '@/lib/useDictionarySync';
import { colors, spacing, radius, typography } from '@/lib/theme';

type Props = {
  onComplete: () => void;
};

export default function DownloadScreen({ onComplete }: Props) {
  const { state, progress, total, loaded, error, download, checkSynced } = useDictionarySync();
  const [alreadySynced, setAlreadySynced] = useState(false);

  useEffect(() => {
    (async () => {
      const synced = await checkSynced();
      if (synced) {
        setAlreadySynced(true);
        onComplete();
      }
    })();
  }, [checkSynced, onComplete]);

  useEffect(() => {
    if (state === 'done') {
      const timer = setTimeout(() => onComplete(), 800);
      return () => clearTimeout(timer);
    }
  }, [state, onComplete]);

  return (
    <LinearGradient
      colors={[colors.primary[900], colors.primary[700], colors.primary[500]]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <LinearGradient
              colors={[colors.neutral[0], colors.primary[50]]}
              style={styles.iconCircle}
            >
              <Languages size={48} color={colors.primary[700]} strokeWidth={2} />
            </LinearGradient>
          </View>

          <Text style={styles.title}>لِنْجُوَا</Text>
          <Text style={styles.subtitle}>Lingua</Text>
          <Text style={styles.description}>
            مترجم عربي - إنجليزي يعمل بدون إنترنت{'\n'}
            Offline Arabic - English Translator
          </Text>

          <View style={styles.card}>
            {state === 'idle' && (
              <>
                <View style={styles.infoRow}>
                  <WifiOff size={20} color={colors.primary[600]} strokeWidth={2} />
                  <Text style={styles.infoText}>
                    حمّل قاعدة البيانات لمرة واحدة فقط، ثم استخدم المترجم في أي مكان بدون إنترنت.
                  </Text>
                </View>
                <Text style={styles.infoTextEn}>
                  Download the dictionary once, then translate anywhere — no internet needed.
                </Text>
                <TouchableOpacity style={styles.button} onPress={download} activeOpacity={0.85}>
                  <Download size={22} color={colors.neutral[0]} strokeWidth={2} />
                  <Text style={styles.buttonText}>تحميل القاموس · Download</Text>
                </TouchableOpacity>
              </>
            )}

            {state === 'downloading' && (
              <View style={styles.downloadingWrap}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Text style={styles.downloadingTitle}>جارٍ التحميل...</Text>
                <Text style={styles.downloadingSub}>Downloading dictionary...</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                  {loaded} / {total} مدخل · {progress}%
                </Text>
              </View>
            )}

            {state === 'done' && (
              <View style={styles.doneWrap}>
                <CheckCircle2 size={48} color={colors.success[500]} strokeWidth={2} />
                <Text style={styles.doneTitle}>اكتمل التحميل!</Text>
                <Text style={styles.doneSub}>Dictionary ready — you can go offline now.</Text>
              </View>
            )}

            {state === 'error' && (
              <View style={styles.errorWrap}>
                <AlertCircle size={40} color={colors.error[500]} strokeWidth={2} />
                <Text style={styles.errorTitle}>فشل التحميل</Text>
                <Text style={styles.errorSub}>Download failed. Check your connection and try again.</Text>
                {error && <Text style={styles.errorDetail}>{error}</Text>}
                <TouchableOpacity style={styles.retryButton} onPress={download} activeOpacity={0.85}>
                  <RefreshCw size={20} color={colors.neutral[0]} strokeWidth={2} />
                  <Text style={styles.buttonText}>إعادة المحاولة · Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {alreadySynced && (
            <Text style={styles.alreadyText}>القاموس محمّل مسبقاً · Already downloaded</Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontFamily: typography.arabicBold,
    fontSize: 42,
    color: colors.neutral[0],
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: colors.neutral[200],
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: typography.arabic,
    fontSize: 15,
    color: colors.neutral[100],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.neutral[0],
    borderRadius: radius.xl,
    padding: spacing.xl,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontFamily: typography.arabic,
    fontSize: 14,
    color: colors.neutral[700],
    lineHeight: 22,
    flex: 1,
  },
  infoTextEn: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.neutral[500],
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md + 2,
    borderRadius: radius.lg,
  },
  buttonText: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.neutral[0],
  },
  downloadingWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  downloadingTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 18,
    color: colors.neutral[800],
    marginTop: spacing.md,
  },
  downloadingSub: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.neutral[500],
    marginBottom: spacing.lg,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  progressText: {
    fontFamily: typography.bodyMedium,
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: spacing.sm,
  },
  doneWrap: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  doneTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 20,
    color: colors.neutral[800],
    marginTop: spacing.sm,
  },
  doneSub: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 4,
  },
  errorWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  errorTitle: {
    fontFamily: typography.arabicBold,
    fontSize: 18,
    color: colors.error[600],
    marginTop: spacing.sm,
  },
  errorSub: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  errorDetail: {
    fontFamily: typography.body,
    fontSize: 11,
    color: colors.neutral[400],
    marginBottom: spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
  },
  alreadyText: {
    fontFamily: typography.arabic,
    fontSize: 13,
    color: colors.neutral[200],
    marginTop: spacing.lg,
  },
});
