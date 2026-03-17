import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F4EE' },
        gestureEnabled: false, // Prevent accidental swipe-back during games
      }}
    />
  );
}
