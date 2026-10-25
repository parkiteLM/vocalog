import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { X, CheckCircle2, Calendar, Sparkles, FileText, Mic, ShieldCheck } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';

interface HelpGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Voice Tags & Guide</Text>
                <Text style={styles.headerSubtitle}>How VocaLog structures your thoughts</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close help guide"
                style={styles.closeBtn}
              >
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Intro Banner */}
              <View style={styles.introBox}>
                <Mic size={18} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.introText}>
                  Speak freely without self-editing. VocaLog cleans verbal filler words (*um, uh, like*) and automatically tags your entry into one of 4 Bullet Journal categories.
                </Text>
              </View>

              {/* Tag Categories */}
              <Text style={styles.sectionHeading}>THE 4 VOICE TAGS</Text>

              {/* Task */}
              <View style={[styles.tagCard, { borderColor: Colors.categoryTaskBg }]}>
                <View style={styles.tagHeaderRow}>
                  <View style={[styles.tagBadge, { backgroundColor: Colors.categoryTaskBg }]}>
                    <CheckCircle2 size={14} color={Colors.categoryTask} style={{ marginRight: 6 }} />
                    <Text style={[styles.tagBadgeText, { color: Colors.categoryTask }]}>TASK (•)</Text>
                  </View>
                  <Text style={styles.tagHighlight}>Actionable To-Dos</Text>
                </View>
                <Text style={styles.tagDescription}>
                  Captures tasks that need to be done. VocaLog automatically extracts checklist bullet items from your speech so you can check them off later.
                </Text>
                <View style={styles.triggerContainer}>
                  <Text style={styles.triggerLabel}>Trigger phrases:</Text>
                  <Text style={styles.triggerCode}>
                    "need to", "have to", "remember to", "call", "email", "buy", "send", "finish", "review"
                  </Text>
                </View>
              </View>

              {/* Event */}
              <View style={[styles.tagCard, { borderColor: Colors.categoryEventBg }]}>
                <View style={styles.tagHeaderRow}>
                  <View style={[styles.tagBadge, { backgroundColor: Colors.categoryEventBg }]}>
                    <Calendar size={14} color={Colors.categoryEvent} style={{ marginRight: 6 }} />
                    <Text style={[styles.tagBadgeText, { color: Colors.categoryEvent }]}>EVENT (○)</Text>
                  </View>
                  <Text style={styles.tagHighlight}>Scheduled Appointments</Text>
                </View>
                <Text style={styles.tagDescription}>
                  Captures time-based appointments, dinners, meetings, flights, and calendar commitments.
                </Text>
                <View style={styles.triggerContainer}>
                  <Text style={styles.triggerLabel}>Trigger phrases:</Text>
                  <Text style={styles.triggerCode}>
                    "meeting with", "dinner with", "tomorrow at 10 AM", "appointment", "flight", "call at 3 PM"
                  </Text>
                </View>
              </View>

              {/* Reflection */}
              <View style={[styles.tagCard, { borderColor: Colors.categoryReflectionBg }]}>
                <View style={styles.tagHeaderRow}>
                  <View style={[styles.tagBadge, { backgroundColor: Colors.categoryReflectionBg }]}>
                    <Sparkles size={14} color={Colors.categoryReflection} style={{ marginRight: 6 }} />
                    <Text style={[styles.tagBadgeText, { color: Colors.categoryReflection }]}>REFLECTION (✦)</Text>
                  </View>
                  <Text style={styles.tagHighlight}>Gratitude & Thoughts</Text>
                </View>
                <Text style={styles.tagDescription}>
                  Captures introspective observations, emotional states, lessons learned, and personal gratitude.
                </Text>
                <View style={styles.triggerContainer}>
                  <Text style={styles.triggerLabel}>Trigger phrases:</Text>
                  <Text style={styles.triggerCode}>
                    "I feel", "grateful for", "I realized", "thinking about", "worried about", "lesson learned"
                  </Text>
                </View>
              </View>

              {/* Note */}
              <View style={[styles.tagCard, { borderColor: Colors.categoryNoteBg }]}>
                <View style={styles.tagHeaderRow}>
                  <View style={[styles.tagBadge, { backgroundColor: Colors.categoryNoteBg }]}>
                    <FileText size={14} color={Colors.categoryNote} style={{ marginRight: 6 }} />
                    <Text style={[styles.tagBadgeText, { color: Colors.categoryNote }]}>NOTE (—)</Text>
                  </View>
                  <Text style={styles.tagHighlight}>Ideas & Observations</Text>
                </View>
                <Text style={styles.tagDescription}>
                  Spontaneous ideas, quotes, facts, and general everyday logs. Used automatically whenever speech doesn't have explicit action verbs or scheduled dates.
                </Text>
                <View style={styles.triggerContainer}>
                  <Text style={styles.triggerLabel}>Trigger mechanism:</Text>
                  <Text style={styles.triggerCode}>
                    Default intelligent fallback for general thoughts and observations.
                  </Text>
                </View>
              </View>

              {/* Privacy Footer */}
              <View style={styles.footerNote}>
                <ShieldCheck size={18} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                <Text style={styles.footerText}>
                  100% On-Device AI: All transcription and categorization happen strictly in phone memory using local Whisper C++. Zero audio is uploaded to the cloud.
                </Text>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  safeContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: '90%',
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  scrollBody: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  introBox: {
    flexDirection: 'row',
    backgroundColor: Colors.primarySubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
  },
  introText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeading: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  tagCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  tagHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagHighlight: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  tagDescription: {
    color: Colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },
  triggerContainer: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  triggerLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  triggerCode: {
    color: Colors.primary,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  footerNote: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footerText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
  },
});

