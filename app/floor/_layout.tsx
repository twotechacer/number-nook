import { Stack } from 'expo-router';

export default function FloorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F4EE' },
      }}
    />
  );
}
