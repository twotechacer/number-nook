import { useState } from 'react';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { ParentGate } from '@/components/ui/ParentGate';
import { COLORS } from '@/data/colors';

export default function ParentLayout() {
  const [gateCleared, setGateCleared] = useState(false);

  if (!gateCleared) {
    return (
      <ParentGate
        onPass={() => setGateCleared(true)}
        onCancel={() => {
          if (router.canGoBack()) router.back();
        }}
      />
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    />
  );
}
