// 🎮 Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit';
import onboardingReducer from '../features/onboarding/onboardingSlice';
import expenseReducer from '../features/expenseTracking/expenseSlice';
import gamificationReducer from '../features/gamification/gamificationSlice';
import userPreferencesReducer from '../features/userPreferences/userPreferencesSlice';

export const store = configureStore({
  reducer: {
    onboarding: onboardingReducer,
    expense: expenseReducer,
    gamification: gamificationReducer,
    userPreferences: userPreferencesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
