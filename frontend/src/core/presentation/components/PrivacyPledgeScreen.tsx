// 🎨 Privacy Pledge Splash Screen - Beautiful Redesign
// Matches "The Dojo" design aesthetic with privacy-first messaging

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
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
  },
  {
    id: 2,
    icon: 'lock-closed',
    iconColor: '#7C3AED',
    title: 'Bank-Level',
    titleHighlight: 'Privacy',
    description: 'Your financial data is encrypted and never leaves your device. Period.',
  },
  {
    id: 3,
    icon: 'rocket',
    iconColor: '#FF6B6B',
    title: 'Build Habits,',
    titleHighlight: 'Build Wealth',
    description: 'Smart nudges, gamified tracking, and insights that help you save more.',
  },
];

interface PrivacyPledgeScreenProps {
  onComplete: () => void;
}

export function PrivacyPledgeScreen({ onComplete }: PrivacyPledgeScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const currentContent = SLIDES[currentSlide];

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Dark Card with Icon */}
        <View style={styles.darkCard}>
          {/* Glow Effect */}
          <View style={[styles.glowEffect, { backgroundColor: currentContent.iconColor }]} />
          
          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: currentContent.iconColor + '30' }]}>
            <Ionicons
              name={currentContent.icon as any}
              size={56}
              color={currentContent.iconColor}
            />
          </View>
          
          {/* Badge */}
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={14} color="#FFFFFF" />
          </View>
        </View>

        {/* Text Content */}
        <View style={[styles.textContainer, { backgroundColor: 'red' }]}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' }}>
            {currentContent.title}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#4F46E5', textAlign: 'center', marginBottom: 12 }}>
            {currentContent.titleHighlight}
          </Text>
          <Text style={{ fontSize: 16, color: '#AAAAAA', textAlign: 'center', lineHeight: 24 }}>
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
      </View>

      {/* CTA Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.ctaButton} onPress={handleNext} activeOpacity={0.9}>
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
          <Ionicons name="globe-outline" size={14} color="#888888" />
          <Text style={styles.encryptionText}>END-TO-END ENCRYPTED</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  darkCard: {
    width: SCREEN_WIDTH - 48,
    height: 200,
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 32,
  },
  glowEffect: {
    position: 'absolute',
    bottom: -30,
    width: 150,
    height: 80,
    borderRadius: 75,
    opacity: 0.4,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333344',
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: 16,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  encryptionText: {
    fontSize: 12,
    color: '#666666',
    letterSpacing: 1,
    fontWeight: '600',
  },
});

export default PrivacyPledgeScreen;
