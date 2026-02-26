// Help & Support Screen
// Contact form and support options

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
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

const SUPPORT_OPTIONS = [
  {
    icon: 'help-circle',
    title: 'FAQs',
    description: 'Find answers to common questions',
    route: '/faqs',
  },
  {
    icon: 'chatbubbles',
    title: 'Community',
    description: 'Join our Discord community',
    url: 'https://discord.gg/habitfinance',
  },
  {
    icon: 'logo-twitter',
    title: 'Twitter',
    description: 'Follow us for updates',
    url: 'https://twitter.com/habitfinance',
  },
];

const ISSUE_TYPES = [
  'Bug Report',
  'Feature Request',
  'Account Issue',
  'Payment/Ads Issue',
  'Data/Privacy Concern',
  'Other',
];

export default function HelpSupportScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [issueType, setIssueType] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showIssueTypes, setShowIssueTypes] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !issueType || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    
    setSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Message Sent!',
        'Thank you for reaching out. We\'ll get back to you within 24-48 hours.',
        [{ 
          text: 'OK', 
          onPress: () => {
            setName('');
            setEmail('');
            setIssueType('');
            setMessage('');
          }
        }]
      );
    }, 1500);
  };

  const handleOptionPress = (option: typeof SUPPORT_OPTIONS[0]) => {
    if (option.route) {
      router.push(option.route as any);
    } else if (option.url) {
      Linking.openURL(option.url);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Quick Help Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Help</Text>
          <View style={styles.optionsGrid}>
            {SUPPORT_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.optionCard}
                onPress={() => handleOptionPress(option)}
                activeOpacity={0.7}
              >
                <View style={styles.optionIcon}>
                  <Ionicons name={option.icon as any} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Card style={styles.formCard}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textTertiary}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Issue Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Issue Type</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowIssueTypes(!showIssueTypes)}
              >
                <Text style={[
                  styles.dropdownText,
                  !issueType && styles.dropdownPlaceholder
                ]}>
                  {issueType || 'Select issue type'}
                </Text>
                <Ionicons 
                  name={showIssueTypes ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
              
              {showIssueTypes && (
                <View style={styles.dropdownOptions}>
                  {ISSUE_TYPES.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownOption,
                        issueType === type && styles.dropdownOptionSelected
                      ]}
                      onPress={() => {
                        setIssueType(type);
                        setShowIssueTypes(false);
                      }}
                    >
                      <Text style={[
                        styles.dropdownOptionText,
                        issueType === type && styles.dropdownOptionTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Message */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your issue or question..."
                placeholderTextColor={COLORS.textTertiary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <Text style={styles.submitButtonText}>Sending...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </>
              )}
            </TouchableOpacity>
          </Card>
        </View>

        {/* Direct Contact */}
        <Card style={styles.directContact}>
          <View style={styles.contactRow}>
            <Ionicons name="mail" size={24} color={COLORS.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>support@habitfinance.app</Text>
            </View>
          </View>
          <View style={styles.contactDivider} />
          <View style={styles.contactRow}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Response Time</Text>
              <Text style={styles.contactValue}>24-48 hours</Text>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  optionCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 120,
    paddingTop: SPACING.md,
  },
  dropdown: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  dropdownPlaceholder: {
    color: COLORS.textTertiary,
  },
  dropdownOptions: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionSelected: {
    backgroundColor: COLORS.primary + '15',
  },
  dropdownOptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  dropdownOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  directContact: {
    padding: SPACING.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactInfo: {
    marginLeft: SPACING.md,
  },
  contactLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  contactValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  contactDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
});
