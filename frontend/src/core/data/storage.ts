// 💾 Storage Layer - AsyncStorage Wrapper
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../common/constants';
import { UserProfile, Transaction, GamificationState } from './models';

// Generic storage functions
export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

// Specific storage functions for our app
export const storageService = {
  // User Profile
  saveUserProfile: (profile: UserProfile) => storeData(STORAGE_KEYS.USER_PROFILE, profile),
  getUserProfile: () => getData<UserProfile>(STORAGE_KEYS.USER_PROFILE),
  
  // Onboarding
  setOnboardingComplete: () => storeData(STORAGE_KEYS.ONBOARDING_COMPLETE, true),
  isOnboardingComplete: async (): Promise<boolean> => {
    const value = await getData<boolean>(STORAGE_KEYS.ONBOARDING_COMPLETE);
    return value === true;
  },
  
  // Transactions
  saveTransactions: (transactions: Transaction[]) => storeData(STORAGE_KEYS.EXPENSES, transactions),
  getTransactions: () => getData<Transaction[]>(STORAGE_KEYS.EXPENSES),
  
  // Gamification
  saveGamification: (data: GamificationState) => storeData(STORAGE_KEYS.GAMIFICATION, data),
  getGamification: () => getData<GamificationState>(STORAGE_KEYS.GAMIFICATION),
  
  // Theme
  saveTheme: (theme: 'light' | 'dark') => storeData(STORAGE_KEYS.THEME, theme),
  getTheme: () => getData<'light' | 'dark'>(STORAGE_KEYS.THEME),
};
