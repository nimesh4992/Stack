// Security Info Modal Component
// Shows data security information when lock icon is tapped

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../common/constants';

interface SecurityInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const SECURITY_FEATURES = [
  {
    icon: 'phone-portrait',
    title: 'On-Device Storage',
    description: 'All your financial data is stored locally on your device. Nothing is uploaded to any server.',
  },
  {
    icon: 'cloud-offline',
    title: 'No Cloud Sync',
    description: 'We never sync your transactions to the cloud. Your spending history stays private.',
  },
  {
    icon: 'eye-off',
    title: 'No Tracking',
    description: 'We don\'t track your behavior or sell your data to advertisers. Your privacy matters.',
  },
  {
    icon: 'hardware-chip',
    title: 'On-Device AI',
    description: 'All AI predictions and analysis happen on your phone. No data leaves your device.',
  },
  {
    icon: 'lock-closed',
    title: 'Encrypted Storage',
    description: 'Your data is protected by your device\'s built-in encryption and security features.',
  },
  {
    icon: 'trash',
    title: 'Easy Data Deletion',
    description: 'Uninstall the app anytime to completely remove all your data. No traces left behind.',
  },
];

export const SecurityInfoModal: React.FC<SecurityInfoModalProps> = ({
  visible,
  onClose,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.lockBadge}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.success} />
            </View>
            <Text style={styles.title}>Your Data is Secure</Text>
            <Text style={styles.subtitle}>
              HabitFinance is built with privacy-first principles
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Security Features */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {SECURITY_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color={COLORS.primary} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}

            {/* Trust Badge */}
            <View style={styles.trustBadge}>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={styles.trustText}>
                100% Offline • Zero Data Collection • Your Privacy Protected
              </Text>
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.gotItButton} onPress={onClose}>
            <Text style={styles.gotItText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  trustText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.semibold,
  },
  gotItButton: {
    backgroundColor: COLORS.primary,
    margin: SPACING.lg,
    marginTop: 0,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  gotItText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
});

export default SecurityInfoModal;
