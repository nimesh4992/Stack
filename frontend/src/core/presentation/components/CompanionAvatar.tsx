// Companion Avatar Component
// Displays animated Lottie character with fallback to emoji

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COMPANIONS, getCompanion, getDefaultCompanion } from '../../common/companions';
import { COLORS, BORDER_RADIUS } from '../../common/constants';

// Conditional Lottie import for web compatibility
let LottieView: any = null;
if (Platform.OS !== 'web') {
  try {
    LottieView = require('lottie-react-native').default;
  } catch (e) {
    console.log('Lottie not available');
  }
}

interface CompanionAvatarProps {
  companionId: string;
  size?: 'small' | 'medium' | 'large';
  showAnimation?: boolean;
  style?: any;
}

const SIZE_MAP = {
  small: 48,
  medium: 80,
  large: 120,
};

const EMOJI_MAP: Record<string, string> = {
  bear: '🐻',
  cat: '🐱',
  robot: '🤖',
  panda: '🐼',
  fox: '🦊',
  owl: '🦉',
};

export const CompanionAvatar: React.FC<CompanionAvatarProps> = ({
  companionId,
  size = 'medium',
  showAnimation = true,
  style,
}) => {
  const companion = getCompanion(companionId) || getDefaultCompanion();
  const sizeValue = SIZE_MAP[size];
  const emojiSize = sizeValue * 0.6;

  // Web fallback - show emoji
  if (Platform.OS === 'web' || !LottieView || !showAnimation) {
    return (
      <View
        style={[
          styles.container,
          {
            width: sizeValue,
            height: sizeValue,
            backgroundColor: companion.color + '20',
            borderRadius: sizeValue / 2,
          },
          style,
        ]}
      >
        <Text style={[styles.emoji, { fontSize: emojiSize }]}>
          {EMOJI_MAP[companionId] || '🐻'}
        </Text>
      </View>
    );
  }

  // Native - show Lottie animation
  return (
    <View
      style={[
        styles.container,
        {
          width: sizeValue,
          height: sizeValue,
          backgroundColor: companion.color + '15',
          borderRadius: sizeValue / 2,
        },
        style,
      ]}
    >
      <LottieView
        source={companion.lottieSource}
        autoPlay
        loop
        style={{
          width: sizeValue * 0.85,
          height: sizeValue * 0.85,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
});

export default CompanionAvatar;
