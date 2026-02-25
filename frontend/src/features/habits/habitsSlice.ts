// 🏃 Habits Tracker Redux Slice
// Persists steps, water, mindful minutes data

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../store';

const HABITS_STORAGE_KEY = '@stack_habits_data';

export interface DailyHabit {
  date: string; // YYYY-MM-DD format
  steps: number;
  stepsGoal: number;
  water: number;
  waterGoal: number;
  mindfulMinutes: number;
  mindfulGoal: number;
  completedAt?: string;
}

export interface HabitsState {
  dailyData: Record<string, DailyHabit>;
  defaultGoals: {
    steps: number;
    water: number;
    mindful: number;
  };
  streakDays: number;
  totalStepsAllTime: number;
  totalWaterAllTime: number;
  totalMindfulAllTime: number;
  isLoading: boolean;
  lastSyncedAt: string | null;
}

const initialState: HabitsState = {
  dailyData: {},
  defaultGoals: {
    steps: 10000,
    water: 8,
    mindful: 15,
  },
  streakDays: 0,
  totalStepsAllTime: 0,
  totalWaterAllTime: 0,
  totalMindfulAllTime: 0,
  isLoading: false,
  lastSyncedAt: null,
};

// Get today's date in YYYY-MM-DD format
const getTodayKey = (): string => {
  return new Date().toISOString().split('T')[0];
};

