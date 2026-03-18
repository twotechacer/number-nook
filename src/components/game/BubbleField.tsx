import { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Bubble } from './Bubble';

interface BubblePosition {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface BubbleFieldProps {
  count: number;
  poppedCount: number;
  color: string;
  onPop: () => void;
}

const MIN_SIZE = 52;
const MAX_SIZE = 72;
const DRIFT_SPEED = 0.4; // pixels per frame
const TICK_MS = 33; // ~30fps

function generateInitialPositions(count: number, width: number, height: number): BubblePosition[] {
  const positions: BubblePosition[] = [];
  const padding = 20;

  for (let i = 0; i < count; i++) {
    const size = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    const x = padding + Math.random() * (width - size - padding * 2);
    const y = padding + Math.random() * (height - size - padding * 2);
    const angle = Math.random() * Math.PI * 2;
    const speed = DRIFT_SPEED + Math.random() * DRIFT_SPEED;

    positions.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
    });
  }

  return positions;
}

export function BubbleField({ count, poppedCount, color, onPop }: BubbleFieldProps) {
  const [fieldSize, setFieldSize] = useState({ width: 300, height: 400 });
  const [positions, setPositions] = useState<BubblePosition[]>([]);
  const [poppedSet, setPoppedSet] = useState<Set<number>>(new Set());
  const positionsRef = useRef<BubblePosition[]>([]);
  const poppedRef = useRef<Set<number>>(new Set());
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setFieldSize({ width, height });
    }
  }, []);

  // Generate positions when count or field size changes
  useEffect(() => {
    if (fieldSize.width > 0 && fieldSize.height > 0 && count > 0) {
      const initial = generateInitialPositions(count, fieldSize.width, fieldSize.height);
      positionsRef.current = initial;
      setPositions([...initial]);
      setPoppedSet(new Set());
      poppedRef.current = new Set();
    }
  }, [count, fieldSize.width, fieldSize.height]);

  // Drift animation loop
  useEffect(() => {
    if (positions.length === 0) return;

    animRef.current = setInterval(() => {
      const { width, height } = fieldSize;
      const updated = positionsRef.current.map((p, i) => {
        if (poppedRef.current.has(i)) return p;

        let { x, y, vx, vy, size } = p;
        x += vx;
        y += vy;

        // Bounce off edges
        if (x <= 0 || x + size >= width) {
          vx = -vx;
          x = Math.max(0, Math.min(x, width - size));
        }
        if (y <= 0 || y + size >= height) {
          vy = -vy;
          y = Math.max(0, Math.min(y, height - size));
        }

        return { x, y, vx, vy, size };
      });

      positionsRef.current = updated;
      setPositions([...updated]);
    }, TICK_MS);

    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [positions.length > 0, fieldSize]);

  const handlePop = useCallback(
    (index: number) => {
      if (poppedRef.current.has(index)) return;
      poppedRef.current = new Set([...poppedRef.current, index]);
      setPoppedSet(new Set(poppedRef.current));
      onPop();
    },
    [onPop]
  );

  const remaining = count - poppedSet.size;

  return (
    <View testID="bubble-field" style={styles.field} onLayout={onLayout}>
      {positions.map((pos, i) => (
        <Bubble
          key={i}
          index={i}
          isPopped={poppedSet.has(i)}
          color={color}
          size={pos.size}
          position={{ x: pos.x, y: pos.y }}
          onPop={() => handlePop(i)}
          isLastTwo={remaining <= 2 && !poppedSet.has(i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
});
