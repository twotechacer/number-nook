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
    backgroundColor: COLORS.lockOverlay,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  lock: {
    fontSize: 28,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
