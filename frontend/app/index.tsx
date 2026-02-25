// 🚀 App Entry Point - Splash & Router
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../src/store';
import { loadOnboardingStatus } from '../src/features/onboarding/onboardingSlice';
import { loadTransactions } from '../src/features/expenseTracking/expenseSlice';
import { loadGamification } from '../src/features/gamification/gamificationSlice';
import { SplashScreen } from '../src/core/presentation/components/SplashScreen';
import { COLORS } from '../src/core/common/constants';

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Load all persisted data
      const result = await dispatch(loadOnboardingStatus()).unwrap();
      await dispatch(loadTransactions());
      await dispatch(loadGamification());
      
      setOnboardingComplete(result.isComplete);
    } catch (error) {
      console.error('Failed to initialize app:', error);
      setOnboardingComplete(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Navigate based on onboarding status
    setTimeout(() => {
      if (onboardingComplete) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }, 100);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Loading state while navigating
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
