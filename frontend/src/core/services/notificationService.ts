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

/**
 * Schedule daily reminder based on user's usage pattern
 * @param settings - Notification settings
 * @param optimalHour - Calculated optimal hour from user's app usage pattern
 */
export async function scheduleDailyReminder(
  settings?: NotificationSettings,
  optimalHour?: number
): Promise<string | null> {
  const config = settings || (await getNotificationSettings());

  if (!config.enabled || !config.dailyReminder) {
    return null;
  }

  // Cancel existing daily reminders
  await cancelScheduledNotification('daily-reminder');

  // Use optimal hour if provided (pattern-based), otherwise use configured time
  let hours: number;
  let minutes: number;
  
  if (optimalHour !== undefined) {
    hours = optimalHour;
    minutes = 0;
    console.log('Using pattern-based notification time:', hours + ':00');
  } else {
    [hours, minutes] = config.dailyReminderTime.split(':').map(Number);
  }
  
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

  console.log('Daily reminder scheduled for', `${hours}:${minutes.toString().padStart(2, '0')}`);
  return identifier;
}

/**
 * Schedule smart notifications based on user behavior patterns
 * @param appOpenTimes - Array of hours when user typically opens the app
 * @param companions - User's selected companion for personalized messages
 */
export async function scheduleSmartNotifications(
  appOpenTimes: number[],
  companionName?: string
): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) return;
  
  // Cancel existing smart notifications
  await cancelScheduledNotification('smart-morning');
  await cancelScheduledNotification('smart-evening');
  await cancelScheduledNotification('smart-challenge');
  
  // Calculate most common hours
  const hourCounts: Record<number, number> = {};
  appOpenTimes.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  // Find peak usage times
  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([hour]) => parseInt(hour));
  
  // Schedule notification 1 hour before their typical usage time
  if (sortedHours.length > 0) {
    const peakHour = sortedHours[0];
    const notifyHour = (peakHour - 1 + 24) % 24; // 1 hour before
    
    const companionGreeting = companionName 
      ? `${companionName} says: ` 
      : '';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${companionGreeting}Time to check in! 📊`,
        body: "Your wallet is waiting. How's today's spending?",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: {
        hour: notifyHour,
        minute: 30,
        repeats: true,
        channelId: 'reminders',
      },
      identifier: 'smart-peak',
    });
    
    console.log(`Smart notification scheduled for ${notifyHour}:30`);
  }
}

/**
 * Schedule challenge reminder notification
 * @param challengeTitle - Name of the challenge
 * @param daysRemaining - Days left to complete
 */
export async function scheduleChallengeReminder(
  challengeTitle: string,
  daysRemaining: number
): Promise<string | null> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) return null;
  
  await cancelScheduledNotification('challenge-reminder');
  
  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🎯 Challenge Update: ${challengeTitle}`,
      body: `${daysRemaining} days left! Keep going, you're doing great!`,
      sound: true,
    },
    trigger: {
      hour: 10, // 10 AM
      minute: 0,
      repeats: true,
      channelId: 'reminders',
    },
    identifier: 'challenge-reminder',
  });
  
  return identifier;
}

/**
 * Send invite friends notification
 */
export async function sendInviteFriendsNudge(): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) return;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👥 Share the Love!',
      body: 'Know someone who could use better money habits? Invite them to join HabitFinance!',
      sound: true,
    },
    trigger: null, // Immediate
  });
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
// DAILY COMPANION MESSAGES
// ============================================

