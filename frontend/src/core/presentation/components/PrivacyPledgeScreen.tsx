// 🎨 Privacy Pledge Splash Screen - Beautiful Redesign
// Matches "The Dojo" design aesthetic with privacy-first messaging

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../common/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Privacy slides content
const SLIDES = [
  {
    id: 1,
    icon: 'shield-checkmark',
    iconColor: '#4ECDC4',
    title: 'Your Data,',
    titleHighlight: 'Your Control',
    description: 'Everything stays on your phone. No cloud, no tracking, just progress.',
    badge: 'shield',
  },
  {
    id: 2,
    icon: 'lock-closed',
    iconColor: '#7C3AED',
    title: 'Bank-Level',
    titleHighlight: 'Privacy',
    description: 'Your financial data is encrypted and never leaves your device. Period.',
    badge: 'lock-closed',
  },
  {
    id: 3,
    icon: 'rocket',
    iconColor: '#FF6B6B',
    title: 'Build Habits,',
    titleHighlight: 'Build Wealth',
    description: 'Smart nudges, gamified tracking, and insights that help you save more.',
    badge: 'sparkles',
  },
];

interface PrivacyPledgeScreenProps {
  onComplete: () => void;
}

export function PrivacyPledgeScreen({ onComplete }: PrivacyPledgeScreenProps) {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current; // Start visible
  const scaleAnim = useRef(new Animated.Value(1)).current; // Start at full scale
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Glow animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentContent = SLIDES[currentSlide];
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Dark Card with Icon */}
        <View style={styles.cardContainer}>
          <View style={styles.darkCard}>
            {/* Glow Effect */}
            <Animated.View
              style={[
                styles.glowEffect,
                {
                  opacity: glowOpacity,
                  backgroundColor: currentContent.iconColor,
                },
              ]}
            />

            {/* Shield Icon */}
            <View style={styles.iconWrapper}>
              <View style={[styles.iconCircle, { backgroundColor: currentContent.iconColor + '30' }]}>
                <Ionicons
                  name={currentContent.icon as any}
                  size={64}
                  color={currentContent.iconColor}
                />
              </View>
              {/* Keyhole for shield */}
              {currentContent.icon === 'shield-checkmark' && (
                <View style={styles.keyhole}>
                  <View style={styles.keyholeCircle} />
                  <View style={styles.keyholeRect} />
                </View>
              )}
            </View>

            {/* Badge */}
            <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
              <Ionicons name={currentContent.badge as any} size={16} color="#FFFFFF" />
            </View>
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {currentContent.title}
          </Text>
          <Text style={[styles.titleHighlight, { color: COLORS.primary }]}>
            {currentContent.titleHighlight}
          </Text>
          <Text style={styles.description}>
            {currentContent.description}
          </Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </Animated.View>

      {/* CTA Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>
              {currentSlide === SLIDES.length - 1 ? 'Start Your Journey' : 'Continue'}
            </Text>
            <Ionicons
              name={currentSlide === SLIDES.length - 1 ? 'flash' : 'arrow-forward'}
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Encryption Badge */}
        <View style={styles.encryptionBadge}>
          <Ionicons name="globe-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.encryptionText}>END-TO-END ENCRYPTED</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A', // Dark background for splash
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: SPACING.lg,
    zIndex: 10,
    padding: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 60,
    paddingBottom: 20,
  },
  cardContainer: {
    width: SCREEN_WIDTH - SPACING.xl * 2,
    height: 200,
    marginBottom: SPACING.lg,
  },
  darkCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  glowEffect: {
    position: 'absolute',
    bottom: -50,
    width: 200,
    height: 100,
    borderRadius: 100,
    // Blur effect simulation
    transform: [{ scaleX: 2 }],
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyhole: {
    position: 'absolute',
    alignItems: 'center',
  },
  keyholeCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    marginTop: 30,
  },
  keyholeRect: {
    width: 8,
    height: 16,
    backgroundColor: '#1A1A2E',
    marginTop: -2,
  },
  badge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.sm,
  },
  pagination: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  ctaText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  encryptionText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
    letterSpacing: 1,
    fontWeight: FONT_WEIGHT.semibold,
  },
});

export default PrivacyPledgeScreen;
