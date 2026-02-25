// 🎯 Onboarding Redux Slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile } from '../../core/data/models';
import { storageService } from '../../core/data/storage';
import { generateId } from '../../core/common/utils';

interface OnboardingState {
  isComplete: boolean;
  userProfile: UserProfile | null;
  currentStep: number;
  quizAnswers: {
    personality?: 'saver' | 'balanced' | 'spontaneous';
    goal?: 'save' | 'reduce' | 'invest' | 'debt';
    target?: number;
  };
}

const initialState: OnboardingState = {
  isComplete: false,
  userProfile: null,
  currentStep: 0,
  quizAnswers: {},
};

// Async thunks
export const loadOnboardingStatus = createAsyncThunk(
  'onboarding/loadStatus',
  async () => {
    const isComplete = await storageService.isOnboardingComplete();
    const profile = await storageService.getUserProfile();
    return { isComplete, profile };
  }
);

export const completeOnboarding = createAsyncThunk(
  'onboarding/complete',
  async (_, { getState }) => {
    const state = getState() as { onboarding: OnboardingState };
    const { quizAnswers } = state.onboarding;
    
    const profile: UserProfile = {
      id: generateId(),
      name: 'User', // Can be collected in a future step
      personality: quizAnswers.personality!,
      primaryGoal: quizAnswers.goal!,
      monthlyTarget: quizAnswers.target!,
      createdAt: new Date().toISOString(),
    };
    
    await storageService.saveUserProfile(profile);
    await storageService.setOnboardingComplete();
    
    return profile;
  }
);

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setQuizAnswer: (state, action: PayloadAction<Partial<OnboardingState['quizAnswers']>>) => {
      state.quizAnswers = { ...state.quizAnswers, ...action.payload };
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    prevStep: (state) => {
      state.currentStep = Math.max(0, state.currentStep - 1);
    },
    resetOnboarding: (state) => {
      state.currentStep = 0;
      state.quizAnswers = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadOnboardingStatus.fulfilled, (state, action) => {
        state.isComplete = action.payload.isComplete;
        state.userProfile = action.payload.profile;
      })
      .addCase(completeOnboarding.fulfilled, (state, action) => {
        state.isComplete = true;
        state.userProfile = action.payload;
      });
  },
});

export const { setQuizAnswer, nextStep, prevStep, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;
