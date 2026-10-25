import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, ShieldCheck, FileText, Download, Sparkles, Clock, Check, HelpCircle, ChevronRight } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';
import { databaseService } from '../../data/services/DatabaseService';
import { dataExportService } from '../../data/services/DataExportService';
import { subscriptionService } from '../../data/services/SubscriptionService';
import { useJournalStore } from '../../state/useJournalStore';
import { PaywallModal } from './PaywallModal';
import { HelpGuideModal } from './HelpGuideModal';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const { entries } = useJournalStore();
  const [retentionDays, setRetentionDays] = useState<number>(21);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    const days = await databaseService.getRetentionDays();
    setRetentionDays(days);
    const proStatus = await subscriptionService.isProSubscriber();
    setIsPro(proStatus);
  };

  const handleSelectRetention = async (days: number) => {
    if (days !== 21 && !isPro) {
      // Pro feature gating
      setShowPaywall(true);
      return;
    }

    setRetentionDays(days);
    await databaseService.setRetentionDays(days);
    Alert.alert('Settings Updated', `Audio retention updated to ${days === 0 ? 'Keep Forever' : `${days} days`}.`);
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      const allEntries = await databaseService.getAllEntries();
      const filePath = await dataExportService.exportEntriesAsJSON(allEntries);
      await dataExportService.shareExportFile(filePath, 'application/json');
    } catch (error) {
      console.warn('JSON export error:', error);
      Alert.alert('Export Error', 'Unable to complete JSON file export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = async () => {
    setIsExporting(true);
    try {
      const allEntries = await databaseService.getAllEntries();
      const filePath = await dataExportService.exportEntriesAsMarkdown(allEntries);
      await dataExportService.shareExportFile(filePath, 'text/plain');
    } catch (error) {
      console.warn('Markdown export error:', error);
      Alert.alert('Export Error', 'Unable to complete Markdown export.');
    } finally {
      setIsExporting(false);
    }
  };

  const retentionOptions = [
    { label: '7 Days', days: 7, isProOnly: true },
    { label: '14 Days', days: 14, isProOnly: true },
    { label: '21 Days (Standard Default)', days: 21, isProOnly: false },
    { label: '60 Days', days: 60, isProOnly: true },
    { label: 'Keep Forever (Never Purge)', days: 0, isProOnly: true },
  ];

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings & Privacy</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Close settings"
              >
                <X size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Pro Banner */}
              <TouchableOpacity
                style={styles.proBanner}
                activeOpacity={0.8}
                onPress={() => !isPro && setShowPaywall(true)}
              >
                <View style={styles.proBannerLeft}>
                  <Sparkles size={18} color={Colors.primary} style={{ marginRight: 8 }} />
                  <View>
                    <Text style={styles.proBannerTitle}>
                      {isPro ? 'VocaLog Pro Active' : 'Upgrade to VocaLog Pro'}
                    </Text>
                    <Text style={styles.proBannerSubtitle}>
                      {isPro
                        ? 'Unlimited custom audio retention unlocked'
                        : '$4.99/mo • Custom retention & priority offline AI'}
                    </Text>
                  </View>
                </View>
                {!isPro && (
                  <View style={styles.upgradeChip}>
                    <Text style={styles.upgradeChipText}>Upgrade</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Audio Retention Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Clock size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>AUDIO RETENTION POLICY</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Local audio files are automatically pruned to conserve phone storage. All text transcripts, summaries, and action items are preserved permanently in SQLite forever.
                </Text>

                <View style={styles.optionsList}>
                  {retentionOptions.map((opt) => {
                    const isSelected = retentionDays === opt.days;
                    return (
                      <TouchableOpacity
                        key={opt.days}
                        style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                        onPress={() => handleSelectRetention(opt.days)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                          <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                            {opt.label}
                          </Text>
                        </View>

                        {opt.isProOnly && !isPro && (
                          <View style={styles.proTag}>
                            <Text style={styles.proTagText}>PRO</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Help & Documentation Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <HelpCircle size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>HELP & USER GUIDE</Text>
                </View>
                <TouchableOpacity
                  style={styles.helpButtonRow}
                  activeOpacity={0.7}
                  onPress={() => setShowHelpGuide(true)}
                >
                  <View style={styles.helpButtonLeft}>
                    <Text style={styles.helpButtonTitle}>Voice Tags & How-To Guide</Text>
                    <Text style={styles.helpButtonSubtitle}>
                      Learn how VocaLog cleans speech and tags Tasks, Events, Reflections, and Notes.
                    </Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Data Ownership & Export Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                  <Download size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.sectionTitle}>DATA OWNERSHIP & EXPORT</Text>
                </View>
                <Text style={styles.sectionDescription}>
                  Your thoughts belong to you. Export your entire journal at any time directly to your device with zero cloud tracking.
                </Text>

                <View style={styles.exportButtonsRow}>
                  <TouchableOpacity
                    style={styles.exportBtn}
                    onPress={handleExportJSON}
                    disabled={isExporting}
                    activeOpacity={0.7}
                  >
                    {isExporting ? (
                      <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                      <>
                        <FileText size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.exportBtnText}>Export JSON</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.exportBtn}
                    onPress={handleExportMarkdown}
                    disabled={isExporting}
                    activeOpacity={0.7}
                  >
                    {isExporting ? (
                      <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                      <>
                        <FileText size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.exportBtnText}>Export Markdown</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Privacy & Architecture Guarantee */}
              <View style={styles.guaranteeBox}>
                <ShieldCheck size={20} color={Colors.primary} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guaranteeTitle}>100% Offline Architecture</Text>
                  <Text style={styles.guaranteeText}>
                    VocaLog processes all audio locally with C++ Whisper. Zero external cloud servers, zero voice uploads, and $0.00 variable cost.
                  </Text>
                </View>
              </View>

              {/* Version */}
              <Text style={styles.versionText}>VocaLog Version 1.0.0 (Build 57)</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Embedded Paywall Modal */}
      <PaywallModal
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => {
          setIsPro(true);
          setShowPaywall(false);
        }}
      />

      {/* Embedded Help Guide Modal */}
      <HelpGuideModal
        visible={showHelpGuide}
        onClose={() => setShowHelpGuide(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg + 8,
    borderTopRightRadius: BorderRadius.lg + 8,
    maxHeight: '92%',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  scrollBody: {
    paddingBottom: Spacing.xl,
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  proBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  proBannerTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  proBannerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  upgradeChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginLeft: 8,
  },
  upgradeChipText: {
    color: Colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm + 4,
  },
  optionsList: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  optionLabel: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  optionLabelSelected: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  proTag: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  proTagText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  exportButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  exportBtnText: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  guaranteeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.25)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  guaranteeTitle: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  guaranteeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  versionText: {
    color: Colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  helpButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  helpButtonLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  helpButtonTitle: {
    color: Colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  helpButtonSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
});
