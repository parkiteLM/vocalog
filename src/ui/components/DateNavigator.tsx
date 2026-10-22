import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, isToday, isYesterday, isTomorrow } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';
import { useJournalStore } from '../../state/useJournalStore';

export const DateNavigator: React.FC = () => {
  const { selectedDate, goToPreviousDay, goToNextDay, jumpToToday } = useJournalStore();

  const isCurrentDay = isToday(selectedDate);

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) {
      return `Today — ${format(date, 'EEEE, MMM d')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday — ${format(date, 'EEEE, MMM d')}`;
    }
    if (isTomorrow(date)) {
      return `Tomorrow — ${format(date, 'EEEE, MMM d')}`;
    }
    return format(date, 'EEEE, MMM d, yyyy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={goToPreviousDay}
          accessibilityLabel="Previous day"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronLeft color={Colors.textPrimary} size={22} />
        </TouchableOpacity>

        <View style={styles.centerDateContainer}>
          <Text style={styles.dateText} numberOfLines={1}>
            {getDateLabel(selectedDate)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={goToNextDay}
          accessibilityLabel="Next day"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ChevronRight color={Colors.textPrimary} size={22} />
        </TouchableOpacity>
      </View>

      {!isCurrentDay && (
        <TouchableOpacity
          style={styles.jumpTodayChip}
          onPress={jumpToToday}
          accessibilityLabel="Jump to today"
        >
          <Calendar color={Colors.primary} size={14} style={{ marginRight: 4 }} />
          <Text style={styles.jumpTodayText}>Jump to Today</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDateContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  dateText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  jumpTodayChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    backgroundColor: Colors.primarySubtle,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  jumpTodayText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
