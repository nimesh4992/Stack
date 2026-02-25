// 🚀 App Entry Point - Splash & Router
import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../src/store';
import { loadOnboardingStatus } from '../src/features/onboarding/onboardingSlice';
import { loadTransactions } from '../src/features/expenseTracking/expenseSlice';
import { loadGamification } from '../src/features/gamification/gamificationSlice';
import { COLORS } from '../src/core/common/constants';

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load all persisted data
      const result = await dispatch(loadOnboardingStatus()).unwrap();
      await dispatch(loadTransactions());
      await dispatch(loadGamification());

      // Navigate based on onboarding status
      setTimeout(() => {
        if (result.isComplete) {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      // Navigate to onboarding on error
      router.replace('/onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