// Load habits from AsyncStorage
export const loadHabits = createAsyncThunk(
  'habits/load',
  async () => {
    try {
      const stored = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as HabitsState;
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
    return null;
  }
);

// Save habits to AsyncStorage
export const saveHabits = createAsyncThunk(
  'habits/save',
  async (_, { getState }) => {
    try {
      const state = getState() as RootState;
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(state.habits));
      return new Date().toISOString();
    } catch (error) {
      console.error('Error saving habits:', error);
      throw error;
    }
  }
);

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    // Initialize today's data if not exists
    initTodayHabits: (state) => {
      const today = getTodayKey();
      if (!state.dailyData[today]) {
        state.dailyData[today] = {
          date: today,
          steps: 0,
          stepsGoal: state.defaultGoals.steps,
          water: 0,
          waterGoal: state.defaultGoals.water,
          mindfulMinutes: 0,
          mindfulGoal: state.defaultGoals.mindful,
        };
      }
    },
    
    // Update steps
    updateSteps: (state, action: PayloadAction<{ steps: number; isAbsolute?: boolean }>) => {
      const today = getTodayKey();
      if (!state.dailyData[today]) {
        state.dailyData[today] = {
          date: today,
          steps: 0,
          stepsGoal: state.defaultGoals.steps,
          water: 0,
          waterGoal: state.defaultGoals.water,
          mindfulMinutes: 0,
          mindfulGoal: state.defaultGoals.mindful,
        };
      }
      
      const prevSteps = state.dailyData[today].steps;
      if (action.payload.isAbsolute) {
        state.dailyData[today].steps = Math.max(0, action.payload.steps);
      } else {
        state.dailyData[today].steps = Math.max(0, prevSteps + action.payload.steps);
      }
      
      // Update all-time total
      state.totalStepsAllTime += (state.dailyData[today].steps - prevSteps);
    },
    
    // Update water intake
    updateWater: (state, action: PayloadAction<{ glasses: number; isAbsolute?: boolean }>) => {
      const today = getTodayKey();
      if (!state.dailyData[today]) {
        state.dailyData[today] = {
          date: today,
          steps: 0,
          stepsGoal: state.defaultGoals.steps,
          water: 0,
          waterGoal: state.defaultGoals.water,
          mindfulMinutes: 0,
          mindfulGoal: state.defaultGoals.mindful,
        };
      }
      
      const prevWater = state.dailyData[today].water;
      if (action.payload.isAbsolute) {
        state.dailyData[today].water = Math.max(0, action.payload.glasses);
      } else {
        state.dailyData[today].water = Math.max(0, Math.min(20, prevWater + action.payload.glasses));
      }
      
      // Update all-time total
      state.totalWaterAllTime += (state.dailyData[today].water - prevWater);
    },
    
    // Update mindful minutes
    updateMindful: (state, action: PayloadAction<{ minutes: number; isAbsolute?: boolean }>) => {
      const today = getTodayKey();
      if (!state.dailyData[today]) {
        state.dailyData[today] = {
          date: today,
          steps: 0,
          stepsGoal: state.defaultGoals.steps,
          water: 0,
          waterGoal: state.defaultGoals.water,
          mindfulMinutes: 0,
          mindfulGoal: state.defaultGoals.mindful,
        };
      }
      
      const prevMindful = state.dailyData[today].mindfulMinutes;
      if (action.payload.isAbsolute) {
        state.dailyData[today].mindfulMinutes = Math.max(0, action.payload.minutes);
      } else {
        state.dailyData[today].mindfulMinutes = Math.max(0, prevMindful + action.payload.minutes);
      }
      
      // Update all-time total
      state.totalMindfulAllTime += (state.dailyData[today].mindfulMinutes - prevMindful);
    },
    
    // Update goals
    updateGoal: (state, action: PayloadAction<{ type: 'steps' | 'water' | 'mindful'; value: number }>) => {
      const today = getTodayKey();
      const { type, value } = action.payload;
      
      // Update default goals
      state.defaultGoals[type] = Math.max(1, value);
      
      // Update today's goal if exists
      if (state.dailyData[today]) {
        if (type === 'steps') {
          state.dailyData[today].stepsGoal = Math.max(1000, value);
        } else if (type === 'water') {
          state.dailyData[today].waterGoal = Math.max(1, value);
        } else {
          state.dailyData[today].mindfulGoal = Math.max(5, value);
        }
      }
    },
    
    // Calculate streak
    calculateStreak: (state) => {
      const dates = Object.keys(state.dailyData).sort().reverse();
      let streak = 0;
      let currentDate = new Date();
      
      for (const dateKey of dates) {
        const data = state.dailyData[dateKey];
        const checkDate = currentDate.toISOString().split('T')[0];
        
        if (dateKey !== checkDate) {
          // Check if we missed a day
          const dayDiff = Math.floor(
            (new Date(checkDate).getTime() - new Date(dateKey).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (dayDiff > 1) break;
        }
        
        // Check if at least one goal was met
        const stepsComplete = data.steps >= data.stepsGoal;
        const waterComplete = data.water >= data.waterGoal;
        const mindfulComplete = data.mindfulMinutes >= data.mindfulGoal;
        
        if (stepsComplete || waterComplete || mindfulComplete) {
          streak++;
          currentDate = new Date(dateKey);
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      state.streakDays = streak;
    },
    
    // Mark day as complete
    markDayComplete: (state) => {
      const today = getTodayKey();
      if (state.dailyData[today]) {
        state.dailyData[today].completedAt = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadHabits.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadHabits.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          return { ...action.payload, isLoading: false };
        }
      })
      .addCase(loadHabits.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(saveHabits.fulfilled, (state, action) => {
        state.lastSyncedAt = action.payload;
      });
  },
});

export const {
  initTodayHabits,
  updateSteps,
  updateWater,
  updateMindful,
  updateGoal,
  calculateStreak,
  markDayComplete,
} = habitsSlice.actions;

// Selectors
export const selectTodayHabits = (state: RootState): DailyHabit | null => {
  const today = getTodayKey();
  return state.habits.dailyData[today] || null;
};

export const selectHabitsStreak = (state: RootState): number => state.habits.streakDays;

export const selectDefaultGoals = (state: RootState) => state.habits.defaultGoals;

export const selectAllTimeStats = (state: RootState) => ({
  steps: state.habits.totalStepsAllTime,
  water: state.habits.totalWaterAllTime,
  mindful: state.habits.totalMindfulAllTime,
});

export default habitsSlice.reducer;
