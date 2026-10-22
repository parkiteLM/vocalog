import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { format } from 'date-fns';
import { X, Play, Pause, CheckCircle2, Circle, Volume2 } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';
import { useJournalStore } from '../../state/useJournalStore';

export const EntryDetailModal: React.FC = () => {
  const { activeEntryDetail, setActiveEntryDetail } = useJournalStore();
  const [activeTab, setActiveTab] = useState<'cleaned' | 'raw'>('cleaned');
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  if (!activeEntryDetail) {
    return null;
  }

  const hasAudio = Boolean(activeEntryDetail.audioFilePath);

  const handlePlayAudio = async () => {
    if (!activeEntryDetail.audioFilePath) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: activeEntryDetail.audioFilePath },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.warn('Playback error:', error);
      setIsPlaying(false);
    }
  };

  const toggleAction = (index: number) => {
    setCompletedActions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const timeLabel = activeEntryDetail.createdAt
    ? format(new Date(activeEntryDetail.createdAt), 'EEEE, MMMM d, yyyy • h:mm a')
    : '';

  return (
    <Modal
      visible={Boolean(activeEntryDetail)}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setActiveEntryDetail(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerBadgeRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{activeEntryDetail.category.toUpperCase()}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setActiveEntryDetail(null)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel="Close entry modal"
            >
              <X size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Title & Date */}
            <Text style={styles.titleText}>{activeEntryDetail.title || 'Journal Entry'}</Text>
            <Text style={styles.dateText}>{timeLabel}</Text>

            {/* Audio Playback Player or Retention Notice */}
            <View style={styles.audioPlayerBox}>
              {hasAudio ? (
                <View style={styles.playerRow}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={handlePlayAudio}
                    accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
                  >
                    {isPlaying ? (
                      <Pause size={18} color={Colors.background} fill={Colors.background} />
                    ) : (
                      <Play size={18} color={Colors.background} fill={Colors.background} />
                    )}
                  </TouchableOpacity>

                  <View style={styles.audioMeta}>
                    <Text style={styles.audioTitle}>Voice Recording</Text>
                    <Text style={styles.audioDuration}>
                      {activeEntryDetail.durationSeconds}s • Available for 21 days
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.prunedAudioBox}>
                  <Volume2 size={16} color={Colors.textMuted} style={{ marginRight: 8 }} />
                  <Text style={styles.prunedAudioText}>
                    Audio pruned per 21-day retention policy. Text, summary, and action items are preserved permanently.
                  </Text>
                </View>
              )}
            </View>

            {/* Segmented Control: Cleaned vs. Raw */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segmentButton, activeTab === 'cleaned' && styles.segmentActive]}
                onPress={() => setActiveTab('cleaned')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'cleaned' && styles.segmentTextActive,
                  ]}
                >
                  Cleaned Prose
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.segmentButton, activeTab === 'raw' && styles.segmentActive]}
                onPress={() => setActiveTab('raw')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    activeTab === 'raw' && styles.segmentTextActive,
                  ]}
                >
                  Raw Transcript
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transcript Body */}
            <View style={styles.bodyBox}>
              <Text style={styles.bodyText}>
                {activeTab === 'cleaned'
                  ? activeEntryDetail.cleanedEntry || activeEntryDetail.rawTranscript
                  : activeEntryDetail.rawTranscript}
              </Text>
            </View>

            {/* Action Items Section */}
            {activeEntryDetail.actionItems && activeEntryDetail.actionItems.length > 0 && (
              <View style={styles.actionItemsSection}>
                <Text style={styles.sectionHeader}>ACTION ITEMS</Text>
                {activeEntryDetail.actionItems.map((item, index) => {
                  const isDone = completedActions[index];
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.actionItemRow}
                      onPress={() => toggleAction(index)}
                      activeOpacity={0.7}
                    >
                      {isDone ? (
                        <CheckCircle2 size={18} color={Colors.primary} style={styles.checkIcon} />
                      ) : (
                        <Circle size={18} color={Colors.textMuted} style={styles.checkIcon} />
                      )}
                      <Text
                        style={[
                          styles.actionItemText,
                          isDone && styles.actionItemTextDone,
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg + 4,
    borderTopRightRadius: BorderRadius.lg + 4,
    maxHeight: '90%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollBody: {
    paddingBottom: Spacing.xl,
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  audioPlayerBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  audioMeta: {
    flex: 1,
  },
  audioTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  audioDuration: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  prunedAudioBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prunedAudioText: {
    color: Colors.textMuted,
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentActive: {
    backgroundColor: Colors.surface,
  },
  segmentText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: Colors.primary,
  },
  bodyBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  bodyText: {
    color: Colors.textPrimary,
    fontSize: 15,
    lineHeight: 24,
  },
  actionItemsSection: {
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
  },
  checkIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  actionItemText: {
    color: Colors.textPrimary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionItemTextDone: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
});

