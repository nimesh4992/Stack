// Edit Profile Screen
// Update user name and preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../src/core/presentation/components/Card';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { 
  selectPreferences, 
  updatePreferences,
  saveUserPreferences 
} from '../src/features/userPreferences/userPreferencesSlice';
import { RootState, AppDispatch } from '../src/store';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectPreferences);
  const userProfile = useSelector((state: RootState) => state.onboarding.userProfile);
  const gamification = useSelector((state: RootState) => state.gamification);
  
  // Form state
  const [displayName, setDisplayName] = useState(preferences.displayName || userProfile?.name || '');
  const [monthlyTarget, setMonthlyTarget] = useState(
    userProfile?.monthlyTarget?.toString() || ''
  );
  const [currency, setCurrency] = useState('INR');
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter your display name');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Update preferences
      const updatedPreferences = {
        ...preferences,
        displayName: displayName.trim(),
      };
      
      dispatch(updatePreferences(updatedPreferences));
      await dispatch(saveUserPreferences(updatedPreferences));
      
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <SafeAreaView style={styles.container} data-testid="edit-profile-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="edit-profile-back-btn">
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
          disabled={isSaving}
          data-testid="edit-profile-save-btn"
        >
          <Text style={[styles.saveButtonText, isSaving && styles.saveButtonDisabled]}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Avatar Card */}
          <Card style={styles.avatarCard}>
            <TouchableOpacity 
              style={styles.avatarContainer}
              onPress={() => router.push('/choose-companion')}
            >
              <CompanionAvatar companionId={preferences.companionId} size="large" />
              <View style={styles.editAvatarBadge}>
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.avatarHint}>Tap to change companion</Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Level {gamification.level}</Text>
                <Text style={styles.statLabel}>Rank</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gamification.points}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{gamification.currentStreak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </Card>

          {/* Profile Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Info</Text>
            
            <Card style={styles.formCard}>
              {/* Display Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor={COLORS.textTertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    maxLength={30}
                  />
                </View>
                <Text style={styles.inputHint}>This name will be shown in greetings</Text>
              </View>

              {/* Monthly Budget */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Monthly Budget Goal</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.currencySymbol}>{selectedCurrency.symbol}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={COLORS.textTertiary}
                    value={monthlyTarget}
                    onChangeText={(text) => setMonthlyTarget(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <Text style={styles.inputHint}>Your target monthly spending limit</Text>
              </View>
            </Card>
          </View>

          {/* Currency Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Currency</Text>
            
            <Card style={styles.formCard}>
              <TouchableOpacity 
                style={styles.currencySelector}
                onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencySymbolLarge}>{selectedCurrency.symbol}</Text>
                  <View>
                    <Text style={styles.currencyName}>{selectedCurrency.name}</Text>
                    <Text style={styles.currencyCode}>{selectedCurrency.code}</Text>
                  </View>
                </View>
                <Ionicons 
                  name={showCurrencyPicker ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color={COLORS.textSecondary} 
                />
              </TouchableOpacity>
              
              {showCurrencyPicker && (
                <View style={styles.currencyOptions}>
                  {CURRENCIES.map((curr) => (
                    <TouchableOpacity
                      key={curr.code}
                      style={[
                        styles.currencyOption,
                        currency === curr.code && styles.currencyOptionSelected
                      ]}
                      onPress={() => {
                        setCurrency(curr.code);
                        setShowCurrencyPicker(false);
                      }}
                    >
                      <Text style={styles.currencyOptionSymbol}>{curr.symbol}</Text>
                      <Text style={[
                        styles.currencyOptionText,
                        currency === curr.code && styles.currencyOptionTextSelected
                      ]}>
                        {curr.name}
                      </Text>
                      {currency === curr.code && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
          </View>

          {/* Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons name="information-circle" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.infoText}>
              Your profile data is stored locally on your device. Enable Google Drive backup to keep your data safe across devices.
            </Text>
          </Card>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  saveButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  avatarCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  avatarHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  currencySymbol: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    paddingVertical: SPACING.md,
    marginLeft: SPACING.sm,
  },
  inputHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbolLarge: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    width: 48,
    textAlign: 'center',
    marginRight: SPACING.md,
  },
  currencyName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  currencyCode: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  currencyOptions: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
  },
  currencyOptionSelected: {
    backgroundColor: COLORS.primary + '10',
  },
  currencyOptionSymbol: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    width: 36,
    textAlign: 'center',
  },
  currencyOptionText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  currencyOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  infoCard: {
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primary + '08',
  },
  infoIcon: {
    marginRight: SPACING.md,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
