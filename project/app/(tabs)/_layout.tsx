import { useEffect, useState, useCallback } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';
import DownloadScreen from '@/components/DownloadScreen';
import CategoryBrowser from '@/components/CategoryBrowser';
import { getMeta } from '@/lib/offline-db';

const SYNC_KEY = 'dictionary_synced';

export default function TabLayout() {
  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showCategories, setShowCategories] = useState(false);
  const router = useRouter();

  const checkSync = useCallback(async () => {
    try {
      const flagged = await getMeta<boolean>(SYNC_KEY);
      if (flagged) {
        setReady(true);
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSync();
  }, [checkSync]);

  const handleDownloadComplete = useCallback(() => {
    setReady(true);
  }, []);

  if (checking) {
    return <View style={styles.gate} />;
  }

  if (!ready) {
    return <DownloadScreen onComplete={handleDownloadComplete} />;
  }

  if (showCategories) {
    return <CategoryBrowser onBack={() => setShowCategories(false)} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[400],
        tabBarStyle: {
          backgroundColor: colors.neutral[0],
          borderTopColor: colors.neutral[200],
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ترجم',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="language" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'السجل',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'المفضلة',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'الإعدادات',
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
});
