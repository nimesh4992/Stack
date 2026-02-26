// ⚙️ Settings Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../src/store';
import { selectPreferences } from '../src/features/userPreferences/userPreferencesSlice';
import { Card } from '../src/core/presentation/components/Card';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { SMSConsentDisclosure } from '../src/core/presentation/components/SMSConsentDisclosure';
import { storageService } from '../src/core/data/storage';
import {
  initializeNotifications,
  getNotificationSettings,
  updateNotificationSettings,
  scheduleDailyReminder,
} from '../src/core/services/notificationService';
import {
  checkSMSPermission,
  requestSMSPermission,
  getSMSSettings,
  updateSMSSettings,
  checkUserConsent,
  recordUserConsent,
} from '../src/core/services/smsService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.onboarding.userProfile);
  const gamification = useSelector((state: RootState) => state.gamification);
  const transactions = useSelector((state: RootState) => state.expense.transactions);
  const preferences = useSelector(selectPreferences);
  
  // Get display name from preferences or userProfile
  const displayName = preferences.displayName || userProfile?.name || 'User';
  
  // Notification settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  
  // SMS settings
  const [smsAutoRead, setSmsAutoRead] = useState(false);
  const [smsAutoLog, setSmsAutoLog] = useState(false);
  const [hasSMSPermission, setHasSMSPermission] = useState(false);
  const [isSMSSupported, setIsSMSSupported] = useState(false);
  const [hasUserConsent, setHasUserConsent] = useState(false);
  
  // SMS Consent Disclosure Modal
  const [showSMSDisclosure, setShowSMSDisclosure] = useState(false);
  
  // Other settings
  const [darkMode, setDarkMode] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load notification settings
    const notifSettings = await getNotificationSettings();
    setNotificationsEnabled(notifSettings.enabled);
    setStreakReminders(notifSettings.streakReminders);
    setDailyReminder(notifSettings.dailyReminder);

    // Load SMS settings
    const smsSettings = await getSMSSettings();
    setSmsAutoRead(smsSettings.autoReadEnabled);
    setSmsAutoLog(smsSettings.autoLogEnabled);

    // Check SMS permissions and user consent
    const smsPerms = await checkSMSPermission();
    setHasSMSPermission(smsPerms.hasReadPermission && smsPerms.hasReceivePermission);
    setIsSMSSupported(smsPerms.isSupported);
    setHasUserConsent(smsPerms.hasUserConsent);
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    if (value) {
      const initialized = await initializeNotifications();
      if (initialized) {
        await updateNotificationSettings({ enabled: true });
        await scheduleDailyReminder();
        Alert.alert('Notifications Enabled', 'You\'ll receive streak reminders and daily check-ins.');
      } else {
        setNotificationsEnabled(false);
        Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
      }
    } else {
      await updateNotificationSettings({ enabled: false });
    }
  };

  const handleStreakRemindersToggle = async (value: boolean) => {
    setStreakReminders(value);
    await updateNotificationSettings({ streakReminders: value });
  };

  const handleDailyReminderToggle = async (value: boolean) => {
    setDailyReminder(value);
    await updateNotificationSettings({ dailyReminder: value });
    if (value) {
      await scheduleDailyReminder();
    }
  };

  const handleSMSAutoReadToggle = async (value: boolean) => {
    if (value && !hasUserConsent) {
      // GOOGLE PLAY COMPLIANCE: Show prominent disclosure FIRST
      setShowSMSDisclosure(true);
      return;
    }

    if (value && !hasSMSPermission) {
      // User has given consent, now request system permission
      const granted = await requestSMSPermission();
      if (granted) {
        setHasSMSPermission(true);
        setSmsAutoRead(true);
        await updateSMSSettings({ autoReadEnabled: true });
        Alert.alert('Success', 'SMS auto-detection is now enabled. Bank transactions will be detected automatically!');
      }
      return;
    }

    setSmsAutoRead(value);
    await updateSMSSettings({ autoReadEnabled: value });
  };

  // Handle SMS Disclosure Accept
  const handleSMSDisclosureAccept = async () => {
    setShowSMSDisclosure(false);
    
    // Record user consent
    await recordUserConsent();
    setHasUserConsent(true);
    
    // Now request system permission
    const granted = await requestSMSPermission();
    if (granted) {
      setHasSMSPermission(true);
      setSmsAutoRead(true);
      await updateSMSSettings({ autoReadEnabled: true });
      Alert.alert('Success', 'SMS auto-detection is now enabled. Bank transactions will be detected automatically!');
    } else {
      Alert.alert(
        'Permission Not Granted',
        'You can still use manual SMS paste feature to log transactions.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle SMS Disclosure Decline
  const handleSMSDisclosureDecline = () => {
    setShowSMSDisclosure(false);
    Alert.alert(
      'SMS Detection Disabled',
      'You can still add transactions manually or paste SMS text in the SMS Import screen.',
      [{ text: 'OK' }]
    );
  };

  const handleSMSAutoLogToggle = async (value: boolean) => {
    if (value) {
      Alert.alert(
        'Auto-Log Transactions?',
        'Detected bank SMS will be automatically logged without confirmation.\n\nYou can always edit or delete transactions later.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              setSmsAutoLog(true);
              await updateSMSSettings({ autoLogEnabled: true });
            },
          },
        ]
      );
    } else {
      setSmsAutoLog(false);
      await updateSMSSettings({ autoLogEnabled: false });
    }
  };

  const handleExportData = async () => {
    try {
      const data = {
        profile: userProfile,
        transactions,
        gamification,
        exportDate: new Date().toISOString(),
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      
      Alert.alert(
        'Export Successful',
        `Data exported!\n\nTransactions: ${transactions.length}\nPoints: ${gamification.points}\nSize: ${(jsonString.length / 1024).toFixed(2)} KB`,
        [{ text: 'OK' }]
      );
      
      // In a real app, you would use expo-sharing to share the file
      console.log('Export data:', jsonString);
    } catch (error) {
      Alert.alert('Export Failed', 'Could not export data');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data?',
      'This will delete all your transactions, progress, and settings. This action cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.clearAllData();
              Alert.alert('Success', 'All data cleared. Restarting app...', [
                { text: 'OK', onPress: () => router.replace('/onboarding') },
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
    color = COLORS.textSecondary,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    color?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.settingsContent}>
        <Text style={styles.settingsTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || (
        onPress && <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* SMS Consent Disclosure Modal - Google Play Compliance */}
      <SMSConsentDisclosure
        visible={showSMSDisclosure}
        onAccept={handleSMSDisclosureAccept}
        onDecline={handleSMSDisclosureDecline}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Summary Card */}
        <TouchableOpacity onPress={() => router.push('/choose-companion')} activeOpacity={0.7}>
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <CompanionAvatar companionId={preferences.companionId} size="medium" />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{displayName}</Text>
                <Text style={styles.profileStats}>
                  Level {gamification.level} • {gamification.points} XP
                </Text>
              </View>
              <TouchableOpacity style={styles.editButton} onPress={() => router.push('/choose-companion')}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Account Settings */}
        <SettingsSection title="Account">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your name and preferences"
              onPress={() => router.push('/edit-profile')}
              color={COLORS.primary}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="wallet-outline"
              title="Monthly Goal"
              subtitle={`₹${userProfile?.monthlyTarget || 0} target`}
              onPress={() => router.push('/edit-profile')}
              color={COLORS.habitCyan}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="fitness-outline"
              title="Habits Tracker"
              subtitle="Track steps, water & more"
              onPress={() => router.push('/habits-tracker')}
              color={COLORS.habitPurple}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="apps-outline"
              title="Home Screen Widgets"
              subtitle="Quick access widgets"
              onPress={() => router.push('/widgets')}
              color={COLORS.habitOrange}
            />
          </Card>
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="Notifications">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Enable all notifications"
              color={COLORS.habitOrange}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                  thumbColor={notificationsEnabled ? COLORS.primary : COLORS.textTertiary}
                />
              }
            />
            {notificationsEnabled && (
              <>
                <View style={styles.divider} />
                <SettingsItem
                  icon="flame-outline"
                  title="Streak Reminders"
                  subtitle="Alert before streak breaks"
                  color={COLORS.habitOrange}
                  rightElement={
                    <Switch
                      value={streakReminders}
                      onValueChange={handleStreakRemindersToggle}
                      trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                      thumbColor={streakReminders ? COLORS.primary : COLORS.textTertiary}
                    />
                  }
                />
                <View style={styles.divider} />
                <SettingsItem
                  icon="time-outline"
                  title="Daily Reminder"
                  subtitle="Evening check-in at 8 PM"
                  color={COLORS.habitCyan}
                  rightElement={
                    <Switch
                      value={dailyReminder}
                      onValueChange={handleDailyReminderToggle}
                      trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                      thumbColor={dailyReminder ? COLORS.primary : COLORS.textTertiary}
                    />
                  }
                />
              </>
            )}
          </Card>
        </SettingsSection>

        {/* SMS Auto-Read Settings */}
        <SettingsSection title="SMS Auto-Detection">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="chatbubble-ellipses-outline"
              title="Auto-Read Bank SMS"
              subtitle={isSMSSupported ? (hasSMSPermission ? "Detecting transactions automatically" : "Grant permission to enable") : "Android only feature"}
              color={COLORS.habitCyan}
              rightElement={
                <Switch
                  value={smsAutoRead}
                  onValueChange={handleSMSAutoReadToggle}
                  trackColor={{ false: COLORS.border, true: COLORS.habitCyan + '50' }}
                  thumbColor={smsAutoRead ? COLORS.habitCyan : COLORS.textTertiary}
                  disabled={!isSMSSupported}
                />
              }
            />
            {smsAutoRead && (
              <>
                <View style={styles.divider} />
                <SettingsItem
                  icon="flash-outline"
                  title="Auto-Log Transactions"
                  subtitle="Log without confirmation"
                  color={COLORS.warning}
                  rightElement={
                    <Switch
                      value={smsAutoLog}
                      onValueChange={handleSMSAutoLogToggle}
                      trackColor={{ false: COLORS.border, true: COLORS.warning + '50' }}
                      thumbColor={smsAutoLog ? COLORS.warning : COLORS.textTertiary}
                    />
                  }
                />
              </>
            )}
            <View style={styles.divider} />
            <SettingsItem
              icon="clipboard-outline"
              title="Paste SMS Manually"
              subtitle="Parse any bank SMS text"
              onPress={() => router.push('/sms-import')}
              color={COLORS.primary}
            />
          </Card>
          <Text style={styles.sectionHint}>
            {Platform.OS === 'android' 
              ? "Bank SMS will be detected automatically when you receive them. Your messages never leave your device."
              : "SMS reading is only available on Android. Use the manual paste feature on iOS."}
          </Text>
        </SettingsSection>

        {/* Social & Sharing */}
        <SettingsSection title="Social">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="person-add-outline"
              title="Invite Friends"
              subtitle="Earn rewards for referrals"
              onPress={() => router.push('/invite-friends')}
              color={COLORS.habitPurple}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="share-social-outline"
              title="Share Achievement"
              subtitle="Post your progress on social media"
              onPress={() => router.push('/share-achievement')}
              color={COLORS.habitCyan}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="sparkles-outline"
              title="AI Insights"
              subtitle="View predictions and analytics"
              onPress={() => router.push('/ai-insights')}
              color={COLORS.primary}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="happy-outline"
              title="Choose Companion"
              subtitle="Change your avatar buddy"
              onPress={() => router.push('/choose-companion')}
              color={COLORS.habitOrange}
            />
          </Card>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="moon-outline"
              title="Dark Mode"
              subtitle="Switch to dark theme"
              color={COLORS.habitPurple}
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
                  thumbColor={darkMode ? COLORS.primary : COLORS.textTertiary}
                />
              }
            />
          </Card>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="logo-google"
              title="Google Drive Backup"
              subtitle="Backup & restore your data"
              onPress={() => router.push('/google-drive-backup')}
              color="#4285F4"
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="download-outline"
              title="Export Data"
              subtitle={`${transactions.length} transactions`}
              onPress={handleExportData}
              color={COLORS.success}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="trash-outline"
              title="Clear All Data"
              subtitle="Delete everything permanently"
              onPress={handleClearData}
              color={COLORS.danger}
            />
          </Card>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About">
          <Card style={styles.settingsCard}>
            <SettingsItem
              icon="shield-checkmark-outline"
              title="Privacy Policy"
              subtitle="100% on-device, zero tracking"
              onPress={() => router.push('/privacy-policy')}
              color={COLORS.success}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help and contact us"
              onPress={() => router.push('/help-support')}
              color={COLORS.habitOrange}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="chatbubble-ellipses-outline"
              title="FAQs"
              subtitle="Frequently asked questions"
              onPress={() => router.push('/faqs')}
              color={COLORS.habitCyan}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="information-circle-outline"
              title="About Stack"
              subtitle="Version 1.0.0-MVP"
              onPress={() => Alert.alert('Stack', 'Build wealth, one habit at a time.\n\nVersion: 1.0.0-MVP\nBuild: 2026.02.25')}
              color={COLORS.primary}
            />
          </Card>
        </SettingsSection>

        {/* Privacy Badge */}
        <View style={styles.privacyBadge}>
          <Ionicons name="lock-closed" size={16} color={COLORS.success} />
          <Text style={styles.privacyText}>
            Your data never leaves your device
          </Text>
        </View>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  profileStats: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    lineHeight: 18,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingsContent: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.lg + 40 + SPACING.md,
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xl,
  },
  privacyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
