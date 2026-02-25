// User Preferences Redux Slice
// Manages user settings like companion choice, name, notification preferences, etc.

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface UserPreferences {
  // Profile
  displayName: string;
  companionId: string;
  
  // App Usage Tracking (for smart notifications)
  appOpenTimes: number[]; // Array of hours (0-23) when user typically opens app
  lastAppOpen: string | null; // ISO timestamp
  totalAppOpens: number;
  
  // Notification Preferences
  notificationsEnabled: boolean;
  smartNotifications: boolean; // Use pattern-based timing
  dailyReminderEnabled: boolean;
  streakRemindersEnabled: boolean;
  challengeRemindersEnabled: boolean;
  
  // SMS Settings
  smsAutoReadEnabled: boolean;
  smsAutoLogEnabled: boolean; // Auto-log without confirmation
  showSMSTour: boolean; // Show tutorial on first visit
  
  // Feature Tours
  hasSeenSmsTour: boolean;
  hasSeenChallengesTour: boolean;
  hasSeenInsightsTour: boolean;
}

interface UserPreferencesState {
  preferences: UserPreferences;
  isLoaded: boolean;
  isLoading: boolean;
}

// ============================================
// DEFAULTS
// ============================================

const DEFAULT_PREFERENCES: UserPreferences = {
  displayName: '',
  companionId: 'bear',
  
  appOpenTimes: [],
  lastAppOpen: null,
  totalAppOpens: 0,
  
  notificationsEnabled: true,
  smartNotifications: true,
  dailyReminderEnabled: true,
  streakRemindersEnabled: true,
  challengeRemindersEnabled: true,
  
  smsAutoReadEnabled: false,
  smsAutoLogEnabled: false,
  showSMSTour: true,
  
  hasSeenSmsTour: false,
  hasSeenChallengesTour: false,
  hasSeenInsightsTour: false,
};

const STORAGE_KEY = '@user_preferences';

// ============================================
// ASYNC THUNKS
// ============================================

export const loadUserPreferences = createAsyncThunk(
  'userPreferences/load',
  async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }
);

export const saveUserPreferences = createAsyncThunk(
  'userPreferences/save',
  async (preferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
    return preferences;
  }
);

// Track app open time for smart notifications
export const trackAppOpen = createAsyncThunk(
  'userPreferences/trackAppOpen',
  async (_, { getState }) => {
    const state = getState() as { userPreferences: UserPreferencesState };
    const { preferences } = state.userPreferences;
    
    const now = new Date();
    const currentHour = now.getHours();
    
    // Add current hour to pattern (keep last 30 opens)
    const newOpenTimes = [...preferences.appOpenTimes, currentHour].slice(-30);
    
    const updated: UserPreferences = {
      ...preferences,
      appOpenTimes: newOpenTimes,
      lastAppOpen: now.toISOString(),
      totalAppOpens: preferences.totalAppOpens + 1,
    };
    
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error tracking app open:', error);
    }
    
    return updated;
  }
);

// ============================================
// SLICE
// ============================================

const initialState: UserPreferencesState = {
  preferences: DEFAULT_PREFERENCES,
  isLoaded: false,
  isLoading: false,
};

const userPreferencesSlice = createSlice({
  name: 'userPreferences',
  initialState,
  reducers: {
    setDisplayName: (state, action: PayloadAction<string>) => {
      state.preferences.displayName = action.payload;
    },
    setCompanion: (state, action: PayloadAction<string>) => {
      state.preferences.companionId = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.preferences.notificationsEnabled = action.payload;
    },
    setSmartNotifications: (state, action: PayloadAction<boolean>) => {
      state.preferences.smartNotifications = action.payload;
    },
    setSmsAutoRead: (state, action: PayloadAction<boolean>) => {
      state.preferences.smsAutoReadEnabled = action.payload;
    },
    setSmsAutoLog: (state, action: PayloadAction<boolean>) => {
      state.preferences.smsAutoLogEnabled = action.payload;
    },
    markSmsTourSeen: (state) => {
      state.preferences.hasSeenSmsTour = true;
    },
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserPreferences.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
        state.isLoaded = true;
        state.isLoading = false;
      })
      .addCase(loadUserPreferences.rejected, (state) => {
        state.isLoading = false;
        state.isLoaded = true;
      })
      .addCase(saveUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      .addCase(trackAppOpen.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const {
  setDisplayName,
  setCompanion,
  setNotificationsEnabled,
  setSmartNotifications,
  setSmsAutoRead,
  setSmsAutoLog,
  markSmsTourSeen,
  updatePreferences,
} = userPreferencesSlice.actions;

export default userPreferencesSlice.reducer;

// ============================================
// SELECTORS
// ============================================

export const selectPreferences = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.preferences;

export const selectCompanionId = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.preferences.companionId;

export const selectDisplayName = (state: { userPreferences: UserPreferencesState }) =>
  state.userPreferences.preferences.displayName;

// Get optimal notification time based on user's app usage pattern
export const selectOptimalNotificationHour = (state: { userPreferences: UserPreferencesState }): number => {
  const { appOpenTimes } = state.userPreferences.preferences;
  
  if (appOpenTimes.length < 5) {
    // Not enough data, default to 8 PM
    return 20;
  }
  
  // Find most common hour
  const hourCounts: Record<number, number> = {};
  appOpenTimes.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  let maxCount = 0;
  let optimalHour = 20;
  
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      optimalHour = parseInt(hour);
    }
  });
  
  return optimalHour;
};
