// FAQs Screen
// Frequently Asked Questions for Stack

import React, { useState } from 'react';
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

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQ[] = [
  // Getting Started
  {
    category: 'Getting Started',
    question: 'How do I log my first expense?',
    answer: 'Tap the "+" button at the bottom of the home screen. Select a category, enter the amount, and optionally add a note. Your expense will be logged and you\'ll earn XP points!',
  },
  {
    category: 'Getting Started',
    question: 'What is the streak feature?',
    answer: 'Your streak tracks consecutive days of logging at least one transaction. Maintaining a streak earns you bonus XP and unlocks special badges. Don\'t break your streak - you\'ll get reminders if you haven\'t logged that day!',
  },
  {
    category: 'Getting Started',
    question: 'How do I change my companion avatar?',
    answer: 'Go to Settings > Choose Companion. Select from various animal companions that will guide you on your financial journey. Each companion has a unique personality!',
  },
  // SMS & Auto-Detection
  {
    category: 'SMS & Auto-Detection',
    question: 'How does SMS auto-detection work?',
    answer: 'On Android, Stack can read incoming bank SMS messages to automatically detect transactions. When enabled, it parses transaction details (amount, merchant, type) from the SMS and suggests logging them. All processing happens on your device - no data is sent anywhere.',
  },
  {
    category: 'SMS & Auto-Detection',
    question: 'Is SMS reading available on iOS?',
    answer: 'Due to iOS restrictions, automatic SMS reading is not available. However, you can manually paste bank SMS text using the "Paste SMS" feature in Settings, and we\'ll parse it for you.',
  },
  {
    category: 'SMS & Auto-Detection',
    question: 'Which banks are supported?',
    answer: 'We support most Indian banks including SBI, HDFC, ICICI, Axis, Kotak, and many others. Our parser recognizes common SMS formats used by these banks. If your bank SMS isn\'t recognized, you can always log manually.',
  },
  // Privacy & Security
  {
    category: 'Privacy & Security',
    question: 'Is my financial data safe?',
    answer: 'Yes! Stack is 100% offline-first. All your data is stored locally on your device and never uploaded to any server. We don\'t have access to your financial information, and uninstalling the app removes all data.',
  },
  {
    category: 'Privacy & Security',
    question: 'Do you sell my data to advertisers?',
    answer: 'Absolutely not. We never sell, share, or transmit your data. While we show ads to support the app, advertisers only receive anonymized demographics from Google - never your financial data.',
  },
  {
    category: 'Privacy & Security',
    question: 'What happens if I lose my phone?',
    answer: 'Since all data is stored locally, losing your phone means losing your data. We recommend enabling Google Drive backup (Settings > Data > Backup) to keep your data safe. Backups are encrypted and stored in your personal Google Drive.',
  },
  // Features
  {
    category: 'Features',
    question: 'What are Habit Rings?',
    answer: 'Habit Rings are circular progress indicators that track your daily financial habits. Each ring represents a different habit: Daily Logging, Budget Adherence, Savings Progress, Mindful Spending, and Income Tracking. Complete all rings daily for maximum XP!',
  },
  {
    category: 'Features',
    question: 'How do I earn XP and level up?',
    answer: 'You earn XP through various activities: logging transactions (+10 XP), maintaining streaks (+5 XP/day), completing challenges (+50-200 XP), and achieving goals. As you accumulate XP, you\'ll level up and unlock new badges and titles.',
  },
  {
    category: 'Features',
    question: 'What are Challenges?',
    answer: 'Challenges are special tasks that push you to develop better financial habits. Examples include "No-Spend Day," "Log 7 Days in a Row," or "Stay Under Budget This Week." Completing challenges earns significant XP rewards.',
  },
  {
    category: 'Features',
    question: 'How do AI Insights work?',
    answer: 'Our AI runs entirely on your device using TensorFlow. It analyzes your spending patterns to predict future expenses, identify unusual transactions, and provide personalized tips. Since it runs locally, your data never leaves your phone.',
  },
  // Technical
  {
    category: 'Technical',
    question: 'Why aren\'t notifications working?',
    answer: 'Make sure notifications are enabled in Settings > Notifications. Also check your device\'s notification settings to ensure Stack isn\'t blocked. On Android, check battery optimization settings which might prevent background notifications.',
  },
  {
    category: 'Technical',
    question: 'Can I export my data?',
    answer: 'Yes! Go to Settings > Data > Export Data. This creates a JSON file with all your transactions, goals, and progress. You can use this for backup or to analyze your data in other tools.',
  },
  {
    category: 'Technical',
    question: 'How do I reset the app?',
    answer: 'Go to Settings > Data > Clear All Data. This permanently deletes all your data and resets the app to its initial state. Make sure to backup first if you want to keep your data!',
  },
];

export default function FaqsScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(FAQS.map(f => f.category)))];
  
  const filteredFaqs = selectedCategory === 'All' 
    ? FAQS 
    : FAQS.filter(f => f.category === selectedCategory);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container} data-testid="faqs-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="faqs-back-btn">
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Category Filter */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category && styles.categoryChipTextActive
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* FAQ Count */}
        <Text style={styles.faqCount}>
          {filteredFaqs.length} question{filteredFaqs.length !== 1 ? 's' : ''}
        </Text>

        {/* FAQ Items */}
        {filteredFaqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => toggleExpand(index)}
          >
            <Card style={[
              styles.faqCard,
              expandedIndex === index && styles.faqCardExpanded
            ]}>
              <View style={styles.faqHeader}>
                <View style={styles.faqQuestion}>
                  <View style={styles.questionIcon}>
                    <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.questionText}>{faq.question}</Text>
                </View>
                <Ionicons 
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </View>
              
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <View style={styles.answerDivider} />
                  <Text style={styles.answerText}>{faq.answer}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{faq.category}</Text>
                  </View>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        ))}

        {/* Still Have Questions */}
        <Card style={styles.contactCard}>
          <View style={styles.contactIcon}>
            <Ionicons name="chatbubbles" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.contactTitle}>Still have questions?</Text>
          <Text style={styles.contactSubtitle}>
            We're here to help! Reach out to our support team.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => router.push('/help-support')}
          >
            <Ionicons name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </Card>

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
  categoryContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  faqCount: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  faqCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  faqCardExpanded: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: SPACING.md,
  },
  questionIcon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  questionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  answerContainer: {
    marginTop: SPACING.md,
  },
  answerDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  answerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary + '15',
  },
  categoryBadgeText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.medium,
  },
  contactCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  contactTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  contactSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
  },
  contactButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
});
