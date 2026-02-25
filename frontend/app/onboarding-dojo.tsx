// 🎯 Onboarding Screen (The Dojo Style - Goal Setter)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../src/store';
import { setQuizAnswer, completeOnboarding } from '../src/features/onboarding/onboardingSlice';
import { awardPoints } from '../src/features/gamification/gamificationSlice';
import { Button } from '../src/core/presentation/components/Button';
import { Input } from '../src/core/presentation/components/Input';
import { Card } from '../src/core/presentation/components/Card';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS, POINTS } from '../src/core/common/constants';

// Goal options with visual appeal
const FINANCIAL_GOALS = [
  {
    id: 'save',
    title: 'Emergency Fund',
    description: '6 months of safety cushion',
    emoji: '🛡️',
    gradient: ['#00D4AA', '#00A389'],
  },
  {
    id: 'reduce',
    title: 'Cut Expenses',
    description: 'Trim unnecessary spending',
    emoji: '✂️',
    gradient: ['#FF6B6B', '#EE5A52'],
  },
  {
    id: 'invest',
    title: 'Start Investing',
    description: 'Grow wealth over time',
    emoji: '📈',
    gradient: ['#7C3AED', '#6D28D9'],
  },
  {
    id: 'debt',
    title: 'Pay Off Debt',
    description: 'Become debt-free',
    emoji: '💳',
    gradient: ['#FF9A3C', '#FF8C26'],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStep } = useSelector((state: RootState) => state.onboarding);
  
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const totalSteps = 2; // Simplified: Goal selection + Amount
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      // Step 1: Goal selected
      if (!selectedGoal) {
        alert('Please select a goal');
        return;
      }
      dispatch(setQuizAnswer({ goal: selectedGoal as any, personality: 'balanced' }));
      dispatch({ type: 'onboarding/nextStep' });
    } else if (currentStep === 1) {
      // Step 2: Amount entered, complete onboarding
      const amount = parseInt(targetAmount);
      if (!amount || amount <= 0) {
        alert('Please enter a valid target amount');
        return;
      }
      
      setLoading(true);
      try {
        dispatch(setQuizAnswer({ target: amount }));
        await dispatch(completeOnboarding()).unwrap();
        await dispatch(awardPoints(POINTS.COMPLETE_QUIZ));
        router.replace('/home');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 0) {
              dispatch({ type: 'onboarding/prevStep' });
            }
          }}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goal Setter</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>Onboarding Progress</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{currentStep + 1} of {totalSteps}</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 0 ? (
          // Step 1: Goal Selection
          <>
            <Text style={styles.question}>What are we chasing?</Text>
            <Text style={styles.subtitle}>Choose a starting point or create your own path.</Text>

            <View style={styles.goalsContainer}>
              {FINANCIAL_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  onPress={() => handleGoalSelect(goal.id)}
                  activeOpacity={0.8}
                >
                  <Card
                    style={[
                      styles.goalCard,
                      selectedGoal === goal.id && styles.goalCardSelected,
                      { borderColor: goal.gradient[0] },
                    ]}
                  >
                    <View style={styles.goalContent}>
                      <View style={styles.goalLeft}>
                        <View style={[styles.goalEmoji, { backgroundColor: goal.gradient[0] + '20' }]}>
                          <Text style={styles.goalEmojiText}>{goal.emoji}</Text>
                        </View>
                        <View style={styles.goalInfo}>
                          <Text style={styles.goalTitle}>{goal.title}</Text>
                          <Text style={styles.goalDescription}>{goal.description}</Text>
                          <View style={styles.progressBadge}>
                            <Text style={styles.progressBadgeText}>PROGRESS</Text>
                            <Text style={[styles.progressPercent, { color: goal.gradient[0] }]}>0%</Text>
                          </View>
                        </View>
                      </View>
                      {selectedGoal === goal.id && (
                        <View style={[styles.checkmark, { backgroundColor: goal.gradient[0] }]}>
                          <Text style={styles.checkmarkIcon}>✓</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}

              {/* Custom Goal Option */}
              <TouchableOpacity
                onPress={() => handleGoalSelect('custom')}
                activeOpacity={0.8}
              >
                <Card
                  style={[
                    styles.customGoalCard,
                    selectedGoal === 'custom' && styles.goalCardSelected,
                  ]}
                >
                  <View style={styles.customGoalContent}>
                    <View style={styles.customGoalIcon}>
                      <Text style={styles.customGoalIconText}>+</Text>
                    </View>
                    <View style={styles.customGoalInfo}>
                      <Text style={styles.customGoalTitle}>Custom Goal</Text>
                      <Text style={styles.customGoalSubtitle}>Define your own destiny</Text>
                    </View>
                    <Text style={styles.arrowIcon}>›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Step 2: Target Amount
          <>
            <Text style={styles.question}>Set Your Target</Text>
            <Text style={styles.subtitle}>How much do you want to save this month?</Text>

            <Card style={styles.amountCard}>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>₹</Text>
                <Input
                  placeholder="10,000"
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  style={styles.amountInput}
                  containerStyle={styles.amountInputWrapper}
                />
              </View>
              <Text style={styles.amountHint}>
                Set a realistic goal. You can always adjust this later!
              </Text>
            </Card>

            {/* Quick Amount Suggestions */}
            <View style={styles.quickAmounts}>
              {['5,000', '10,000', '15,000', '20,000'].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => setTargetAmount(amount.replace(',', ''))}
                >
                  <Text style={styles.quickAmountText}>₹{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <Button
          title={currentStep === 0 ? 'Next Step >' : 'Start Your Journey ⚡'}
          onPress={handleNext}
          disabled={currentStep === 0 ? !selectedGoal : !targetAmount}
          loading={loading}
          style={styles.nextButton}
          fullWidth
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  progressSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  progressLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  question: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  goalsContainer: {
    gap: SPACING.md,
  },
  goalCard: {
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  goalCardSelected: {
    borderWidth: 3,
    backgroundColor: COLORS.surfaceTint,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  goalEmoji: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  goalEmojiText: {
    fontSize: 32,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  goalDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  progressPercent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
  customGoalCard: {
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  customGoalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customGoalIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  customGoalIconText: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  customGoalInfo: {
    flex: 1,
  },
  customGoalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  customGoalSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  arrowIcon: {
    fontSize: 32,
    color: COLORS.textTertiary,
  },
  amountCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surfaceTint,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  amountInputWrapper: {
    flex: 1,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    padding: 0,
  },
  amountHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickAmountButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAmountText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  nextButton: {
    height: 56,
  },
});
