import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { Clock, CheckCircle2, Volume2, Trash2 } from 'lucide-react-native';
import { JournalEntry } from '../../data/models/JournalEntry';
import { Colors, Spacing, BorderRadius } from '../../core/theme';
import { useJournalStore } from '../../state/useJournalStore';

interface EntryCardProps {
  entry: JournalEntry;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  const { setActiveEntryDetail, deleteEntry } = useJournalStore();

  const timeLabel = entry.createdAt
    ? format(new Date(entry.createdAt), 'h:mm a')
    : '';

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Task':
        return { color: Colors.categoryTask, bg: Colors.categoryTaskBg };
      case 'Event':
        return { color: Colors.categoryEvent, bg: Colors.categoryEventBg };
      case 'Reflection':
        return { color: Colors.categoryReflection, bg: Colors.categoryReflectionBg };
      case 'Note':
      default:
        return { color: Colors.categoryNote, bg: Colors.categoryNoteBg };
    }
  };

  const categoryStyle = getCategoryStyles(entry.category);
  const hasAudio = Boolean(entry.audioFilePath);
  const actionItemsCount = entry.actionItems?.length ?? 0;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => setActiveEntryDetail(entry)}
      accessibilityLabel={`Journal entry: ${entry.title}`}
    >
      {/* Top Metadata Row */}
      <View style={styles.topRow}>
        <View style={styles.metadataLeft}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.color }]}>
              {entry.category.toUpperCase()}
            </Text>
          </View>

          <View style={styles.timeTag}>
            <Clock size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
            <Text style={styles.timeText}>{timeLabel}</Text>
          </View>

          {entry.durationSeconds > 0 && (
            <View style={styles.durationTag}>
              <Text style={styles.durationText}>{formatDuration(entry.durationSeconds)}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            deleteEntry(entry.id);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Delete entry"
        >
          <Trash2 size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.titleText} numberOfLines={2}>
        {entry.title || 'Untitled Entry'}
      </Text>

      {/* Cleaned Entry / Summary Preview */}
      <Text style={styles.previewText} numberOfLines={3}>
        {entry.summary || entry.cleanedEntry || entry.rawTranscript}
      </Text>

      {/* Bottom Status Row */}
      <View style={styles.bottomRow}>
        {/* Action Items Pill */}
        {actionItemsCount > 0 ? (
          <View style={styles.actionItemsPill}>
            <CheckCircle2 size={13} color={Colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.actionItemsText}>
              {actionItemsCount} {actionItemsCount === 1 ? 'Action Item' : 'Action Items'}
            </Text>
          </View>
        ) : (
          <View />
        )}

        {/* 21-Day Audio Retention Indicator */}
        <View style={styles.audioStatusPill}>
          <Volume2
            size={12}
            color={hasAudio ? Colors.primary : Colors.textMuted}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.audioStatusText,
              { color: hasAudio ? Colors.primary : Colors.textMuted },
            ]}
          >
            {hasAudio ? '21d Audio' : 'Text Preserved'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  metadataLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  durationTag: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  durationText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  previewText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
    paddingTop: Spacing.sm,
  },
  actionItemsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  actionItemsText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  audioStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioStatusText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
