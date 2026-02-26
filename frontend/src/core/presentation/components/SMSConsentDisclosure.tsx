// 🛡️ SMS Consent Disclosure Screen
// Prominent Disclosure for Google Play Store Compliance (2026)
// This screen MUST be shown before any SMS permission request

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../common/constants';

interface SMSConsentDisclosureProps {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const { width, height } = Dimensions.get('window');

export const SMSConsentDisclosure: React.FC<SMSConsentDisclosureProps> = ({
  visible,
  onAccept,
  onDecline,
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>SMS Permission Disclosure</Text>
          <Text style={styles.headerSubtitle}>Please read carefully before proceeding</Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Main Disclosure */}
          <View style={styles.disclosureCard}>
            <View style={styles.disclosureBadge}>
              <Ionicons name="chatbubble-ellipses" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.disclosureTitle}>What We Access</Text>
            <Text style={styles.disclosureText}>
              Stack requests permission to read your SMS messages{' '}
              <Text style={styles.boldText}>solely to detect bank transaction alerts</Text>{' '}
              and automatically log your expenses and income.
            </Text>
          </View>

          {/* Data Usage Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How Your SMS Data Is Used</Text>
            
            <View style={styles.usageItem}>
              <View style={[styles.usageIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <View style={styles.usageContent}>
                <Text style={styles.usageTitle}>Transaction Detection</Text>
                <Text style={styles.usageText}>
                  We scan incoming SMS for bank keywords (debit, credit, UPI, etc.) to identify financial transactions
                </Text>
              </View>
            </View>

            <View style={styles.usageItem}>
              <View style={[styles.usageIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <View style={styles.usageContent}>
                <Text style={styles.usageTitle}>Local Processing Only</Text>
                <Text style={styles.usageText}>
                  All SMS parsing happens 100% on your device. No SMS content is ever transmitted to any server
                </Text>
              </View>
            </View>

            <View style={styles.usageItem}>
              <View style={[styles.usageIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>
              <View style={styles.usageContent}>
                <Text style={styles.usageTitle}>User-Controlled Logging</Text>
                <Text style={styles.usageText}>
                  You can review and approve each detected transaction before it's logged, or enable auto-logging
                </Text>
              </View>
            </View>
          </View>

          {/* What We DON'T Do */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We DON'T Do</Text>
            
            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              <Text style={styles.dontText}>We do NOT read personal/private messages</Text>
            </View>
            
            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              <Text style={styles.dontText}>We do NOT upload or share SMS content with anyone</Text>
            </View>
            
            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              <Text style={styles.dontText}>We do NOT use SMS data for advertising</Text>
            </View>
            
            <View style={styles.dontItem}>
              <Ionicons name="close-circle" size={20} color={COLORS.danger} />
              <Text style={styles.dontText}>We do NOT store raw SMS text after processing</Text>
            </View>
          </View>

          {/* Privacy Assurance */}
          <View style={styles.privacyCard}>
            <Ionicons name="lock-closed" size={24} color={COLORS.success} />
            <Text style={styles.privacyTitle}>Your Privacy is Protected</Text>
            <Text style={styles.privacyText}>
              Stack is built with a privacy-first architecture. Your financial data stays on your device 
              and is never shared with third parties. You can disable SMS reading anytime in Settings.
            </Text>
          </View>

          {/* Core Functionality Notice */}
          <View style={styles.coreNotice}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
            <Text style={styles.coreNoticeText}>
              <Text style={styles.boldText}>Note:</Text> SMS auto-detection is a convenience feature. 
              The app works fully without it - you can always add transactions manually or paste SMS text.
            </Text>
          </View>

          {/* Legal Text */}
          <Text style={styles.legalText}>
            By tapping "Accept & Continue", you consent to Stack reading your SMS messages for the 
            purpose of detecting financial transactions as described above. This consent can be 
            revoked anytime by disabling SMS reading in Settings or through your device's app permissions.
          </Text>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.declineButton} 
            onPress={onDecline}
          >
            <Text style={styles.declineButtonText}>No, Thanks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.acceptButton,
              !hasScrolledToBottom && styles.acceptButtonDisabled
            ]}
            onPress={onAccept}
            disabled={!hasScrolledToBottom}
          >
            <Ionicons 
              name="shield-checkmark" 
              size={20} 
              color="#FFFFFF" 
            />
            <Text style={styles.acceptButtonText}>
              Accept & Continue
            </Text>
          </TouchableOpacity>
        </View>
        
        {!hasScrolledToBottom && (
          <Text style={styles.scrollHint}>
            ↓ Scroll to bottom to enable Accept button
          </Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  disclosureCard: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  disclosureBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  disclosureTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  disclosureText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  usageItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  usageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  usageContent: {
    flex: 1,
  },
  usageTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  usageText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dontItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  dontText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  privacyCard: {
    backgroundColor: COLORS.success + '10',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  privacyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  coreNotice: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '08',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  coreNoticeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  legalText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  declineButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.textTertiary,
  },
  acceptButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  scrollHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    textAlign: 'center',
    paddingBottom: SPACING.sm,
  },
});

export default SMSConsentDisclosure;
