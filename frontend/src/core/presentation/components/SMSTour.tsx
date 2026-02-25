// SMS Tour Overlay Component
// Simple 2-3 step tutorial for SMS import feature

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../core/common/constants';

interface SMSTourProps {
  visible: boolean;
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    icon: 'chatbubble-ellipses',
    title: 'Auto-Detect Bank SMS',
    description: 'HabitFinance can read your bank SMS messages to automatically detect and log transactions. No typing needed!',
    color: COLORS.habitCyan,
  },
  {
    icon: 'shield-checkmark',
    title: 'Your Data Stays Private',
    description: "SMS data is processed 100% on your device. Nothing is sent to any server. Your financial info remains yours.",
    color: COLORS.success,
  },
  {
    icon: 'options',
    title: 'You Control Everything',
    description: 'Choose between auto-logging or manual confirmation for each transaction. Enable/disable anytime from Settings.',
    color: COLORS.primary,
  },
];

export const SMSTour: React.FC<SMSTourProps> = ({ visible, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setCurrentStep(0);
      onComplete();
    });
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = TOUR_STEPS[currentStep];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleSkip}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.card}>
          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: step.color + '20' }]}>
            <Ionicons name={step.icon as any} size={48} color={step.color} />
          </View>

          {/* Content */}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {/* Progress Dots */}
          <View style={styles.progressDots}>
            {TOUR_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                  index === currentStep && { backgroundColor: step.color },
                ]}
              />
            ))}
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: step.color }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep < TOUR_STEPS.length - 1 ? 'Next' : 'Got It!'}
            </Text>
            <Ionicons
              name={currentStep < TOUR_STEPS.length - 1 ? 'arrow-forward' : 'checkmark'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Step Counter */}
          <Text style={styles.stepCounter}>
            {currentStep + 1} of {TOUR_STEPS.length}
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: Math.min(width - SPACING.xl * 2, 360),
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  skipButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  progressDots: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.sm,
    minWidth: 160,
  },
  nextButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  stepCounter: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    marginTop: SPACING.md,
  },
});

export default SMSTour;
