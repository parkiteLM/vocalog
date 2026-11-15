import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Check, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Colors, Spacing, BorderRadius } from '../../core/theme';
import {
  subscriptionService,
  PRO_MONTHLY_PRICE,
  PRO_ANNUAL_PRICE,
  ProPlan,
} from '../../data/services/SubscriptionService';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ProPlan>('annual');

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const success = await subscriptionService.purchasePro(selectedPlan);
      if (success) {
        Alert.alert(
          'Welcome to VocaLog Pro!',
          'You now have full access to custom audio retention, all future app updates, and new features.'
        );
        onSuccess?.();
        onClose();
      }
    } catch {
      Alert.alert('Purchase Not Completed', 'The subscription was cancelled or could not be completed.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleRestore = async () => {
    setIsSubscribing(true);
    try {
      const isPro = await subscriptionService.restorePurchases();
      if (isPro) {
        Alert.alert('Purchases Restored', 'Your VocaLog Pro subscription has been restored.');
        onSuccess?.();
        onClose();
      } else {
        Alert.alert('No Active Subscription', 'We could not find an active subscription for this account.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Unable to connect to the store to restore purchases.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close paywall"
          >
            <X size={20} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Badge */}
          <View style={styles.proBadge}>
            <Sparkles size={14} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.proBadgeText}>VOCALOG PRO</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Private Voice Journaling Without Limits</Text>
          <Text style={styles.subtitle}>
            100% on-device speech transcription. Zero recurring cloud fees.
          </Text>

          {/* Feature List */}
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color={Colors.primary} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>Custom Audio Retention</Text>
                <Text style={styles.featureDesc}>
                  Keep recordings forever, or customize auto-purge to 7, 14, or 60 days.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color={Colors.primary} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>100% Offline & Private</Text>
                <Text style={styles.featureDesc}>
                  Audio never touches external servers. Complete peace of mind.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color={Colors.primary} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>Unlimited Voice Reflections</Text>
                <Text style={styles.featureDesc}>
                  Fast Whisper transcription and automatic action item extraction.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Check size={14} color={Colors.primary} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>Full Data Export</Text>
                <Text style={styles.featureDesc}>
                  One-tap JSON, Markdown archives, and daily email digests anytime.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.checkCircle}>
                <Sparkles size={14} color={Colors.primary} />
              </View>
              <View style={styles.featureTextWrapper}>
                <Text style={styles.featureTitle}>All Future Features & Updates Included</Text>
                <Text style={styles.featureDesc}>
                  Active subscribers automatically receive all future app updates, new AI models, and upcoming features at no extra cost.
                </Text>
              </View>
            </View>
          </View>

          {/* Plan Selector */}
          <View style={styles.plansContainer}>
            {/* Annual Plan (Special Ongoing Rate) */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPlan === 'annual' }}
              accessibilityLabel={`Annual plan, ${PRO_ANNUAL_PRICE}`}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadioRow}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedPlan === 'annual' && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedPlan === 'annual' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.planName}>Annual Special</Text>
                    <Text style={styles.planSubtext}>Ongoing continuous rate • Save ~16%</Text>
                  </View>
                </View>
                <View style={styles.badgeBestValue}>
                  <Text style={styles.badgeBestValueText}>BEST VALUE</Text>
                </View>
              </View>
              <View style={styles.planPriceRow}>
                <Text style={styles.price}>{PRO_ANNUAL_PRICE}</Text>
                <Text style={styles.planPriceBreakdown}>~$2.92 / mo</Text>
              </View>
            </TouchableOpacity>

            {/* Monthly Plan */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'monthly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedPlan === 'monthly' }}
              accessibilityLabel={`Monthly plan, ${PRO_MONTHLY_PRICE}`}
            >
              <View style={styles.planHeader}>
                <View style={styles.planRadioRow}>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedPlan === 'monthly' && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                  </View>
                  <View>
                    <Text style={styles.planName}>Monthly Membership</Text>
                    <Text style={styles.trialText}>Includes 3-Day Free Trial</Text>
                  </View>
                </View>
              </View>
              <View style={styles.planPriceRow}>
                <Text style={styles.price}>{PRO_MONTHLY_PRICE}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Subscribe CTA */}
          <TouchableOpacity
            style={styles.subscribeBtn}
            onPress={handleSubscribe}
            disabled={isSubscribing}
            activeOpacity={0.8}
          >
            {isSubscribing ? (
              <ActivityIndicator color={Colors.background} size="small" />
            ) : (
              <Text style={styles.subscribeBtnText}>
                {selectedPlan === 'annual'
                  ? `Subscribe Now — ${PRO_ANNUAL_PRICE}`
                  : `Start 3-Day Free Trial (${PRO_MONTHLY_PRICE})`}
              </Text>
            )}
          </TouchableOpacity>

          {/* Restore Link */}
          <TouchableOpacity
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={isSubscribing}
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

          {/* Test / QA Bypass Link */}
          <TouchableOpacity
            style={styles.devBypassBtn}
            onPress={() => {
              subscriptionService.setMockPro(true);
              Alert.alert('Testing Mode', 'All Pro features have been unlocked for this test build.');
              onSuccess?.();
              onClose();
            }}
          >
            <Text style={styles.devBypassText}>Test Build: Free QA Unlock Pass</Text>
          </TouchableOpacity>

          {/* Legal Footnote */}
          <Text style={styles.legalNotice}>
            Active subscribers automatically receive all continuous updates and new features. Cancel anytime in App Store / Google Play settings. Subscriptions renew automatically unless cancelled at least 24 hours before renewal.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.lg + 8,
    borderTopRightRadius: BorderRadius.lg + 8,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
    marginBottom: Spacing.sm,
  },
  proBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  featureList: {
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
    marginTop: 2,
  },
  featureTextWrapper: {
    flex: 1,
  },
  featureTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  plansContainer: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  planCard: {
    backgroundColor: Colors.surfaceSubtle,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  planCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(45, 212, 191, 0.08)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  planName: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  planSubtext: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  badgeBestValue: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(45, 212, 191, 0.3)',
  },
  badgeBestValueText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  planPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingLeft: 26,
  },
  planPriceBreakdown: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  trialText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  price: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  subscribeBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  subscribeBtnText: {
    color: Colors.background,
    fontSize: 15,
    fontWeight: '700',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  restoreText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  devBypassBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  devBypassText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  legalNotice: {
    color: Colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
});
