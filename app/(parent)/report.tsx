import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useGameStore } from '@/store/useGameStore';
import { useFloorProgress, useNumbersNeedingPractice, useNextSuggestedNumbers } from '@/store/selectors';
import { getMasteryStatus } from '@/engine/mastery';
import { COLORS } from '@/data/colors';
import { FLOORS } from '@/data/floors';
import { MasteryStatus } from '@/types/game';

const STATUS_COLORS: Record<MasteryStatus, string> = {
  not_started: 'rgba(0,0,0,0.08)',
  practiced: COLORS.celebration + '60',
  mastered: COLORS.primary,
};

const STATUS_LABELS: Record<MasteryStatus, string> = {
  not_started: 'Not started',
  practiced: 'Practicing',
  mastered: 'Mastered',
};

function NumberCell({ num, status }: { num: number; status: MasteryStatus }) {
  return (
    <View style={[styles.numberCell, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={[styles.numberText, status === 'mastered' && styles.masteredText]}>
        {num}
      </Text>
    </View>
  );
}

export default function ParentReport() {
  const mastery = useGameStore((s) => s.numberMastery);
  const totalStars = useGameStore((s) => s.totalStars);
  const sessionLog = useGameStore((s) => s.sessionLog);
  const childName = useGameStore((s) => s.childName);

  const floor1Progress = useFloorProgress('floor1');
  const floor2Progress = useFloorProgress('floor2');
  const floor3Progress = useFloorProgress('floor3');

  // Get last 7 days of sessions
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentSessions = sessionLog.filter((s) => s.date >= sevenDaysAgo);
  const totalRecentStars = recentSessions.reduce((sum, s) => sum + s.starsEarned, 0);
  const totalRecentNumbers = new Set(recentSessions.flatMap((s) => s.numbersPlayed)).size;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.title}>
            {childName ? `${childName}'s Progress` : 'Progress Report'}
          </Text>
          <View style={styles.backButton} />
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalStars}</Text>
            <Text style={styles.summaryLabel}>Total Stars</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalRecentStars}</Text>
            <Text style={styles.summaryLabel}>This Week</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalRecentNumbers}</Text>
            <Text style={styles.summaryLabel}>Numbers</Text>
          </View>
        </View>

        {/* Floor Progress */}
        <Text style={styles.sectionTitle}>Floor Progress</Text>
        {FLOORS.map((floor, i) => (
          <View key={floor.id} style={styles.floorRow}>
            <Text style={styles.floorName}>{floor.name}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${i === 0 ? floor1Progress : i === 1 ? floor2Progress : floor3Progress}%`,
                    backgroundColor: floor.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.floorPercent}>
              {i === 0 ? floor1Progress : i === 1 ? floor2Progress : floor3Progress}%
            </Text>
          </View>
        ))}

        {/* Number Mastery Grid */}
        <Text style={styles.sectionTitle}>Number Mastery (1–50)</Text>
        <View style={styles.legend}>
          {(['not_started', 'practiced', 'mastered'] as MasteryStatus[]).map((s) => (
            <View key={s} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[s] }]} />
              <Text style={styles.legendText}>{STATUS_LABELS[s]}</Text>
            </View>
          ))}
        </View>
        <View style={styles.numberGrid}>
          {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
            <NumberCell
              key={num}
              num={num}
              status={getMasteryStatus(mastery[String(num)])}
            />
          ))}
        </View>

        {/* Session History */}
        <Text style={styles.sectionTitle}>Recent Sessions ({recentSessions.length})</Text>
        {recentSessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions this week yet</Text>
        ) : (
          recentSessions.slice(0, 7).map((session, i) => (
            <View key={i} style={styles.sessionRow}>
              <Text style={styles.sessionDate}>
                {new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              <Text style={styles.sessionDetail}>
                ⭐ {session.starsEarned} · {session.numbersPlayed.length} numbers · {Math.round(session.durationSecs / 60)}m
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center', alignItems: 'center',
  },
  backArrow: { fontSize: 20, color: COLORS.textPrimary },
  title: { fontSize: 18, fontWeight: 'bold', color: COLORS.textPrimary },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  summaryCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: 14, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary },
  summaryLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: COLORS.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 24, marginBottom: 10,
  },
  floorRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  floorName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, width: 60 },
  progressTrack: {
    flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  floorPercent: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, width: 40, textAlign: 'right' },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: COLORS.textSecondary },
  numberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  numberCell: {
    width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  numberText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  masteredText: { color: COLORS.white },
  emptyText: { fontSize: 15, color: COLORS.textSecondary, fontStyle: 'italic' },
  sessionRow: {
    backgroundColor: COLORS.white, borderRadius: 10, padding: 12, marginBottom: 6,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  sessionDate: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  sessionDetail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
});
