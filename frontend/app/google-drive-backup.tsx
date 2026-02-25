// Google Drive Backup Screen
// Manage backup and restore to Google Drive

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Card } from '../src/core/presentation/components/Card';
import { RootState } from '../src/store';
import {
  getBackupSettings,
  saveBackupSettings,
  signInWithGoogle,
  signOutFromGoogle,
  backupToGoogleDrive,
  restoreFromGoogleDrive,
  isGoogleSignInAvailable,
  showGoogleDriveSetupInstructions,
  BackupSettings,
} from '../src/core/services/googleDriveService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function GoogleDriveBackupScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  // Get app state for backup
  const transactions = useSelector((state: RootState) => state.expense.transactions);
  const gamification = useSelector((state: RootState) => state.gamification);
  const userProfile = useSelector((state: RootState) => state.onboarding.userProfile);
  const preferences = useSelector((state: RootState) => state.userPreferences.preferences);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    const loadedSettings = await getBackupSettings();
    setSettings(loadedSettings);
    setIsLoading(false);
  };

  const handleSignIn = async () => {
    if (!isGoogleSignInAvailable()) {
      showGoogleDriveSetupInstructions();
      return;
    }
    
    setIsSigningIn(true);
    const result = await signInWithGoogle();
    
    if (result.success && result.email) {
      await saveBackupSettings({
        isConnected: true,
        userEmail: result.email,
      });
      await loadSettings();
      Alert.alert('Success', `Connected as ${result.email}`);
    } else {
      Alert.alert('Sign-In Failed', result.error || 'Could not sign in to Google');
    }
    
    setIsSigningIn(false);
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Disconnect Google Drive?',
      'You will need to sign in again to backup or restore data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await signOutFromGoogle();
            await loadSettings();
          },
        },
      ]
    );
  };

  const handleBackup = async () => {
    if (!settings?.isConnected) {
      Alert.alert('Not Connected', 'Please connect to Google Drive first');
      return;
    }
    
    setIsBackingUp(true);
    
    const backupData = {
      transactions,
      gamification,
      userProfile,
      preferences,
    };
    
    const result = await backupToGoogleDrive(backupData);
    
    if (result.success) {
      await loadSettings();
      Alert.alert('Backup Complete', 'Your data has been backed up to Google Drive');
    } else {
      Alert.alert('Backup Failed', result.error || 'Could not complete backup');
    }
    
    setIsBackingUp(false);
  };

  const handleRestore = async () => {
    if (!settings?.isConnected) {
      Alert.alert('Not Connected', 'Please connect to Google Drive first');
      return;
    }
    
    Alert.alert(
      'Restore from Backup?',
      'This will replace your current data with the backup. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setIsRestoring(true);
            const result = await restoreFromGoogleDrive();
            
            if (result.success && result.data) {
              Alert.alert('Restore Complete', 'Your data has been restored. Please restart the app.');
            } else {
              Alert.alert('Restore Failed', result.error || 'Could not restore from backup');
            }
            
            setIsRestoring(false);
          },
        },
      ]
    );
  };

  const toggleAutoBackup = async () => {
    if (!settings?.isConnected) {
      Alert.alert('Not Connected', 'Please connect to Google Drive first');
      return;
    }
    
    await saveBackupSettings({
      autoBackupEnabled: !settings.autoBackupEnabled,
    });
    await loadSettings();
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Google Drive Backup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <Card style={[styles.statusCard, settings?.isConnected && styles.statusCardConnected]}>
          <View style={styles.statusIcon}>
            <Ionicons 
              name={settings?.isConnected ? 'cloud-done' : 'cloud-offline'} 
              size={48} 
              color={settings?.isConnected ? COLORS.success : COLORS.textTertiary} 
            />
          </View>
          <Text style={styles.statusTitle}>
            {settings?.isConnected ? 'Connected' : 'Not Connected'}
          </Text>
          {settings?.isConnected && settings.userEmail && (
            <Text style={styles.statusEmail}>{settings.userEmail}</Text>
          )}
          {settings?.lastBackupDate && (
            <Text style={styles.lastBackup}>
              Last backup: {formatDate(settings.lastBackupDate)}
            </Text>
          )}
        </Card>

        {/* Info Banner */}
        {!isGoogleSignInAvailable() && (
          <Card style={styles.infoBanner}>
            <Ionicons name="information-circle" size={24} color={COLORS.warning} />
            <Text style={styles.infoBannerText}>
              Google Drive backup requires a development build. This feature is not available in Expo Go.
            </Text>
          </Card>
        )}

        {/* Connect/Disconnect Button */}
        {!settings?.isConnected ? (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-google" size={24} color="#FFFFFF" />
                <Text style={styles.connectButtonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Backup Options</Text>
            
            <Card style={styles.optionsCard}>
              {/* Manual Backup */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleBackup}
                disabled={isBackingUp}
              >
                <View style={[styles.optionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                  <Ionicons name="cloud-upload" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Backup Now</Text>
                  <Text style={styles.optionSubtitle}>
                    {transactions.length} transactions, {gamification.points} XP
                  </Text>
                </View>
                {isBackingUp ? (
                  <ActivityIndicator color={COLORS.primary} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                )}
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Restore */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={handleRestore}
                disabled={isRestoring}
              >
                <View style={[styles.optionIcon, { backgroundColor: COLORS.success + '15' }]}>
                  <Ionicons name="cloud-download" size={24} color={COLORS.success} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Restore from Backup</Text>
                  <Text style={styles.optionSubtitle}>Download your saved data</Text>
                </View>
                {isRestoring ? (
                  <ActivityIndicator color={COLORS.success} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
                )}
              </TouchableOpacity>

              <View style={styles.divider} />

              {/* Auto Backup Toggle */}
              <TouchableOpacity
                style={styles.optionItem}
                onPress={toggleAutoBackup}
              >
                <View style={[styles.optionIcon, { backgroundColor: COLORS.habitPurple + '15' }]}>
                  <Ionicons name="sync" size={24} color={COLORS.habitPurple} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Auto Backup</Text>
                  <Text style={styles.optionSubtitle}>Backup daily automatically</Text>
                </View>
                <View style={[
                  styles.toggleIndicator,
                  settings?.autoBackupEnabled && styles.toggleIndicatorActive
                ]}>
                  <Text style={styles.toggleText}>
                    {settings?.autoBackupEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>

            {/* Disconnect */}
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleSignOut}
            >
              <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              <Text style={styles.disconnectText}>Disconnect Google Drive</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Info */}
        <Card style={styles.securityCard}>
          <View style={styles.securityHeader}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
            <Text style={styles.securityTitle}>Your Data is Secure</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.securityText}>Backups are stored in YOUR Google Drive</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.securityText}>Only you can access your backup files</Text>
          </View>
          <View style={styles.securityItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.securityText}>We never store your Google credentials</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  statusCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusCardConnected: {
    borderColor: COLORS.success,
    borderWidth: 1,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statusTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statusEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  lastBackup: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '10',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  infoBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  connectButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
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
  },
  optionsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  optionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg + 48 + SPACING.md,
  },
  toggleIndicator: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
  },
  toggleIndicatorActive: {
    backgroundColor: COLORS.success + '20',
  },
  toggleText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    marginTop: SPACING.md,
  },
  disconnectText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.danger,
  },
  securityCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.success + '08',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  securityTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  securityText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
