// Google Drive Backup Service
// Handles backup and restore to Google Drive
// Note: Requires development build (not Expo Go) for full functionality

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

// Storage key for backup settings
const BACKUP_SETTINGS_KEY = '@google_drive_backup_settings';
const LAST_BACKUP_KEY = '@last_backup_timestamp';

export interface BackupSettings {
  isConnected: boolean;
  userEmail: string | null;
  autoBackupEnabled: boolean;
  lastBackupDate: string | null;
}

const DEFAULT_SETTINGS: BackupSettings = {
  isConnected: false,
  userEmail: null,
  autoBackupEnabled: false,
  lastBackupDate: null,
};

/**
 * Get current backup settings
 */
export const getBackupSettings = async (): Promise<BackupSettings> => {
  try {
    const stored = await AsyncStorage.getItem(BACKUP_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading backup settings:', error);
  }
  return DEFAULT_SETTINGS;
};

/**
 * Save backup settings
 */
export const saveBackupSettings = async (settings: Partial<BackupSettings>): Promise<void> => {
  try {
    const current = await getBackupSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving backup settings:', error);
  }
};

/**
 * Check if Google Sign-In is available
 * Returns false in Expo Go, true in development builds
 */
export const isGoogleSignInAvailable = (): boolean => {
  // In a real implementation, this would check if the native module is available
  // For now, we return false to show the appropriate message
  return false;
};

/**
 * Sign in with Google
 * Note: This is a placeholder. Real implementation requires @react-native-google-signin/google-signin
 */
export const signInWithGoogle = async (): Promise<{ success: boolean; email?: string; error?: string }> => {
  if (!isGoogleSignInAvailable()) {
    return {
      success: false,
      error: 'Google Sign-In is only available in development builds. Please build the app using EAS Build to enable this feature.',
    };
  }

  // Placeholder for actual implementation
  // In a real implementation:
  // 1. await GoogleSignin.hasPlayServices();
  // 2. await GoogleSignin.signIn();
  // 3. await GoogleSignin.getTokens();
  // 4. Store tokens securely

  try {
    // This would be the actual sign-in logic
    return {
      success: false,
      error: 'Google Sign-In not configured. Please set up Google Cloud credentials.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to sign in with Google',
    };
  }
};

/**
 * Sign out from Google
 */
export const signOutFromGoogle = async (): Promise<boolean> => {
  try {
    await saveBackupSettings({
      isConnected: false,
      userEmail: null,
    });
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

/**
 * Backup data to Google Drive
 * Note: Requires development build for full functionality
 */
export const backupToGoogleDrive = async (data: object): Promise<{ success: boolean; error?: string }> => {
  const settings = await getBackupSettings();
  
  if (!settings.isConnected) {
    return {
      success: false,
      error: 'Please connect to Google Drive first',
    };
  }

  if (!isGoogleSignInAvailable()) {
    return {
      success: false,
      error: 'Google Drive backup requires a development build. Please build the app using EAS Build.',
    };
  }

  try {
    // In a real implementation:
    // 1. Get fresh access token
    // 2. Create/update backup file on Drive
    // 3. Store backup metadata

    const backupData = {
      ...data,
      backupTimestamp: new Date().toISOString(),
      appVersion: '1.0.0',
      platform: Platform.OS,
    };

    // Placeholder: Would upload to Google Drive here
    console.log('Backup data:', JSON.stringify(backupData).slice(0, 100) + '...');

    await saveBackupSettings({
      lastBackupDate: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to backup to Google Drive',
    };
  }
};

/**
 * Restore data from Google Drive
 * Note: Requires development build for full functionality
 */
export const restoreFromGoogleDrive = async (): Promise<{ success: boolean; data?: object; error?: string }> => {
  const settings = await getBackupSettings();
  
  if (!settings.isConnected) {
    return {
      success: false,
      error: 'Please connect to Google Drive first',
    };
  }

  if (!isGoogleSignInAvailable()) {
    return {
      success: false,
      error: 'Google Drive restore requires a development build. Please build the app using EAS Build.',
    };
  }

  try {
    // In a real implementation:
    // 1. Get fresh access token
    // 2. Find backup file on Drive
    // 3. Download and parse backup data

    return {
      success: false,
      error: 'No backup found on Google Drive',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to restore from Google Drive',
    };
  }
};

/**
 * Export data as JSON string (for local backup)
 */
export const exportDataAsJson = (data: object): string => {
  const exportData = {
    ...data,
    exportTimestamp: new Date().toISOString(),
    appVersion: '1.0.0',
    platform: Platform.OS,
  };
  return JSON.stringify(exportData, null, 2);
};

/**
 * Show setup instructions for Google Drive
 */
export const showGoogleDriveSetupInstructions = () => {
  Alert.alert(
    'Google Drive Setup',
    'To enable Google Drive backup:\n\n' +
    '1. Build the app using EAS Build:\n' +
    '   npx eas build --platform android\n\n' +
    '2. Configure Google Cloud Console:\n' +
    '   - Create OAuth 2.0 credentials\n' +
    '   - Enable Google Drive API\n\n' +
    '3. Add credentials to app.json\n\n' +
    'For detailed instructions, visit our documentation.',
    [{ text: 'OK' }]
  );
};
