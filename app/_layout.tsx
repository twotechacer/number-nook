import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useGameStore } from '@/store/useGameStore';
import { preloadSounds, unloadSounds } from '@/utils/audio';
import { COLORS } from '@/data/colors';

function SessionManager() {
  const startSession = useGameStore((s) => s.startSession);
  const endSession = useGameStore((s) => s.endSession);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Start session and preload audio on mount
    startSession();
    preloadSounds().catch(() => {});

    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (appState.current.match(/active/) && nextState.match(/inactive|background/)) {
        endSession();
        unloadSounds().catch(() => {});
      } else if (appState.current.match(/inactive|background/) && nextState === 'active') {
        startSession();
        preloadSounds().catch(() => {});
      }
      appState.current = nextState;
    });

    return () => {
      subscription.remove();
      endSession();
      unloadSounds().catch(() => {});
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <SessionManager />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'slide_from_right',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
