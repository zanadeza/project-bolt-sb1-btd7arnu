import FavoritesScreen from '@/components/FavoritesScreen';
import { useRouter } from 'expo-router';

export default function FavoritesTab() {
  const router = useRouter();
  return <FavoritesScreen onGoTranslate={() => router.push('/')} />;
}
