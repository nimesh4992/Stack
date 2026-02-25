// 📰 AdMob Service - Smart Ad Placement with Revenue Optimization
// NOTE: AdMob only works on iOS/Android native apps
// This version uses require() which can be conditionally loaded

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// AD UNIT IDS
// ============================================

const AD_CONFIG = {
  production: {
    interstitial: 'ca-app-pub-7302439791882329/9857602581',
    nativeAdvanced: 'ca-app-pub-7302439791882329/5675144563',
    rewarded: 'ca-app-pub-7302439791882329/5675144563',
  },
  test: {
    interstitial: 'ca-app-pub-3940256099942544/1033173712',
    rewarded: 'ca-app-pub-3940256099942544/5224354917',
  },
};

// ============================================
// TYPES
// ============================================

export type AdTrigger =
  | 'achievement_unlocked'
  | 'weekly_insights_view'
  | 'goal_milestone'
  | 'streak_extended'
  | 'session_end'
  | 'education_complete';

export interface AdFrequencyConfig {
  maxInterstitialPerDay: number;
  maxRewardedPerDay: number;
  minSecondsBetweenAds: number;
  cooldownAfterInterstitial: number;
}

interface AdTrackingData {
  date: string;
  interstitialCount: number;
  rewardedCount: number;
  lastAdTimestamp: number;
}

const DEFAULT_CONFIG: AdFrequencyConfig = {
  maxInterstitialPerDay: 3,
  maxRewardedPerDay: 5,
  minSecondsBetweenAds: 60,
  cooldownAfterInterstitial: 180,
};

const STORAGE_KEY = '@ad_tracking';

// ============================================
// TRACKING
// ============================================

let trackingData: AdTrackingData | null = null;

async function loadTrackingData(): Promise<AdTrackingData> {
  if (trackingData) return trackingData;
  
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (stored) {
      const data = JSON.parse(stored) as AdTrackingData;
      if (data.date !== today) {
        trackingData = { date: today, interstitialCount: 0, rewardedCount: 0, lastAdTimestamp: 0 };
      } else {
        trackingData = data;
      }
    } else {
      trackingData = { date: today, interstitialCount: 0, rewardedCount: 0, lastAdTimestamp: 0 };
    }
  } catch {
    trackingData = { date: new Date().toISOString().split('T')[0], interstitialCount: 0, rewardedCount: 0, lastAdTimestamp: 0 };
  }
  
  return trackingData;
}

async function saveTrackingData(): Promise<void> {
  if (!trackingData) return;
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trackingData));
  } catch {}
}

// ============================================
// CAN SHOW AD
// ============================================

export async function canShowAd(
  type: 'interstitial' | 'rewarded',
  config: AdFrequencyConfig = DEFAULT_CONFIG
): Promise<{ canShow: boolean; reason?: string }> {
  if (Platform.OS === 'web') {
    return { canShow: false, reason: 'Ads not available on web' };
  }
  
  const data = await loadTrackingData();
  const now = Date.now();
  
  if (type === 'interstitial' && data.interstitialCount >= config.maxInterstitialPerDay) {
    return { canShow: false, reason: 'Daily limit reached' };
  }
  if (type === 'rewarded' && data.rewardedCount >= config.maxRewardedPerDay) {
    return { canShow: false, reason: 'Daily limit reached' };
  }
  
  const secondsSinceLastAd = (now - data.lastAdTimestamp) / 1000;
  if (secondsSinceLastAd < config.minSecondsBetweenAds) {
    return { canShow: false, reason: 'Cooldown active' };
  }
  
  return { canShow: true };
}

// ============================================
// TRIGGER CONFIG
// ============================================

interface TriggerConfig {
  primaryType: 'rewarded' | 'interstitial';
  fallbackType?: 'interstitial';
  probability: number;
  rewardXP?: number;
}

const TRIGGER_CONFIG: Record<AdTrigger, TriggerConfig> = {
  achievement_unlocked: { primaryType: 'rewarded', fallbackType: 'interstitial', probability: 0.8, rewardXP: 50 },
  weekly_insights_view: { primaryType: 'interstitial', probability: 0.6 },
  goal_milestone: { primaryType: 'rewarded', probability: 0.9, rewardXP: 100 },
  streak_extended: { primaryType: 'rewarded', probability: 0.7, rewardXP: 75 },
  session_end: { primaryType: 'interstitial', probability: 0.3 },
  education_complete: { primaryType: 'rewarded', probability: 0.5, rewardXP: 25 },
};

export async function shouldShowAdForTrigger(trigger: AdTrigger) {
  const config = TRIGGER_CONFIG[trigger];
  if (!config) return { shouldShow: false, type: 'interstitial' as const };
  
  if (Math.random() > config.probability) {
    return { shouldShow: false, type: config.primaryType };
  }
  
  const check = await canShowAd(config.primaryType);
  if (check.canShow) {
    return { shouldShow: true, type: config.primaryType, rewardXP: config.rewardXP };
  }
  
  if (config.fallbackType) {
    const fallback = await canShowAd(config.fallbackType);
    if (fallback.canShow) {
      return { shouldShow: true, type: config.fallbackType };
    }
  }
  
  return { shouldShow: false, type: config.primaryType };
}

// ============================================
// AD SHOWING - STUB FOR WEB
// ============================================

export async function showInterstitialAd(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[AdMob] Interstitial ads not available on web');
    return false;
  }
  
  // On native, this would load and show the ad
  // Implementation requires native module which doesn't work on web
  console.log('[AdMob] Would show interstitial ad on native');
  
  const data = await loadTrackingData();
  data.interstitialCount++;
  data.lastAdTimestamp = Date.now();
  await saveTrackingData();
  
  return true;
}

export async function showRewardedAd(
  onRewarded?: (xp: number) => void,
  rewardXP: number = 50
): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[AdMob] Rewarded ads not available on web');
    return false;
  }
  
  console.log('[AdMob] Would show rewarded ad on native');
  
  const data = await loadTrackingData();
  data.rewardedCount++;
  data.lastAdTimestamp = Date.now();
  await saveTrackingData();
  
  if (onRewarded) onRewarded(rewardXP);
  
  return true;
}

// ============================================
// TRIGGER AD
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
  console.log('[AdMob] Initializing...');
  await loadTrackingData();
  
  if (Platform.OS === 'web') {
    console.log('[AdMob] Running on web - ads will be simulated');
  } else {
    console.log('[AdMob] Ready for native ads');
  }
}

// ============================================
// STATS
// ============================================

export async function getAdStats() {
  const data = await loadTrackingData();
  return {
    interstitialShownToday: data.interstitialCount,
    rewardedShownToday: data.rewardedCount,
    remainingInterstitial: DEFAULT_CONFIG.maxInterstitialPerDay - data.interstitialCount,
    remainingRewarded: DEFAULT_CONFIG.maxRewardedPerDay - data.rewardedCount,
  };
}
