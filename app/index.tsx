import { Redirect } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';

export default function Index() {
  const childName = useGameStore((s) => s.childName);
  const isHydrated = useGameStore((s) => s.isHydrated);

  if (!isHydrated) return null;
  if (childName) return <Redirect href="/home" />;
  return <Redirect href="/onboarding" />;
}
