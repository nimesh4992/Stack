// 🎨 Privacy Pledge Splash Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../common/constants';

// Privacy slides
const SLIDES = [
  {
    icon: 'shield-checkmark',
    iconColor: '#4ECDC4',
    title: 'Your Data,',
    titleHighlight: 'Your Control',
    description: 'Everything stays on your phone. No cloud, no tracking, just progress.',
  },
  {
    icon: 'lock-closed',
    iconColor: '#7C3AED',
    title: 'Bank-Level',
    titleHighlight: 'Privacy',
    description: 'Your financial data is encrypted and never leaves your device.',
  },
  {
    icon: 'rocket',
    iconColor: '#FF6B6B',
    title: 'Build Habits,',
    titleHighlight: 'Build Wealth',
    description: 'Smart nudges, gamified tracking, and insights that help you save.',
  },
];

interface Props {
  onComplete: () => void;
}

export function PrivacyPledgeScreen({ onComplete }: Props) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];

  const next = () => {
    if (slide < SLIDES.length - 1) setSlide(slide + 1);
    else onComplete();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Skip */}
        <TouchableOpacity style={styles.skip} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card */}
          <View style={styles.card}>
            <View style={[styles.glow, { backgroundColor: current.iconColor }]} />
            <View style={[styles.iconBg, { backgroundColor: current.iconColor + '30' }]}>
              <Ionicons name={current.icon as any} size={56} color={current.iconColor} />
            </View>
            <View style={styles.badge}>
              <Ionicons name="lock-closed" size={14} color="#FFF" />
            </View>
          </View>

          {/* Text */}
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.highlight}>{current.titleHighlight}</Text>
          <Text style={styles.desc}>{current.description}</Text>

          {/* Dots */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === slide && styles.dotActive]} />
            ))}
          </View>
        </ScrollView>

        {/* Button */}
        <View style={styles.btnWrap}>
          <TouchableOpacity onPress={next} activeOpacity={0.9}>
            <LinearGradient
              colors={[COLORS.primary, '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btn}
            >
              <Text style={styles.btnText}>
                {slide === SLIDES.length - 1 ? 'Start Your Journey' : 'Continue'}
              </Text>
              <Ionicons
                name={slide === SLIDES.length - 1 ? 'flash' : 'arrow-forward'}
                size={20}
                color="#FFF"
              />
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.encrypted}>
            <Ionicons name="globe-outline" size={12} color="#666" />
            <Text style={styles.encText}>END-TO-END ENCRYPTED</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  safeArea: {
    flex: 1,
  },
  skip: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 20,
  },
  card: {
    width: 300,
    height: 200,
    backgroundColor: '#2A2A4A',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    bottom: -30,
    width: 150,
    height: 80,
    borderRadius: 75,
    opacity: 0.4,
  },
  iconBg: {
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  highlight: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  btnWrap: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 32,
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: 300,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  encrypted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  encText: {
    fontSize: 11,
    color: '#666',
    letterSpacing: 1,
    fontWeight: '600',
  },
});

export default PrivacyPledgeScreen;
