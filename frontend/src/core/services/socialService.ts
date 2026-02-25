// Social Sharing Service
// Handles invite friends, achievement sharing, and social features

import { Share, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface InviteStats {
  totalInvitesSent: number;
  successfulReferrals: number;
  lastInviteDate: string | null;
  inviteHistory: InviteRecord[];
}

export interface InviteRecord {
  id: string;
  platform: string;
  timestamp: string;
}

export interface ShareableAchievement {
  type: 'streak' | 'badge' | 'savings' | 'challenge' | 'level' | 'milestone';
  title: string;
  description: string;
  value?: number | string;
  icon: string;
  color: string;
}

// ============================================
// CONSTANTS
// ============================================

const INVITE_STORAGE_KEY = '@invite_stats';
const APP_STORE_LINK = 'https://habitfinance.app'; // Replace with actual app store link

// Invite reward tiers
export const INVITE_REWARDS = [
  { invites: 1, badge: 'first_referral', title: 'First Referral', xp: 100, icon: '🤝' },
  { invites: 3, badge: 'social_starter', title: 'Social Starter', xp: 250, icon: '🌟' },
  { invites: 5, badge: 'social_butterfly', title: 'Social Butterfly', xp: 500, icon: '🦋' },
  { invites: 10, badge: 'influencer', title: 'Influencer', xp: 1000, icon: '📢' },
  { invites: 25, badge: 'ambassador', title: 'HabitFinance Ambassador', xp: 2500, icon: '👑' },
];

// ============================================
// INVITE FUNCTIONS
// ============================================

/**
 * Get invite statistics
 */
export async function getInviteStats(): Promise<InviteStats> {
  try {
    const stored = await AsyncStorage.getItem(INVITE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading invite stats:', error);
  }
  return {
    totalInvitesSent: 0,
    successfulReferrals: 0,
    lastInviteDate: null,
    inviteHistory: [],
  };
}

/**
 * Save invite statistics
 */
async function saveInviteStats(stats: InviteStats): Promise<void> {
  try {
    await AsyncStorage.setItem(INVITE_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving invite stats:', error);
  }
}

/**
 * Generate invite message with personalization
 */
export function generateInviteMessage(userName?: string, companionName?: string): string {
  const greeting = userName ? `${userName} here!` : "Hey there!";
  const companionMention = companionName ? ` My buddy ${companionName} and I are` : " I'm";
  
  return `${greeting}${companionMention} building better money habits with HabitFinance! 💰

🎯 Track expenses effortlessly
🔥 Build streaks & earn rewards  
🏆 Complete challenges & level up
📊 Get insights on your spending

It's 100% offline & private - your data stays on YOUR device! 🔒

Join me: ${APP_STORE_LINK}

#HabitFinance #MoneyHabits #FinancialFreedom`;
}

/**
 * Share invite link
 */
export async function shareInvite(
  userName?: string,
  companionName?: string
): Promise<{ success: boolean; platform?: string }> {
  const message = generateInviteMessage(userName, companionName);
  
  try {
    const result = await Share.share({
      message,
      title: 'Join HabitFinance!',
    });
    
    if (result.action === Share.sharedAction) {
      // Track invite
      const stats = await getInviteStats();
      const newRecord: InviteRecord = {
        id: Date.now().toString(),
        platform: result.activityType || 'unknown',
        timestamp: new Date().toISOString(),
      };
      
      stats.totalInvitesSent += 1;
      stats.lastInviteDate = new Date().toISOString();
      stats.inviteHistory.push(newRecord);
      
      await saveInviteStats(stats);
      
      return { success: true, platform: result.activityType };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Error sharing invite:', error);
    return { success: false };
  }
}

/**
 * Check if user has earned a new invite reward
 */
export function checkInviteReward(totalInvites: number): typeof INVITE_REWARDS[0] | null {
  // Find the highest tier the user has reached
  const earnedRewards = INVITE_REWARDS.filter(r => totalInvites >= r.invites);
  
  // Return the most recently earned (highest) reward
  if (earnedRewards.length > 0) {
    return earnedRewards[earnedRewards.length - 1];
  }
  
  return null;
}

/**
 * Get next invite reward milestone
 */
export function getNextInviteReward(totalInvites: number): typeof INVITE_REWARDS[0] | null {
  return INVITE_REWARDS.find(r => r.invites > totalInvites) || null;
}

// ============================================
// ACHIEVEMENT SHARING
// ============================================

/**
 * Generate achievement share message
 */
export function generateAchievementMessage(achievement: ShareableAchievement): string {
  const messages: Record<string, string> = {
    streak: `🔥 ${achievement.value}-Day Streak! I've been tracking my expenses for ${achievement.value} days straight on HabitFinance!`,
    badge: `🏆 Achievement Unlocked: ${achievement.title}! ${achievement.description}`,
    savings: `💰 Savings Milestone! I've saved ₹${achievement.value?.toLocaleString()} using HabitFinance!`,
    challenge: `✅ Challenge Completed: ${achievement.title}! ${achievement.description}`,
    level: `⬆️ Level Up! I just reached Level ${achievement.value} on HabitFinance!`,
    milestone: `🎉 ${achievement.title}! ${achievement.description}`,
  };
  
  const baseMessage = messages[achievement.type] || `🎯 ${achievement.title}: ${achievement.description}`;
  
  return `${baseMessage}

Building better money habits, one day at a time! 💪

Track your finances offline & privately: ${APP_STORE_LINK}

#HabitFinance #FinancialGoals #MoneyHabits`;
}

/**
 * Share achievement to social media
 */
export async function shareAchievement(
  achievement: ShareableAchievement
): Promise<{ success: boolean; platform?: string }> {
  const message = generateAchievementMessage(achievement);
  
  try {
    const result = await Share.share({
      message,
      title: `${achievement.icon} ${achievement.title}`,
    });
    
    return {
      success: result.action === Share.sharedAction,
      platform: result.activityType,
    };
  } catch (error) {
    console.error('Error sharing achievement:', error);
    return { success: false };
  }
}

// ============================================
// PRE-BUILT ACHIEVEMENTS
// ============================================

export function createStreakAchievement(days: number): ShareableAchievement {
  return {
    type: 'streak',
    title: `${days}-Day Streak`,
    description: `Tracked expenses for ${days} consecutive days!`,
    value: days,
    icon: '🔥',
    color: '#FF6B35',
  };
}

export function createBadgeAchievement(badge: { id: string; name: string; description: string }): ShareableAchievement {
  const badgeIcons: Record<string, string> = {
    first_log: '📝',
    streak_7: '🔥',
    streak_30: '💎',
    budget_master: '👑',
    savings_pro: '💰',
    challenge_champion: '🏆',
    first_referral: '🤝',
    social_butterfly: '🦋',
    influencer: '📢',
    ambassador: '👑',
  };
  
  return {
    type: 'badge',
    title: badge.name,
    description: badge.description,
    icon: badgeIcons[badge.id] || '🏅',
    color: '#5856D6',
  };
}

export function createSavingsAchievement(amount: number): ShareableAchievement {
  return {
    type: 'savings',
    title: 'Savings Milestone',
    description: `Saved ₹${amount.toLocaleString()} towards financial goals!`,
    value: amount,
    icon: '💰',
    color: '#34C759',
  };
}

export function createChallengeAchievement(challenge: { title: string; description: string }): ShareableAchievement {
  return {
    type: 'challenge',
    title: challenge.title,
    description: challenge.description,
    icon: '✅',
    color: '#FF9500',
  };
}

export function createLevelAchievement(level: number): ShareableAchievement {
  return {
    type: 'level',
    title: `Level ${level}`,
    description: `Reached Level ${level} in the financial journey!`,
    value: level,
    icon: '⬆️',
    color: '#AF52DE',
  };
}

export function createMilestoneAchievement(
  title: string,
  description: string,
  icon: string = '🎉'
): ShareableAchievement {
  return {
    type: 'milestone',
    title,
    description,
    icon,
    color: '#007AFF',
  };
}
