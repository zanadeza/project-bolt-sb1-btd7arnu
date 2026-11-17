import SettingsScreen from '@/components/SettingsScreen';
import { useState } from 'react';
import CategoryBrowser from '@/components/CategoryBrowser';

export default function SettingsTab() {
  const [showCategories, setShowCategories] = useState(false);

  if (showCategories) {
    return <CategoryBrowser onBack={() => setShowCategories(false)} />;
  }

  return <SettingsScreen onBrowseCategories={() => setShowCategories(true)} />;
}
