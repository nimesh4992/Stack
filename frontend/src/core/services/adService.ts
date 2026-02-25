// 📰 AdMob Service - Smart Ad Placement with Revenue Optimization
// Implements frequency capping and strategic ad triggers
// NOTE: AdMob only works on iOS/Android native apps, not web

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// AD UNIT IDS
// ============================================

const AD_CONFIG = {
  production: {
    interstitial: 'ca-app-pub-7302439791882329/9857602581',
    nativeAdvanced: 'ca-app-pub-7302439791882329/5675144563',
    rewarded: 'ca-app-pub-7302439791882329/5675144563', // Use same for now
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
  triggerHistory: { trigger: AdTrigger; timestamp: number }[];
}

const DEFAULT_CONFIG: AdFrequencyConfig = {
  maxInterstitialPerDay: 3,
  maxRewardedPerDay: 5,
  minSecondsBetweenAds: 60,
  cooldownAfterInterstitial: 180,
};

const STORAGE_KEY = '@ad_tracking';

// ============================================
// AD TRACKING & FREQUENCY CAPPING
// ============================================

let trackingData: AdTrackingData | null = null;

async function loadTrackingData(): Promise<AdTrackingData> {
  if (trackingData) return trackingData;
  
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as AdTrackingData;
      const today = new Date().toISOString().split('T')[0];
      
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
  // AdMob not available on web
  if (Platform.OS === 'web') {
    return { canShow: false, reason: 'Ads not available on web' };
  }
  
  const data = await loadTrackingData();
  const now = Date.now();
  
  if (type === 'interstitial' && data.interstitialCount >= config.maxInterstitialPerDay) {
    return { canShow: false, reason: 'Daily interstitial limit reached' };
  }
  if (type === 'rewarded' && data.rewardedCount >= config.maxRewardedPerDay) {
    return { canShow: false, reason: 'Daily rewarded limit reached' };
  }
  
  const secondsSinceLastAd = (now - data.lastAdTimestamp) / 1000;
  if (secondsSinceLastAd < config.minSecondsBetweenAds) {
    return { canShow: false, reason: `Cooldown active` };
  }
  
  return { canShow: true };
}

// ============================================
// TRIGGER-BASED AD DECISION
// ============================================

interface TriggerConfig {
  primaryType: 'rewarded' | 'interstitial';
  fallbackType?: 'interstitial';
  probability: number;
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
    probability: 0.3,
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
  
  if (Math.random() > config.probability) {
    return { shouldShow: false, type: config.primaryType };
  }
  
  const primaryCheck = await canShowAd(config.primaryType);
  if (primaryCheck.canShow) {
    return { shouldShow: true, type: config.primaryType, rewardXP: config.rewardXP };
  }
  
  if (config.fallbackType) {
    const fallbackCheck = await canShowAd(config.fallbackType);
    if (fallbackCheck.canShow) {
      return { shouldShow: true, type: config.fallbackType };
    }
  }
  
  return { shouldShow: false, type: config.primaryType };
}

// ============================================
// AD SHOWING (Native Only)
// ============================================

let adModule: any = null;

async function getAdModule() {
  if (Platform.OS === 'web') return null;
  if (adModule) return adModule;
  
  try {
    adModule = await import('react-native-google-mobile-ads');
    return adModule;
  } catch (error) {
    console.log('AdMob module not available:', error);
    return null;
  }
}

export async function showInterstitialAd(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  
  const check = await canShowAd('interstitial');
  if (!check.canShow) {
    console.log('Cannot show interstitial:', check.reason);
    return false;
  }
  
  try {
    const ads = await getAdModule();
    if (!ads) return false;
    
    const { InterstitialAd, AdEventType } = ads;
    const adUnitId = __DEV__ ? AD_CONFIG.test.interstitial : AD_CONFIG.production.interstitial;
    
    const interstitial = InterstitialAd.createForAdRequest(adUnitId);
    
    return new Promise((resolve) => {
      interstitial.addAdEventListener(AdEventType.LOADED, async () => {
        await interstitial.show();
        const data = await loadTrackingData();
        data.interstitialCount++;
        data.lastAdTimestamp = Date.now();
        await saveTrackingData();
        resolve(true);
      });
      
      interstitial.addAdEventListener(AdEventType.ERROR, () => {
        resolve(false);
      });
      
      interstitial.load();
    });
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
  
  try {
    const ads = await getAdModule();
    if (!ads) return false;
    
    const { RewardedAd, RewardedAdEventType, AdEventType } = ads;
    const adUnitId = __DEV__ ? AD_CONFIG.test.rewarded : AD_CONFIG.production.rewarded;
    
    const rewarded = RewardedAd.createForAdRequest(adUnitId);
    
    return new Promise((resolve) => {
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, async () => {
        await rewarded.show();
      });
      
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, async () => {
        if (onRewarded) onRewarded(rewardXP);
        const data = await loadTrackingData();
        data.rewardedCount++;
        data.lastAdTimestamp = Date.now();
        await saveTrackingData();
        resolve(true);
      });
      
      rewarded.addAdEventListener(AdEventType.ERROR, () => {
        resolve(false);
      });
      
      rewarded.load();
    });
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
    await loadTrackingData();
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
