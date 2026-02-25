// Companion Avatar Component
// Displays animated Lottie character with fallback to emoji

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COMPANIONS, getCompanion, getDefaultCompanion } from '../../common/companions';
import { COLORS, BORDER_RADIUS } from '../../common/constants';

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

  // Always use emoji fallback for simplicity and web compatibility
  // Lottie can be enabled on native in future with proper setup
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
