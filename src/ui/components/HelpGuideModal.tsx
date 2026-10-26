import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import {
  X,
  CheckCircle2,
  Calendar,
  Sparkles,
  FileText,
  Mic,
  ShieldCheck,
} from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';

interface HelpGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ visible, onClose }) => {
  const [activeMainTab, setActiveMainTab] = useState<'tags' | 'widgets'>('tags');
  const [activePlatform, setActivePlatform] = useState<'android' | 'ios'>(
    Platform.OS === 'ios' ? 'ios' : 'android'
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeContainer}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>User & Setup Guide</Text>
                <Text style={styles.headerSubtitle}>
                  {activeMainTab === 'tags'
                    ? 'How VocaLog structures your thoughts'
                    : '1-tap lock screen & widget setup'}
                </Text>
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

            {/* Main Tabs */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tabItem, activeMainTab === 'tags' && styles.tabItemActive]}
                onPress={() => setActiveMainTab('tags')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    activeMainTab === 'tags' && styles.tabItemTextActive,
                  ]}
                >
                  Voice Tags
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabItem, activeMainTab === 'widgets' && styles.tabItemActive]}
                onPress={() => setActiveMainTab('widgets')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabItemText,
                    activeMainTab === 'widgets' && styles.tabItemTextActive,
                  ]}
                >
                  Lock Screen & Widgets
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* ===================== TAB 1: VOICE TAGS ===================== */}
              {activeMainTab === 'tags' && (
                <>
                  {/* Intro Banner */}
                  <View style={styles.introBox}>
                    <Mic size={18} color={Colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={styles.introText}>
                      Speak freely without self-editing. VocaLog cleans verbal filler words (*um, uh, like*) and automatically tags your entry into one of 4 Bullet Journal categories.
                    </Text>
                  </View>

                  <Text style={styles.sectionHeading}>THE 4 VOICE TAGS</Text>

                  {/* Task */}
                  <View style={[styles.card, { borderColor: Colors.categoryTaskBg }]}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.tagBadge, { backgroundColor: Colors.categoryTaskBg }]}>
                        <CheckCircle2 size={14} color={Colors.categoryTask} style={{ marginRight: 6 }} />
                        <Text style={[styles.tagBadgeText, { color: Colors.categoryTask }]}>TASK (•)</Text>
                      </View>
                      <Text style={styles.cardSubtitle}>Actionable To-Dos</Text>
                    </View>
                    <Text style={styles.cardDescription}>
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
                  <View style={[styles.card, { borderColor: Colors.categoryEventBg }]}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.tagBadge, { backgroundColor: Colors.categoryEventBg }]}>
                        <Calendar size={14} color={Colors.categoryEvent} style={{ marginRight: 6 }} />
                        <Text style={[styles.tagBadgeText, { color: Colors.categoryEvent }]}>EVENT (○)</Text>
                      </View>
                      <Text style={styles.cardSubtitle}>Scheduled Appointments</Text>
                    </View>
                    <Text style={styles.cardDescription}>
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
                  <View style={[styles.card, { borderColor: Colors.categoryReflectionBg }]}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.tagBadge, { backgroundColor: Colors.categoryReflectionBg }]}>
                        <Sparkles size={14} color={Colors.categoryReflection} style={{ marginRight: 6 }} />
                        <Text style={[styles.tagBadgeText, { color: Colors.categoryReflection }]}>REFLECTION (✦)</Text>
                      </View>
                      <Text style={styles.cardSubtitle}>Gratitude & Thoughts</Text>
                    </View>
                    <Text style={styles.cardDescription}>
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
                  <View style={[styles.card, { borderColor: Colors.categoryNoteBg }]}>
                    <View style={styles.cardHeaderRow}>
                      <View style={[styles.tagBadge, { backgroundColor: Colors.categoryNoteBg }]}>
                        <FileText size={14} color={Colors.categoryNote} style={{ marginRight: 6 }} />
                        <Text style={[styles.tagBadgeText, { color: Colors.categoryNote }]}>NOTE (—)</Text>
                      </View>
                      <Text style={styles.cardSubtitle}>Ideas & Observations</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                      Spontaneous ideas, quotes, facts, and general everyday logs. Used automatically whenever speech doesn't have explicit action verbs or scheduled dates.
                    </Text>
                    <View style={styles.triggerContainer}>
                      <Text style={styles.triggerLabel}>Trigger mechanism:</Text>
                      <Text style={styles.triggerCode}>
                        Default intelligent fallback for general thoughts and observations.
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* ===================== TAB 2: LOCK SCREEN & WIDGETS ===================== */}
              {activeMainTab === 'widgets' && (
                <>
                  {/* Platform Sub-Tabs */}
                  <View style={styles.platformPillRow}>
                    <TouchableOpacity
                      style={[
                        styles.platformPill,
                        activePlatform === 'android' && styles.platformPillActive,
                      ]}
                      onPress={() => setActivePlatform('android')}
                    >
                      <Text
                        style={[
                          styles.platformPillText,
                          activePlatform === 'android' && styles.platformPillTextActive,
                        ]}
                      >
                        Android Setup
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.platformPill,
                        activePlatform === 'android' && styles.platformPillInactive,
                        activePlatform === 'ios' && styles.platformPillActive,
                      ]}
                      onPress={() => setActivePlatform('ios')}
                    >
                      <Text
                        style={[
                          styles.platformPillText,
                          activePlatform === 'ios' && styles.platformPillTextActive,
                        ]}
                      >
                        Apple iOS Setup
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Android Instructions */}
                  {activePlatform === 'android' && (
                    <>
                      {/* Option 1: Quick Settings Tile */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>1</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>Lock Screen Pull-Down Tile</Text>
                            <Text style={styles.instructionTag}>Fastest 1-tap capture from lock screen</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Swipe down twice from the top of your lock screen.</Text>
                        <Text style={styles.stepText}>• Tap the <Text style={styles.boldText}>Pencil (Edit)</Text> icon.</Text>
                        <Text style={styles.stepText}>• Drag the <Text style={styles.boldText}>"Record Note"</Text> tile into your active tiles.</Text>
                        <Text style={styles.stepText}>• <Text style={styles.accentText}>To use:</Text> Swipe down from lock screen and tap tile to record!</Text>
                      </View>

                      {/* Option 2: Home Screen Widget */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>2</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>1-Tap Home Screen Widget</Text>
                            <Text style={styles.instructionTag}>Desktop 1x1 circular mic button</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Long-press on an empty spot on your home screen.</Text>
                        <Text style={styles.stepText}>• Tap <Text style={styles.boldText}>Widgets</Text> $\rightarrow$ select <Text style={styles.boldText}>VocaLog</Text>.</Text>
                        <Text style={styles.stepText}>• Drag the circular <Text style={styles.boldText}>Quick Record</Text> widget to your home screen.</Text>
                      </View>

                      {/* Option 3: Lock Screen Corner Shortcut */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>3</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>Lock Screen Corner Shortcut</Text>
                            <Text style={styles.instructionTag}>Android 14 & 15 corner shortcut</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Open phone <Text style={styles.boldText}>Settings</Text> $\rightarrow$ <Text style={styles.boldText}>Wallpaper & Style</Text>.</Text>
                        <Text style={styles.stepText}>• Tap <Text style={styles.boldText}>Shortcuts</Text> $\rightarrow$ select Left or Right.</Text>
                        <Text style={styles.stepText}>• Choose <Text style={styles.boldText}>VocaLog (Record Note)</Text>.</Text>
                      </View>

                      {/* Option 4: App Icon Long-Press */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>4</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>App Icon Quick Actions</Text>
                            <Text style={styles.instructionTag}>Long-press shortcut</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Long-press the VocaLog icon to trigger <Text style={styles.boldText}>Record</Text> or <Text style={styles.boldText}>Today</Text>.</Text>
                        <Text style={styles.stepText}>• Drag either action to home screen for a standalone 1-tap icon!</Text>
                      </View>
                    </>
                  )}

                  {/* iOS Instructions */}
                  {activePlatform === 'ios' && (
                    <>
                      {/* Option 1: Lock Screen Widget */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>1</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>Lock Screen Widget (iOS 16+)</Text>
                            <Text style={styles.instructionTag}>Directly beneath the lock screen clock</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Wake iPhone and long-press on the Lock Screen.</Text>
                        <Text style={styles.stepText}>• Tap <Text style={styles.boldText}>Customize</Text> $\rightarrow$ select <Text style={styles.boldText}>Lock Screen</Text>.</Text>
                        <Text style={styles.stepText}>• Tap the widget box below the clock $\rightarrow$ select <Text style={styles.boldText}>VocaLog</Text>.</Text>
                        <Text style={styles.stepText}>• Add the circular <Text style={styles.boldText}>Quick Record</Text> widget and tap Done.</Text>
                      </View>

                      {/* Option 2: Action Button */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>2</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>Action Button (iPhone 15 Pro / 16)</Text>
                            <Text style={styles.instructionTag}>Hardware button 1-click recording</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Open iPhone <Text style={styles.boldText}>Settings</Text> $\rightarrow$ <Text style={styles.boldText}>Action Button</Text>.</Text>
                        <Text style={styles.stepText}>• Swipe to <Text style={styles.boldText}>Shortcut</Text> $\rightarrow$ choose <Text style={styles.boldText}>Open URL</Text>.</Text>
                        <Text style={styles.stepText}>• Type <Text style={styles.accentText}>vocalog://record</Text>.</Text>
                        <Text style={styles.stepText}>• Press the Action Button anytime to record instantly!</Text>
                      </View>

                      {/* Option 3: iOS 18 Lock Screen Control */}
                      <View style={styles.instructionCard}>
                        <View style={styles.instructionHeader}>
                          <View style={styles.numberBadge}>
                            <Text style={styles.numberBadgeText}>3</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.instructionTitle}>Lock Screen Control (iOS 18+)</Text>
                            <Text style={styles.instructionTag}>Replace Flashlight or Camera button</Text>
                          </View>
                        </View>
                        <Text style={styles.stepText}>• Long-press Lock Screen $\rightarrow$ tap <Text style={styles.boldText}>Customize</Text>.</Text>
                        <Text style={styles.stepText}>• Remove Flashlight or Camera icon with the <Text style={styles.boldText}>(-)</Text> button.</Text>
                        <Text style={styles.stepText}>• Tap <Text style={styles.boldText}>(+)</Text> $\rightarrow$ choose <Text style={styles.boldText}>VocaLog (Record Note)</Text>.</Text>
                      </View>
                    </>
                  )}
                </>
              )}

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
    maxHeight: '92%',
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
  },
  tabItem: {
    paddingVertical: 10,
    marginRight: Spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: Colors.primary,
  },
  tabItemText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  platformPillRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.full,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  platformPill: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BorderRadius.full,
  },
  platformPillActive: {
    backgroundColor: Colors.primary,
  },
  platformPillInactive: {
    backgroundColor: 'transparent',
  },
  platformPillText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  platformPillTextActive: {
    color: Colors.background,
    fontWeight: '800',
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
  card: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  cardHeaderRow: {
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
  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  cardDescription: {
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
  instructionCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  instructionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primarySubtle,
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  numberBadgeText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  instructionTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  instructionTag: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  stepText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  boldText: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  accentText: {
    color: Colors.primary,
    fontWeight: '700',
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
