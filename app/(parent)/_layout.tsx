import { Stack } from 'expo-router';

export default function ParentLayout() {
  // TODO: Phase 7 — ParentGate check before rendering children
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F4EE' },
      }}
    />
  );
}
