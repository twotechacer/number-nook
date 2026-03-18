import { Stack } from 'expo-router';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { COLORS } from '@/data/colors';

export default function GameLayout() {
  return (
    <ErrorBoundary>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          gestureEnabled: false, // Prevent accidental swipe-back during games
        }}
      />
    </ErrorBoundary>
  );
}
