// 📰 AdMob Service - Smart Ad Placement with Revenue Optimization
// Implements frequency capping and strategic ad triggers

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

// ============================================
// AD UNIT IDS
// ============================================

const AD_CONFIG = {
  // Production IDs
  production: {
    interstitial: 'ca-app-pub-7302439791882329/9857602581',
    nativeAdvanced: 'ca-app-pub-7302439791882329/5675144563',
  },
  // Test IDs for development
  test: {
    interstitial: TestIds.INTERSTITIAL,
    rewarded: TestIds.REWARDED,
  },
};

// Use test IDs in development
const isDev = __DEV__;
const getAdUnitId = (type: 'interstitial' | 'rewarded' | 'nativeAdvanced') => {
  if (isDev) {
    return type === 'nativeAdvanced' ? AD_CONFIG.test.interstitial : AD_CONFIG.test[type as 'interstitial' | 'rewarded'];
  }
  return AD_CONFIG.production[type as keyof typeof AD_CONFIG.production] || AD_CONFIG.test.interstitial;
};

// ============================================
// TYPES
// ============================================

export type AdTrigger =
  | 'achievement_unlocked'    // Badge/milestone earned
  | 'weekly_insights_view'    // Viewing detailed reports
  | 'goal_milestone'          // Goal progress (25%, 50%, 75%, 100%)
  | 'streak_extended'         // 7+ day streak
  | 'session_end'             // App going to background
  | 'education_complete';     // After viewing a tip/lesson

export interface AdFrequencyConfig {
  maxInterstitialPerDay: number;
  maxRewardedPerDay: number;
  minSecondsBetweenAds: number;
  cooldownAfterInterstitial: number; // seconds
}

interface AdTrackingData {
  date: string; // YYYY-MM-DD
  interstitialCount: number;
  rewardedCount: number;
  lastAdTimestamp: number;
  triggerHistory: { trigger: AdTrigger; timestamp: number }[];
}

const DEFAULT_CONFIG: AdFrequencyConfig = {
  maxInterstitialPerDay: 3,
  maxRewardedPerDay: 5,
  minSecondsBetweenAds: 60, // 1 minute minimum between any ads
  cooldownAfterInterstitial: 180, // 3 minutes after interstitial
};

const STORAGE_KEY = '@ad_tracking';

// ============================================
// AD TRACKING & FREQUENCY CAPPING
// ============================================

let trackingData: AdTrackingData | null = null;
let interstitialAd: InterstitialAd | null = null;
let rewardedAd: RewardedAd | null = null;
let isInterstitialLoaded = false;
let isRewardedLoaded = false;

async function loadTrackingData(): Promise<AdTrackingData> {
  if (trackingData) return trackingData;
  
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AdTrackingData;
      const today = new Date().toISOString().split('T')[0];
      
      // Reset if it's a new day
      if (data.date !== today) {
        trackingData = {
          date: today,
          interstitialCount: 0,
          rewardedCount: 0,
          lastAdTimestamp: 0,
          triggerHistory: [],
        };
      } else {
        trackingData = data;
      }
    } else {
      trackingData = {
        date: new Date().toISOString().split('T')[0],
        interstitialCount: 0,
        rewardedCount: 0,
        lastAdTimestamp: 0,
        triggerHistory: [],
      };
    }
  } catch (error) {
    console.error('Error loading ad tracking:', error);
    trackingData = {
      date: new Date().toISOString().split('T')[0],
      interstitialCount: 0,
      rewardedCount: 0,
      lastAdTimestamp: 0,
      triggerHistory: [],
    };
  }
  
  return trackingData;
}

async function saveTrackingData(): Promise<void> {
  if (!trackingData) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trackingData));
  } catch (error) {
    console.error('Error saving ad tracking:', error);
  }
}

// ============================================
// CAN SHOW AD CHECK
// ============================================

export async function canShowAd(
  type: 'interstitial' | 'rewarded',
  config: AdFrequencyConfig = DEFAULT_CONFIG
): Promise<{ canShow: boolean; reason?: string }> {
  const data = await loadTrackingData();
  const now = Date.now();
  
  // Check frequency cap
  if (type === 'interstitial' && data.interstitialCount >= config.maxInterstitialPerDay) {
    return { canShow: false, reason: 'Daily interstitial limit reached' };
  }
  if (type === 'rewarded' && data.rewardedCount >= config.maxRewardedPerDay) {
    return { canShow: false, reason: 'Daily rewarded limit reached' };
  }
  
  // Check cooldown
  const secondsSinceLastAd = (now - data.lastAdTimestamp) / 1000;
  if (secondsSinceLastAd < config.minSecondsBetweenAds) {
    return { canShow: false, reason: `Cooldown active (${Math.ceil(config.minSecondsBetweenAds - secondsSinceLastAd)}s remaining)` };
  }
  
  return { canShow: true };
}

// ============================================
// TRIGGER-BASED AD DECISION
// ============================================

interface TriggerConfig {
  primaryType: 'rewarded' | 'interstitial';
  fallbackType?: 'interstitial';
  probability: number; // 0-1, chance of showing ad
  rewardXP?: number;
}

const TRIGGER_CONFIG: Record<AdTrigger, TriggerConfig> = {
  achievement_unlocked: {
    primaryType: 'rewarded',
    fallbackType: 'interstitial',
    probability: 0.8,
    rewardXP: 50,
  },
  weekly_insights_view: {
    primaryType: 'interstitial',
    probability: 0.6,
  },
  goal_milestone: {
    primaryType: 'rewarded',
    probability: 0.9,
    rewardXP: 100,
  },
  streak_extended: {
    primaryType: 'rewarded',
    probability: 0.7,
    rewardXP: 75,
  },
  session_end: {
    primaryType: 'interstitial',
    probability: 0.3, // Low frequency
  },
  education_complete: {
    primaryType: 'rewarded',
    probability: 0.5,
    rewardXP: 25,
  },
};

