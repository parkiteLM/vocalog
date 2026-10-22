import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { ShieldCheck, Mic } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';
import { useJournalStore } from '../../state/useJournalStore';
import { DateNavigator } from '../components/DateNavigator';
import { EntryCard } from '../components/EntryCard';
import { FloatingRecordButton } from '../components/FloatingRecordButton';
import { EntryDetailModal } from '../components/EntryDetailModal';

export const DailyFeedScreen: React.FC = () => {
  const {
    entries,
    isLoading,
    runAppStartupRoutine,
  } = useJournalStore();

  useEffect(() => {
    runAppStartupRoutine();
  }, [runAppStartupRoutine]);

  // Compute daily totals
  const totalDuration = entries.reduce((acc, curr) => acc + (curr.durationSeconds || 0), 0);
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = Math.round(totalDuration % 60);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Top App Bar Header */}
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <Image
            source={require('../../../assets/logo/CleanedLogoOnly.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>VocaLog</Text>
        </View>

        <View style={styles.privacyBadge}>
          <ShieldCheck size={12} color={Colors.primary} style={{ marginRight: 4 }} />
          <Text style={styles.privacyText}>100% Offline</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Top Date Navigator */}
        <DateNavigator />

        {/* Daily Stats Summary */}
        {entries.length > 0 && (
          <View style={styles.statsBar}>
            <Text style={styles.statsText}>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} •{' '}
              {totalMinutes > 0 ? `${totalMinutes}m ` : ''}
              {totalSeconds}s recorded
            </Text>
          </View>
        )}

        {/* Main Feed List (Reverse-Chronological) */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Mic size={32} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No reflections for this day</Text>
            <Text style={styles.emptySubtitle}>
              Tap the microphone below to capture spontaneous thoughts, tasks, and reflections.
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EntryCard entry={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Floating Record Button (Bottom HUD) */}
      <FloatingRecordButton />

      {/* Entry Detail & Audio Player Modal */}
      <EntryDetailModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  brandTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
  },
  privacyText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: 4,
  },
  statsText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 110, // Ensure space for the floating record button
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
