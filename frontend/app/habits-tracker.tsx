// Habits Tracker Screen
// Track daily habits like steps and water intake with Redux persistence

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { Card } from '../src/core/presentation/components/Card';
import { CircularProgress } from '../src/core/presentation/components/CircularProgress';
import { RootState, AppDispatch } from '../src/store';
import {
  initTodayHabits,
  updateSteps,
  updateWater,
  updateMindful,
  updateGoal,
  saveHabits,
  loadHabits,
  selectTodayHabits,
  selectDefaultGoals,
  selectAllTimeStats,
} from '../src/features/habits/habitsSlice';
import {
  isPedometerAvailable,
  getPedometerPermission,
  getTodaySteps,
  getPedometerNotes,
} from '../src/core/services/pedometerService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function HabitsTrackerScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const todayHabits = useSelector(selectTodayHabits);
  const defaultGoals = useSelector(selectDefaultGoals);
  const allTimeStats = useSelector(selectAllTimeStats);
  
  // Pedometer state
  const [pedometerAvailable, setPedometerAvailable] = useState(false);
  const [autoStepsEnabled, setAutoStepsEnabled] = useState(false);
  
  const [animatedValues] = useState({
    steps: new Animated.Value(0),
    water: new Animated.Value(0),
    mindful: new Animated.Value(0),
  });

  // Initialize habits on mount
  useEffect(() => {
    dispatch(loadHabits()).then(() => {
      dispatch(initTodayHabits());
    });
    checkPedometer();
  }, []);

  // Save habits when they change
  useEffect(() => {
    if (todayHabits) {
      dispatch(saveHabits());
    }
  }, [todayHabits]);
  
  // Check pedometer availability
  const checkPedometer = async () => {
    const available = await isPedometerAvailable();
    setPedometerAvailable(available);
  };
  
  // Enable auto step tracking
  const enableAutoSteps = async () => {
    const hasPermission = await getPedometerPermission();
    if (hasPermission) {
      setAutoStepsEnabled(true);
      const steps = await getTodaySteps();
      if (steps > 0) {
        dispatch(updateSteps({ steps, isAbsolute: true }));
      }
      Alert.alert('Auto Steps Enabled', 'Your steps will be synced automatically from your device.');
    } else {
      Alert.alert('Permission Required', getPedometerNotes());
    }
  };
  
  // Sync steps from pedometer
  const syncSteps = async () => {
    if (!pedometerAvailable) {
      Alert.alert('Not Available', 'Step tracking requires a development build with expo-sensors.');
      return;
    }
    const steps = await getTodaySteps();
    dispatch(updateSteps({ steps, isAbsolute: true }));
    Alert.alert('Steps Synced', `Today's steps: ${steps.toLocaleString()}`);
  };
  
  // Get current values (from Redux or defaults)
  const habits = todayHabits || {
    steps: 0,
    stepsGoal: defaultGoals.steps,
    water: 0,
    waterGoal: defaultGoals.water,
    mindfulMinutes: 0,
    mindfulGoal: defaultGoals.mindful,
  };

  // Animate progress on mount
  useEffect(() => {
    const animateProgress = () => {
      Animated.parallel([
        Animated.spring(animatedValues.steps, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValues.water, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(animatedValues.mindful, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    };
    animateProgress();
  }, []);

  // Redux dispatch handlers
  const handleUpdateSteps = (delta: number) => {
    dispatch(updateSteps({ steps: delta }));
  };

  const handleUpdateWater = (delta: number) => {
    dispatch(updateWater({ glasses: delta }));
  };

  const handleUpdateMindful = (delta: number) => {
    dispatch(updateMindful({ minutes: delta }));
  };

  const handleUpdateGoal = (type: 'steps' | 'water' | 'mindful', delta: number) => {
    const currentValue = type === 'steps' ? habits.stepsGoal : 
                         type === 'water' ? habits.waterGoal : habits.mindfulGoal;
    dispatch(updateGoal({ type, value: currentValue + delta }));
  };

  const getStepsPercentage = () => Math.min(100, (habits.steps / habits.stepsGoal) * 100);
  const getWaterPercentage = () => Math.min(100, (habits.water / habits.waterGoal) * 100);
  const getMindfulPercentage = () => Math.min(100, (habits.mindfulMinutes / habits.mindfulGoal) * 100);

  const HabitCounter = ({ 
    value, 
    label, 
    onDecrease, 
    onIncrease,
    step = 1,
    unit = '',
  }: {
    value: number;
    label: string;
    onDecrease: () => void;
    onIncrease: () => void;
    step?: number;
    unit?: string;
  }) => (
    <View style={styles.counterContainer}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity 
          style={styles.counterButton}
          onPress={onDecrease}
          activeOpacity={0.7}
        >
          <Ionicons name="remove" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.counterValueContainer}>
          <Text style={styles.counterValue}>{value.toLocaleString()}</Text>
          {unit && <Text style={styles.counterUnit}>{unit}</Text>}
        </View>
        
        <TouchableOpacity 
          style={[styles.counterButton, styles.counterButtonPrimary]}
          onPress={onIncrease}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} data-testid="habits-tracker-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="habits-tracker-back-btn">
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habits Tracker</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Today's Progress</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>
          
          <View style={styles.ringsRow}>
            <Animated.View style={[styles.ringItem, { opacity: animatedValues.steps }]}>
              <CircularProgress
                size={80}
                strokeWidth={6}
                percentage={getStepsPercentage()}
                color={COLORS.habitBlue}
                icon="👟"
              />
              <Text style={styles.ringLabel}>Steps</Text>
            </Animated.View>
            
            <Animated.View style={[styles.ringItem, { opacity: animatedValues.water }]}>
              <CircularProgress
                size={80}
                strokeWidth={6}
                percentage={getWaterPercentage()}
                color={COLORS.habitCyan}
                icon="💧"
              />
              <Text style={styles.ringLabel}>Water</Text>
            </Animated.View>
            
            <Animated.View style={[styles.ringItem, { opacity: animatedValues.mindful }]}>
              <CircularProgress
                size={80}
                strokeWidth={6}
                percentage={getMindfulPercentage()}
                color={COLORS.habitPurple}
                icon="🧘"
              />
              <Text style={styles.ringLabel}>Mindful</Text>
            </Animated.View>
          </View>
        </Card>

        {/* Steps Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: COLORS.habitBlue + '20' }]}>
              <Text style={styles.sectionEmoji}>👟</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Steps</Text>
              <Text style={styles.sectionSubtitle}>
                Goal: {habits.stepsGoal.toLocaleString()} steps
              </Text>
            </View>
          </View>
          
          <Card style={styles.trackerCard}>
            <HabitCounter
              value={habits.steps}
              label="Today's Steps"
              onDecrease={() => handleUpdateSteps(-100)}
              onIncrease={() => handleUpdateSteps(100)}
              step={100}
              unit="steps"
            />
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getStepsPercentage()}%`, backgroundColor: COLORS.habitBlue }
                ]} 
              />
            </View>
            
            <View style={styles.quickButtons}>
              {pedometerAvailable && (
                <TouchableOpacity 
                  style={[styles.quickButton, styles.syncButton]}
                  onPress={syncSteps}
                >
                  <Ionicons name="sync" size={14} color={COLORS.habitBlue} />
                  <Text style={[styles.quickButtonText, { color: COLORS.habitBlue }]}>Sync</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => handleUpdateSteps(500)}
              >
                <Text style={styles.quickButtonText}>+500</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => handleUpdateSteps(1000)}
              >
                <Text style={styles.quickButtonText}>+1,000</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => handleUpdateSteps(5000)}
              >
                <Text style={styles.quickButtonText}>+5,000</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.goalAdjust}
              onPress={() => {
                Alert.alert(
                  'Adjust Steps Goal',
                  `Current goal: ${habits.stepsGoal.toLocaleString()}`,
                  [
                    { text: '-1,000', onPress: () => handleUpdateGoal('steps', -1000) },
                    { text: '+1,000', onPress: () => handleUpdateGoal('steps', 1000) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Ionicons name="settings-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.goalAdjustText}>Adjust Goal</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Water Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: COLORS.habitCyan + '20' }]}>
              <Text style={styles.sectionEmoji}>💧</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Water Intake</Text>
              <Text style={styles.sectionSubtitle}>
                Goal: {habits.waterGoal} glasses (250ml each)
              </Text>
            </View>
          </View>
          
          <Card style={styles.trackerCard}>
            <HabitCounter
              value={habits.water}
              label="Glasses Today"
              onDecrease={() => handleUpdateWater(-1)}
              onIncrease={() => handleUpdateWater(1)}
              unit="glasses"
            />
            
            {/* Water Visual */}
            <View style={styles.waterVisual}>
              {Array.from({ length: habits.waterGoal }).map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.waterGlass,
                    index < habits.water && styles.waterGlassFilled,
                  ]}
                  onPress={() => dispatch(updateWater({ glasses: index + 1 - habits.water }))}
                >
                  <Text style={styles.waterIcon}>
                    {index < habits.water ? '💧' : '⚪'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={styles.goalAdjust}
              onPress={() => {
                Alert.alert(
                  'Adjust Water Goal',
                  `Current goal: ${habits.waterGoal} glasses`,
                  [
                    { text: '-1', onPress: () => handleUpdateGoal('water', -1) },
                    { text: '+1', onPress: () => handleUpdateGoal('water', 1) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Ionicons name="settings-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.goalAdjustText}>Adjust Goal</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Mindful Minutes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: COLORS.habitPurple + '20' }]}>
              <Text style={styles.sectionEmoji}>🧘</Text>
            </View>
            <View>
              <Text style={styles.sectionTitle}>Mindful Minutes</Text>
              <Text style={styles.sectionSubtitle}>
                Goal: {habits.mindfulGoal} minutes
              </Text>
            </View>
          </View>
          
          <Card style={styles.trackerCard}>
            <HabitCounter
              value={habits.mindfulMinutes}
              label="Minutes Today"
              onDecrease={() => handleUpdateMindful(-5)}
              onIncrease={() => handleUpdateMindful(5)}
              step={5}
              unit="min"
            />
            
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${getMindfulPercentage()}%`, backgroundColor: COLORS.habitPurple }
                ]} 
              />
            </View>
            
            <View style={styles.quickButtons}>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => updateMindful(5)}
              >
                <Text style={styles.quickButtonText}>+5 min</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => updateMindful(10)}
              >
                <Text style={styles.quickButtonText}>+10 min</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => updateMindful(15)}
              >
                <Text style={styles.quickButtonText}>+15 min</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.goalAdjust}
              onPress={() => {
                Alert.alert(
                  'Adjust Mindful Goal',
                  `Current goal: ${habits.mindfulGoal} minutes`,
                  [
                    { text: '-5', onPress: () => updateGoal('mindful', -5) },
                    { text: '+5', onPress: () => updateGoal('mindful', 5) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
            >
              <Ionicons name="settings-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.goalAdjustText}>Adjust Goal</Text>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Tip Card */}
        <Card style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color={COLORS.warning} />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Pro Tip</Text>
            <Text style={styles.tipText}>
              Tracking multiple habits together increases your chance of maintaining them. Start small and build up!
            </Text>
          </View>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  summaryCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  dateBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  ringItem: {
    alignItems: 'center',
  },
  ringLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  trackerCard: {
    padding: SPACING.lg,
  },
  counterContainer: {
    marginBottom: SPACING.lg,
  },
  counterLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  counterButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  counterValueContainer: {
    alignItems: 'center',
    minWidth: 120,
    marginHorizontal: SPACING.lg,
  },
  counterValue: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  counterUnit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  quickButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  goalAdjust: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  goalAdjustText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  waterVisual: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  waterGlass: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  waterGlassFilled: {
    backgroundColor: COLORS.habitCyan + '30',
    borderColor: COLORS.habitCyan,
  },
  waterIcon: {
    fontSize: 20,
  },
  tipCard: {
    padding: SPACING.lg,
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '10',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
