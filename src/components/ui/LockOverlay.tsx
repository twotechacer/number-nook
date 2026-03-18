import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/data/colors';

interface LockOverlayProps {
  message?: string;
}

export function LockOverlay({ message }: LockOverlayProps) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.lock}>🔒</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(247,244,238,0.92)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lock: {
    fontSize: 24,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
