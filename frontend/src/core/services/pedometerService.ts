// 🦶 Pedometer Service
// Automatic step tracking using expo-pedometer

import { Platform } from 'react-native';

// Note: expo-pedometer requires a development build
// It won't work in Expo Go

let Pedometer: any = null;

// Check if pedometer is available
export const isPedometerAvailable = async (): Promise<boolean> => {
  try {
    // Dynamic import to avoid crashes in Expo Go
    const module = await import('expo-sensors');
    Pedometer = module.Pedometer;
    
    const available = await Pedometer.isAvailableAsync();
    return available;
  } catch (error) {
    console.log('Pedometer not available:', error);
    return false;
  }
};

// Get permission status
export const getPedometerPermission = async (): Promise<boolean> => {
  try {
    if (!Pedometer) {
      const module = await import('expo-sensors');
      Pedometer = module.Pedometer;
    }
    
    const { status } = await Pedometer.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.log('Permission request failed:', error);
    return false;
  }
};

// Get steps for a date range
export const getStepCount = async (startDate: Date, endDate: Date): Promise<number> => {
  try {
    if (!Pedometer) {
      const module = await import('expo-sensors');
      Pedometer = module.Pedometer;
    }
    
    const result = await Pedometer.getStepCountAsync(startDate, endDate);
    return result.steps;
  } catch (error) {
    console.log('Error getting step count:', error);
    return 0;
  }
};

// Get today's steps
export const getTodaySteps = async (): Promise<number> => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return getStepCount(startOfDay, now);
};

// Subscribe to step updates (real-time)
export const subscribeToSteps = (
  callback: (steps: number) => void
): (() => void) | null => {
  try {
    if (!Pedometer) {
      console.log('Pedometer not loaded');
      return null;
    }
    
    const subscription = Pedometer.watchStepCount((result: { steps: number }) => {
      callback(result.steps);
    });
    
    return () => subscription.remove();
  } catch (error) {
    console.log('Error subscribing to steps:', error);
    return null;
  }
};

// Get weekly steps data
export const getWeeklySteps = async (): Promise<{ date: string; steps: number }[]> => {
  const weekData: { date: string; steps: number }[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
    
    const steps = await getStepCount(startOfDay, endOfDay);
    
    weekData.push({
      date: startOfDay.toISOString().split('T')[0],
      steps,
    });
  }
  
  return weekData;
};

// Platform-specific notes
export const getPedometerNotes = (): string => {
  if (Platform.OS === 'ios') {
    return 'Step tracking uses Apple HealthKit. Make sure to grant Health permissions in Settings.';
  } else if (Platform.OS === 'android') {
    return 'Step tracking uses Google Fit or device sensors. Make sure to grant Activity Recognition permission.';
  }
  return 'Step tracking is not available on web.';
};
