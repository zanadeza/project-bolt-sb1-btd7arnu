import HistoryScreen from '@/components/HistoryScreen';
import { useRouter } from 'expo-router';

export default function HistoryTab() {
  const router = useRouter();
  return <HistoryScreen onGoTranslate={() => router.push('/')} />;
}