export async function shouldShowAdForTrigger(
  trigger: AdTrigger
): Promise<{ shouldShow: boolean; type: 'rewarded' | 'interstitial'; rewardXP?: number }> {
  const config = TRIGGER_CONFIG[trigger];
  if (!config) return { shouldShow: false, type: 'interstitial' };
  
  // Random probability check
  if (Math.random() > config.probability) {
    return { shouldShow: false, type: config.primaryType };
  }
  
  // Check if primary type can be shown
  const primaryCheck = await canShowAd(config.primaryType);
  if (primaryCheck.canShow) {
    return { shouldShow: true, type: config.primaryType, rewardXP: config.rewardXP };
  }
  
  // Try fallback
  if (config.fallbackType) {
    const fallbackCheck = await canShowAd(config.fallbackType);
    if (fallbackCheck.canShow) {
      return { shouldShow: true, type: config.fallbackType };
    }
  }
  
  return { shouldShow: false, type: config.primaryType };
}

// ============================================
// AD LOADING
// ============================================

export function loadInterstitialAd(): void {
  if (Platform.OS === 'web') return;
  
  const adUnitId = getAdUnitId('interstitial');
  interstitialAd = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });
  
  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial ad loaded');
    isInterstitialLoaded = true;
  });
  
  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Interstitial ad error:', error);
    isInterstitialLoaded = false;
  });
  
  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Interstitial ad closed');
    isInterstitialLoaded = false;
    // Preload next ad
    setTimeout(() => loadInterstitialAd(), 1000);
  });
  
  interstitialAd.load();
}

export function loadRewardedAd(): void {
  if (Platform.OS === 'web') return;
  
  const adUnitId = getAdUnitId('rewarded');
  rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: false,
  });
  
  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    console.log('Rewarded ad loaded');
    isRewardedLoaded = true;
  });
  
  rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
    console.log('Rewarded ad reward earned:', reward);
  });
  
  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Rewarded ad error:', error);
    isRewardedLoaded = false;
  });
  
  rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Rewarded ad closed');
    isRewardedLoaded = false;
    setTimeout(() => loadRewardedAd(), 1000);
  });
  
  rewardedAd.load();
}

// ============================================
// AD SHOWING
// ============================================

export async function showInterstitialAd(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  const check = await canShowAd('interstitial');
  if (!check.canShow) {
    console.log('Cannot show interstitial:', check.reason);
    return false;
  }
  
  if (!isInterstitialLoaded || !interstitialAd) {
    console.log('Interstitial not loaded');
    loadInterstitialAd();
    return false;
  }
  
  try {
    await interstitialAd.show();
    
    // Update tracking
    const data = await loadTrackingData();
    data.interstitialCount++;
    data.lastAdTimestamp = Date.now();
    await saveTrackingData();
    
    return true;
  } catch (error) {
    console.error('Error showing interstitial:', error);
    return false;
  }
}

export async function showRewardedAd(
  onRewarded?: (rewardXP: number) => void,
  rewardXP: number = 50
): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  const check = await canShowAd('rewarded');
  if (!check.canShow) {
    console.log('Cannot show rewarded:', check.reason);
    return false;
  }
  
  if (!isRewardedLoaded || !rewardedAd) {
    console.log('Rewarded not loaded');
    loadRewardedAd();
    return false;
  }
  
  try {
    // Add one-time reward listener
    const unsubscribe = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        if (onRewarded) onRewarded(rewardXP);
        unsubscribe();
      }
    );
    
    await rewardedAd.show();
    
    // Update tracking
    const data = await loadTrackingData();
    data.rewardedCount++;
    data.lastAdTimestamp = Date.now();
    await saveTrackingData();
    
    return true;
  } catch (error) {
    console.error('Error showing rewarded:', error);
    return false;
  }
}

// ============================================
// TRIGGER-BASED AD SHOW
// ============================================

export async function triggerAd(
  trigger: AdTrigger,
  onRewarded?: (xp: number) => void
): Promise<{ shown: boolean; type?: 'rewarded' | 'interstitial'; xpEarned?: number }> {
  const decision = await shouldShowAdForTrigger(trigger);
  
  if (!decision.shouldShow) {
    return { shown: false };
  }
  
  if (decision.type === 'rewarded') {
    const shown = await showRewardedAd(onRewarded, decision.rewardXP);
    return { shown, type: 'rewarded', xpEarned: shown ? decision.rewardXP : 0 };
  } else {
    const shown = await showInterstitialAd();
    return { shown, type: 'interstitial' };
  }
}

// ============================================
// INITIALIZATION
// ============================================

export async function initializeAds(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('AdMob not available on web');
    return;
  }
  
  try {
    // Load tracking data
    await loadTrackingData();
    
    // Preload ads
    loadInterstitialAd();
    loadRewardedAd();
    
    console.log('AdMob initialized');
  } catch (error) {
    console.error('Error initializing AdMob:', error);
  }
}

// ============================================
// STATS
// ============================================

export async function getAdStats(): Promise<{
  interstitialShownToday: number;
  rewardedShownToday: number;
  remainingInterstitial: number;
  remainingRewarded: number;
}> {
  const data = await loadTrackingData();
  return {
    interstitialShownToday: data.interstitialCount,
    rewardedShownToday: data.rewardedCount,
    remainingInterstitial: DEFAULT_CONFIG.maxInterstitialPerDay - data.interstitialCount,
    remainingRewarded: DEFAULT_CONFIG.maxRewardedPerDay - data.rewardedCount,
  };
}
