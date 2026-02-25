// 🎮 Gamification Redux Slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { GamificationState } from '../../core/data/models';
import { storageService } from '../../core/data/storage';
import { POINTS } from '../../core/common/constants';
import { isTodayDate } from '../../core/common/utils';

const initialState: GamificationState = {
  points: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastLogDate: null,
  badges: [],
  totalTransactions: 0,
};

// Async thunks
export const loadGamification = createAsyncThunk(
  'gamification/load',
  async () => {
    const data = await storageService.getGamification();
    return data || initialState;
  }
);

export const awardPoints = createAsyncThunk(
  'gamification/awardPoints',
  async (points: number, { getState }) => {
    const state = getState() as { gamification: GamificationState };
    const updatedState = {
      ...state.gamification,
      points: state.gamification.points + points,
    };
    
    // Level up every 500 points
    updatedState.level = Math.floor(updatedState.points / 500) + 1;
    
    await storageService.saveGamification(updatedState);
    return updatedState;
  }
);

export const updateStreak = createAsyncThunk(
  'gamification/updateStreak',
  async (_, { getState }) => {
    const state = getState() as { gamification: GamificationState };
    const { lastLogDate, currentStreak, longestStreak } = state.gamification;
    
    let newStreak = currentStreak;
    let awardedPoints = 0;
    
    if (!lastLogDate) {
      // First log ever
      newStreak = 1;
      awardedPoints = POINTS.DAILY_STREAK;
    } else if (!isTodayDate(lastLogDate)) {
      // New day
      newStreak = currentStreak + 1;
      awardedPoints = POINTS.DAILY_STREAK;
    }
    
    const newLongestStreak = Math.max(longestStreak, newStreak);
    
    const updatedState = {
      ...state.gamification,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      lastLogDate: new Date().toISOString(),
      points: state.gamification.points + awardedPoints,
      totalTransactions: state.gamification.totalTransactions + 1,
    };
    
    await storageService.saveGamification(updatedState);
    return updatedState;
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGamification.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(awardPoints.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(updateStreak.fulfilled, (state, action) => {
        return action.payload;
      });
  },
});

export default gamificationSlice.reducer;
