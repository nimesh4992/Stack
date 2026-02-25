// 🔔 Local Notification Service
// Handles push notifications for streak reminders, nudges, and achievements

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface NotificationSettings {
  enabled: boolean;
  streakReminders: boolean;
  dailyReminder: boolean;
  dailyReminderTime: string; // HH:mm format
  achievementAlerts: boolean;
  budgetAlerts: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  streakReminders: true,
  dailyReminder: true,
  dailyReminderTime: '20:00', // 8 PM
  achievementAlerts: true,
  budgetAlerts: true,
};

const STORAGE_KEY = '@notification_settings';

// ============================================
// NOTIFICATION CONTENT
// ============================================

const STREAK_REMINDER_MESSAGES = [
  {
    title: "🔥 Don't break your streak!",
    body: "You haven't logged today. Your streak is at risk!",
  },
  {
    title: "👻 Your streak is ghosting you",
    body: "Quick! Log something before midnight to keep it alive.",
  },
  {
    title: "⏰ Streak Alert!",
    body: "Just 1 log can save your streak. What did you spend today?",
  },
  {
    title: "💰 Your wallet misses you",
    body: "Haven't logged in a while. Let's keep that habit going!",
  },
];

const DAILY_REMINDER_MESSAGES = [
  {
    title: "🌙 Evening check-in time!",
    body: "How did your spending go today? Log it before you forget.",
  },
  {
    title: "📝 Daily recap time",
    body: "A minute to log = a lifetime of good habits. Let's go!",
  },
  {
    title: "✨ Building wealth, one log at a time",
    body: "Quick check: Did you track all expenses today?",
  },
];

const ACHIEVEMENT_MESSAGES = {
  streak_3: {
    title: "🎉 3-Day Streak!",
    body: "You're building momentum! Keep it going.",
  },
  streak_7: {
    title: "🔥 7-Day Streak Unlocked!",
    body: "One whole week! You're on fire!",
  },
  streak_14: {
    title: "🌟 2-Week Champion!",
    body: "14 days strong. You're in the top 10% of users!",
  },
  streak_30: {
    title: "👑 30-Day Legend!",
    body: "A whole month! Your future self is celebrating.",
  },
  budget_master: {
    title: "💪 Budget Master!",
    body: "You stayed under budget today. That's discipline!",
  },
  first_log: {
    title: "🌟 First Log Complete!",
    body: "Welcome to your financial journey. Great start!",
  },
};

// ============================================
// INITIALIZATION
// ============================================

export async function initializeNotifications(): Promise<boolean> {
  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Check if physical device
  if (!Device.isDevice) {
    console.log('Notifications require a physical device');
    return false;
  }

  // Request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permission not granted');
    return false;
  }

  // Android-specific channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'HabitFinance',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
    });

    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      description: 'Daily reminders and streak alerts',
    });

    await Notifications.setNotificationChannelAsync('achievements', {
      name: 'Achievements',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Badge and milestone notifications',
    });
  }

  return true;
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading notification settings:', error);
  }
  return DEFAULT_SETTINGS;
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Reschedule notifications based on new settings
    if (updated.enabled) {
      await scheduleDailyReminder(updated);
    } else {
      await cancelAllScheduledNotifications();
    }
  } catch (error) {
    console.error('Error saving notification settings:', error);
  }
}

// ============================================
// SCHEDULING
// ============================================

export async function scheduleDailyReminder(
  settings?: NotificationSettings
): Promise<string | null> {
  const config = settings || (await getNotificationSettings());

  if (!config.enabled || !config.dailyReminder) {
    return null;
  }

  // Cancel existing daily reminders
  await cancelScheduledNotification('daily-reminder');

  const [hours, minutes] = config.dailyReminderTime.split(':').map(Number);
  const message = DAILY_REMINDER_MESSAGES[Math.floor(Math.random() * DAILY_REMINDER_MESSAGES.length)];

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour: hours,
      minute: minutes,
      repeats: true,
      channelId: 'reminders',
    },
    identifier: 'daily-reminder',
  });

  console.log('Daily reminder scheduled for', config.dailyReminderTime);
  return identifier;
}

export async function scheduleStreakReminder(
  currentStreak: number,
  hasLoggedToday: boolean
): Promise<string | null> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.streakReminders || hasLoggedToday) {
    return null;
  }

  // Cancel existing streak reminder
  await cancelScheduledNotification('streak-reminder');

  // Only schedule if user has a streak to protect
  if (currentStreak === 0) {
    return null;
  }

  const message = STREAK_REMINDER_MESSAGES[Math.floor(Math.random() * STREAK_REMINDER_MESSAGES.length)];

  // Schedule for 9 PM if not logged by then
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: `${message.body} (${currentStreak}-day streak at risk!)`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour: 21,
      minute: 0,
      repeats: false,
      channelId: 'reminders',
    },
    identifier: 'streak-reminder',
  });

  return identifier;
}

// ============================================
// INSTANT NOTIFICATIONS
// ============================================

export async function sendAchievementNotification(
  achievementType: keyof typeof ACHIEVEMENT_MESSAGES
): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.achievementAlerts) {
    return;
  }

  const message = ACHIEVEMENT_MESSAGES[achievementType];
  if (!message) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.title,
      body: message.body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: null, // Immediate
  });
}

export async function sendBudgetAlert(
  spent: number,
  limit: number
): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled || !settings.budgetAlerts) {
    return;
  }

  const percentage = Math.round((spent / limit) * 100);
  let title: string;
  let body: string;

  if (percentage >= 100) {
    title = '🚨 Budget Exceeded!';
    body = `You've spent ₹${spent.toLocaleString()} of your ₹${limit.toLocaleString()} daily budget.`;
  } else if (percentage >= 80) {
    title = '⚠️ Budget Warning';
    body = `${percentage}% of daily budget used. ₹${(limit - spent).toLocaleString()} remaining.`;
  } else {
    return; // No alert needed
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

export async function sendCustomNudge(
  title: string,
  body: string
): Promise<void> {
  const settings = await getNotificationSettings();

  if (!settings.enabled) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: null,
  });
}

// ============================================
// UTILITIES
// ============================================

export async function cancelScheduledNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.log('No notification to cancel:', identifier);
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}

export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

// ============================================
// LISTENERS
// ============================================

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
