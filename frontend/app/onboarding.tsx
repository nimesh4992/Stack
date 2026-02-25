// 🎯 Onboarding Quiz Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';
import { AppDispatch, RootState } from '../src/store';
import { setQuizAnswer, completeOnboarding } from '../src/features/onboarding/onboardingSlice';
import { awardPoints } from '../src/features/gamification/gamificationSlice';
import { Button } from '../src/core/presentation/components/Button';
import { Input } from '../src/core/presentation/components/Input';
import { Card } from '../src/core/presentation/components/Card';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, QUIZ_QUESTIONS, POINTS } from '../src/core/common/constants';

export default function OnboardingScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentStep, quizAnswers } = useSelector((state: RootState) => state.onboarding);
  
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentStep];
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;

  const handleOptionSelect = (optionId: string) => {
    if (currentStep === 0) {
      dispatch(setQuizAnswer({ personality: optionId as any }));
    } else if (currentStep === 1) {
      dispatch(setQuizAnswer({ goal: optionId as any }));
    }
    
    // Auto-advance for multiple choice
    if (currentStep < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        // Move to next step in parent component
      }, 300);
    }
  };

  const handleNext = async () => {
    if (isLastStep) {
      // Validate target amount
      const amount = parseInt(targetAmount);
      if (!amount || amount <= 0) {
        alert('Please enter a valid target amount');
        return;
      }
      
      setLoading(true);
      try {
        dispatch(setQuizAnswer({ target: amount }));
        
        // Complete onboarding
        await dispatch(completeOnboarding()).unwrap();
        
        // Award points for completing onboarding
        await dispatch(awardPoints(POINTS.COMPLETE_QUIZ));
        
        // Navigate to home
        router.replace('/home');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return !!quizAnswers.personality;
    if (currentStep === 1) return !!quizAnswers.goal;
    if (currentStep === 2) return targetAmount.length > 0 && parseInt(targetAmount) > 0;
    return false;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.progressContainer}>
          {QUIZ_QUESTIONS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
        <Text style={styles.headerTitle}>Let's get to know you! 👋</Text>
        <Text style={styles.headerSubtitle}>
          Step {currentStep + 1} of {QUIZ_QUESTIONS.length}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.type === 'amount' ? (
          <View style={styles.amountContainer}>
            <Input
              label="Target Savings Amount"
              placeholder={currentQuestion.placeholder}
              keyboardType="numeric"
              value={targetAmount}
              onChangeText={setTargetAmount}
              style={styles.amountInput}
            />
            <Text style={styles.amountHint}>
              Set a realistic monthly savings goal. You can always adjust this later!
            </Text>
          </View>
        ) : (
          <View style={styles.optionsContainer}>
            {currentQuestion.options?.map((option) => {
              const isSelected =
                (currentStep === 0 && quizAnswers.personality === option.id) ||
                (currentStep === 1 && quizAnswers.goal === option.id);

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleOptionSelect(option.id)}
                  activeOpacity={0.7}
                >
                  <Card
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                  >
                    <Text style={styles.optionEmoji}>{option.emoji}</Text>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Text style={styles.optionDesc}>{option.desc}</Text>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {isLastStep && (
          <Button
            title="Complete Setup"
            onPress={handleNext}
            disabled={!canProceed()}
            loading={loading}
            style={styles.nextButton}
            fullWidth
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xxl + 20,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  question: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionCard: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  optionEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  optionLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  optionDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  amountContainer: {
    gap: SPACING.md,
  },
  amountInput: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
  },
  amountHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  nextButton: {
    marginTop: SPACING.xl,
  },
});
