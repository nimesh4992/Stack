// 🎨 Privacy Pledge Splash Screen - Clean White Design
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
import { COLORS } from '../../common/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Privacy slides
const SLIDES = [
  {
    icon: 'shield-checkmark',
    iconColor: '#10B981',
    badgeIcon: 'lock-closed',
    title: 'Your Data,',
    titleHighlight: 'Your Control',
    description: 'Everything stays on your phone. No cloud, no tracking, just progress.',
  },
  {
    icon: 'lock-closed',
    iconColor: '#8B5CF6',
    badgeIcon: 'shield',
    title: 'Bank-Level',
    titleHighlight: 'Privacy',
    description: 'Your financial data is encrypted and never leaves your device. Period.',
  },
  {
    icon: 'rocket',
    iconColor: '#F59E0B',
    badgeIcon: 'star',
    title: 'Build Habits,',
    titleHighlight: 'Build Wealth',
    description: 'Smart nudges, gamified tracking, and insights that help you save more.',
  },
];

interface Props {
  onComplete: () => void;
}

export function PrivacyPledgeScreen({ onComplete }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const current = SLIDES[currentSlide];

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Pledge</Text>
        <TouchableOpacity style={styles.skipButton} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Dark Card */}
        <View style={styles.card}>
          {/* Glow Effect */}
          <View style={[styles.glow, { backgroundColor: current.iconColor }]} />
          
          {/* Main Icon */}
          <View style={[styles.iconContainer, { backgroundColor: current.iconColor + '20' }]}>
            <Ionicons name={current.icon as any} size={64} color={current.iconColor} />
            {/* Keyhole decoration for shield */}
            {current.icon === 'shield-checkmark' && (
              <View style={styles.keyhole}>
                <View style={styles.keyholeTop} />
                <View style={styles.keyholeBottom} />
              </View>
            )}
          </View>

          {/* Badge */}
          <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
            <Ionicons name={current.badgeIcon as any} size={16} color="#FFFFFF" />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={[styles.titleHighlight, { color: COLORS.primary }]}>
            {current.titleHighlight}
          </Text>
          <Text style={styles.description}>{current.description}</Text>
        </View>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentSlide(index)}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleNext}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4F46E5', '#6366F1']}
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
          <Ionicons name="globe-outline" size={14} color="#9CA3AF" />
          <Text style={styles.encryptionText}>END-TO-END ENCRYPTED</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: SCREEN_WIDTH - 48,
    height: 220,
    backgroundColor: '#1E1E2D',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    // Shadow for Android
    elevation: 12,
  },
  glow: {
    position: 'absolute',
    bottom: -40,
    width: 180,
    height: 100,
    borderRadius: 100,
    opacity: 0.5,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyhole: {
    position: 'absolute',
    alignItems: 'center',
    top: 52,
  },
  keyholeTop: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E1E2D',
  },
  keyholeBottom: {
    width: 8,
    height: 14,
    backgroundColor: '#1E1E2D',
    marginTop: -3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  titleHighlight: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.primary,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 32,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    marginBottom: 20,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  encryptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  encryptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginLeft: 6,
  },
});

export default PrivacyPledgeScreen;