// Companion-specific motivational messages
const COMPANION_MESSAGES: Record<string, { morning: string[]; afternoon: string[]; evening: string[] }> = {
  bear: {
    morning: [
      "Good morning! Let's save some honey today! 🍯",
      "Rise and shine! Time to track those morning expenses! ☀️",
      "New day, new savings opportunities! I believe in you! 💪",
    ],
    afternoon: [
      "How's your spending going? Don't forget to log lunch! 🍽️",
      "Halfway through the day! Keep that budget in check! 📊",
      "Remember: every rupee tracked is a step closer to your goals! 🎯",
    ],
    evening: [
      "Evening check-in time! How did we do today? 🌙",
      "Great job making it through the day! Let's log those expenses! ✨",
      "Your wallet is proud of you for tracking today! 💰",
    ],
  },
  cat: {
    morning: [
      "Purr-fect morning to start tracking! 🐱",
      "Meow! Don't let expenses sneak up on you today! 😼",
      "A curious cat always knows where their money goes! 🔍",
    ],
    afternoon: [
      "Cat nap time? Not before logging your lunch! 😸",
      "Still on track? Paw-some if you are! 🐾",
      "Don't be a copycat - be unique with your savings! ✨",
    ],
    evening: [
      "Time to curl up and review today's spending! 🌙",
      "Feeling good about your expenses? I'm purring! 😻",
      "Nine lives, one budget - make it count! 💫",
    ],
  },
  robot: {
    morning: [
      "Good morning! Computing optimal savings strategy... 🤖",
      "Systems online. Ready to track expenses efficiently! 💻",
      "Initializing daily budget protocol. Let's optimize! ⚡",
    ],
    afternoon: [
      "Midday analysis: Are you on budget track? 📈",
      "Processing... Lunch expense detection required! 🔄",
      "Data shows: Tracking leads to 42% better savings! 📊",
    ],
    evening: [
      "End of day report pending. Log your expenses! 📋",
      "Calculating... You're doing great, human! 🌟",
      "Saving data... Your financial future looks bright! 💾",
    ],
  },
  panda: {
    morning: [
      "Namaste! A mindful morning starts with budget awareness! 🧘",
      "Take a deep breath... and log that coffee expense! ☕",
      "Balance in all things - including your finances! ⚖️",
    ],
    afternoon: [
      "Pause. Breathe. Track. You've got this! 🎋",
      "Finding zen in your spending? That's the way! 💚",
      "A peaceful wallet leads to a peaceful mind! 🙏",
    ],
    evening: [
      "As the sun sets, reflect on today's spending journey! 🌅",
      "Gratitude for every rupee tracked. Well done! 🙏",
      "Rest well knowing your finances are in order! 🌙",
    ],
  },
  fox: {
    morning: [
      "Good morning, clever saver! What's the plan today? 🦊",
      "Outsmart those unnecessary expenses! You're too clever for them! 🧠",
      "A fox always knows the best deals! Keep your eyes open! 👀",
    ],
    afternoon: [
      "Sniffing out savings? That's what I like to see! 🔍",
      "Stay cunning with your spending! No impulse buys! 💡",
      "Quick and clever - that's how we save! ⚡",
    ],
    evening: [
      "Another day of outsmarting expenses! Well done! 🌟",
      "Sly move logging all your spending today! 🏆",
      "The fox approves of your financial wisdom! 🦊",
    ],
  },
  owl: {
    morning: [
      "Who's ready to make wise financial choices today? 🦉",
      "Wisdom says: Track before you spend! 📚",
      "An early bird catches savings. An owl knows how to keep them! 💰",
    ],
    afternoon: [
      "Stay wise with your afternoon spending! 🎓",
      "Knowledge is power - know where your money goes! 📖",
      "The wise owl sees all... including hidden expenses! 👁️",
    ],
    evening: [
      "As darkness falls, reflect on today's financial wisdom! 🌙",
      "Hoot hoot! Another day of wise money choices! 🎉",
      "The owl is proud of your thoughtful spending! 💎",
    ],
  },
};

/**
 * Schedule daily companion message with smart timing
 * Uses pattern-based timing from user's app usage
 */
export async function scheduleDailyCompanionMessage(
  companionId: string,
  appOpenTimes: number[],
  currentStreak: number,
  todaySpending: number,
  dailyBudget: number
): Promise<void> {
  const settings = await getNotificationSettings();
  
  if (!settings.enabled) return;
  
  // Cancel existing companion message
  await cancelScheduledNotification('companion-daily');
  
  // Calculate optimal time based on user's app usage pattern
  let optimalHour = 20; // Default 8 PM
  
  if (appOpenTimes.length >= 5) {
    // Find most common hour
    const hourCounts: Record<number, number> = {};
    appOpenTimes.forEach(hour => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });
    
    let maxCount = 0;
    Object.entries(hourCounts).forEach(([hour, count]) => {
      if (count > maxCount) {
        maxCount = count;
        optimalHour = parseInt(hour);
      }
    });
  }
  
  // Get time-appropriate message
  const companionMessages = COMPANION_MESSAGES[companionId] || COMPANION_MESSAGES.bear;
  let messagePool: string[];
  
  if (optimalHour >= 5 && optimalHour < 12) {
    messagePool = companionMessages.morning;
  } else if (optimalHour >= 12 && optimalHour < 17) {
    messagePool = companionMessages.afternoon;
  } else {
    messagePool = companionMessages.evening;
  }
  
  // Add contextual suffix based on user's stats
  let contextSuffix = '';
  if (currentStreak > 0) {
    contextSuffix = ` 🔥 ${currentStreak}-day streak!`;
  }
  if (todaySpending > 0 && dailyBudget > 0) {
    const percentage = Math.round((todaySpending / dailyBudget) * 100);
    if (percentage < 50) {
      contextSuffix += ' Great budget control today!';
    } else if (percentage >= 80) {
      contextSuffix += ' Watch that budget!';
    }
  }
  
  const message = messagePool[Math.floor(Math.random() * messagePool.length)];
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: message,
      body: `Your daily check-in from HabitFinance!${contextSuffix}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.DEFAULT,
    },
    trigger: {
      hour: optimalHour,
      minute: 0,
      repeats: true,
      channelId: 'companion',
    },
    identifier: 'companion-daily',
  });
  
  console.log(`Companion message scheduled for ${optimalHour}:00`);
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
