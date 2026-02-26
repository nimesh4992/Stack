// Choose Your Companion Screen
// Let users select their financial buddy

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch, RootState } from '../src/store';
import { 
  setDisplayName, 
  setCompanion, 
  saveUserPreferences,
  selectPreferences 
} from '../src/features/userPreferences/userPreferencesSlice';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { COMPANIONS, getCompanion } from '../src/core/common/companions';
import { Card } from '../src/core/presentation/components/Card';
import { Button } from '../src/core/presentation/components/Button';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function ChooseCompanionScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectPreferences);
  
  const [name, setName] = useState(preferences.displayName || '');
  const [selectedCompanion, setSelectedCompanion] = useState(preferences.companionId || 'bear');
  const [saving, setSaving] = useState(false);

  const selectedCompanionData = getCompanion(selectedCompanion);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Enter Your Name', 'Please enter your name to continue');
      return;
    }

    setSaving(true);
    try {
      dispatch(setDisplayName(name.trim()));
      dispatch(setCompanion(selectedCompanion));
      await dispatch(saveUserPreferences({
        ...preferences,
        displayName: name.trim(),
        companionId: selectedCompanion,
      })).unwrap();
      
      router.back();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile & Companion</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What should we call you?</Text>
          <Text style={styles.sectionSubtitle}>This will be used for personalized greetings</Text>
          
          <Card style={styles.nameCard}>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textTertiary}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoCapitalize="words"
            />
          </Card>
        </View>

        {/* Selected Companion Preview */}
        <View style={styles.previewSection}>
          <View style={styles.previewCard}>
            <CompanionAvatar companionId={selectedCompanion} size="large" />
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{selectedCompanionData?.name}</Text>
              <Text style={styles.previewPersonality}>{selectedCompanionData?.personality}</Text>
              <Text style={styles.previewGreeting}>"{selectedCompanionData?.greeting}"</Text>
            </View>
          </View>
        </View>

        {/* Companion Selection Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Companion</Text>
          <Text style={styles.sectionSubtitle}>Your buddy will accompany you on your financial journey</Text>

          <View style={styles.companionGrid}>
            {COMPANIONS.map((companion) => (
              <TouchableOpacity
                key={companion.id}
                style={[
                  styles.companionCard,
                  selectedCompanion === companion.id && styles.companionCardSelected,
                  { borderColor: selectedCompanion === companion.id ? companion.color : COLORS.border },
                ]}
                onPress={() => setSelectedCompanion(companion.id)}
                activeOpacity={0.7}
              >
                <CompanionAvatar companionId={companion.id} size="medium" />
                <Text style={styles.companionName}>{companion.name}</Text>
                <Text style={styles.companionPersonality}>{companion.personality}</Text>
                
                {selectedCompanion === companion.id && (
                  <View style={[styles.selectedBadge, { backgroundColor: companion.color }]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description Card */}
        {selectedCompanionData && (
          <Card style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{selectedCompanionData.description}</Text>
          </Card>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button
          title="Save & Continue"
          onPress={handleSave}
          loading={saving}
          disabled={!name.trim()}
          fullWidth
          style={styles.saveButton}
        />
      </View>
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
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  nameCard: {
    padding: SPACING.md,
  },
  nameInput: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    padding: SPACING.md,
    textAlign: 'center',
  },
  previewSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  previewCard: {
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceTint,
    borderRadius: BORDER_RADIUS.xxl,
    width: '100%',
  },
  previewInfo: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  previewName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  previewPersonality: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  previewGreeting: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  companionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  companionCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
  },
  companionCardSelected: {
    backgroundColor: COLORS.surfaceTint,
    borderWidth: 3,
  },
  companionName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  companionPersonality: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surfaceTint,
  },
  descriptionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    height: 56,
  },
});
