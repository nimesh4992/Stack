// Privacy Policy Screen
// Detailed privacy policy for HabitFinance

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/core/presentation/components/Card';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

const POLICY_SECTIONS = [
  {
    title: 'Data Collection',
    icon: 'document-text',
    content: `HabitFinance is designed with privacy as a core principle. We collect ZERO personal data from your device.

• No personal information is collected
• No financial data is uploaded to any server
• No usage analytics or tracking
• No third-party data sharing
• No cookies or tracking pixels`,
  },
  {
    title: 'Local Storage',
    icon: 'phone-portrait',
    content: `All your data is stored exclusively on your device:

• Transaction history stays on your phone
• Spending patterns are computed locally
• AI predictions run on-device
• Streak and gamification data is local
• Settings and preferences are device-only

When you uninstall the app, ALL data is permanently deleted.`,
  },
  {
    title: 'SMS Permissions (Android)',
    icon: 'chatbubble-ellipses',
    content: `If you enable SMS auto-detection:

• SMS messages are read ONLY to detect bank transactions
• Messages are processed entirely on your device
• No SMS content is ever transmitted anywhere
• You can disable this feature anytime
• We only look for transaction patterns, nothing else`,
  },
  {
    title: 'Notifications',
    icon: 'notifications',
    content: `Push notifications are used for:

• Daily expense logging reminders
• Streak maintenance alerts
• Challenge completion updates
• Companion messages

All notification scheduling happens locally. No external notification services are used.`,
  },
  {
    title: 'AI & Machine Learning',
    icon: 'hardware-chip',
    content: `Our AI features are 100% on-device:

• Spending predictions use local algorithms
• Category classification runs on your phone
• Churn detection is computed locally
• No cloud AI services are used
• Your financial patterns never leave your device`,
  },
  {
    title: 'Advertising',
    icon: 'megaphone',
    content: `HabitFinance uses AdMob for monetization:

• Ads are displayed within the app
• We do NOT share your financial data with advertisers
• Ad personalization is based on Google's policies
• You can opt out via your device's ad settings
• Ad frequency is limited (max 3/day)`,
  },
  {
    title: 'Google Drive Backup',
    icon: 'cloud-upload',
    content: `If you choose to backup to Google Drive:

• Backup is encrypted before upload
• Only YOU can access your backup files
• We do not have access to your Google account
• Backup is stored in your personal Drive
• You control when backups happen`,
  },
  {
    title: 'Data Security',
    icon: 'shield-checkmark',
    content: `Your data is protected by:

• Device-level encryption (iOS/Android)
• Secure storage APIs
• No network transmission of financial data
• Local-only processing
• Automatic data deletion on uninstall`,
  },
  {
    title: 'Your Rights',
    icon: 'person',
    content: `You have complete control over your data:

• Access: View all your data in the app
• Delete: Uninstall to remove all data
• Export: Backup your data anytime
• Modify: Edit or delete any transaction
• Opt-out: Disable any feature you don't want`,
  },
  {
    title: 'Contact Us',
    icon: 'mail',
    content: `For privacy-related questions:

Email: privacy@habitfinance.app
Website: habitfinance.app/privacy

We respond to all inquiries within 48 hours.`,
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Ionicons name="shield-checkmark" size={48} color={COLORS.success} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSubtitle}>
            HabitFinance is built with a privacy-first approach. Your financial data never leaves your device.
          </Text>
          <Text style={styles.lastUpdated}>Last Updated: December 2025</Text>
        </View>

        {/* Quick Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quick Summary</Text>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryText}>100% Offline - No data uploaded</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryText}>No tracking or analytics</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryText}>AI runs on your device</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryText}>You control your data</Text>
          </View>
        </Card>

        {/* Policy Sections */}
        {POLICY_SECTIONS.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <Ionicons name={section.icon as any} size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </Card>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  heroBadge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.lg,
  },
  lastUpdated: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.md,
  },
  summaryCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.success + '10',
  },
  summaryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  summaryText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  sectionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionContent: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
