// 💬 NudgeCard Component - Displays contextual nudges
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { SelectedNudge, NudgeTone } from '../../common/nudgeEngine';
import { Card } from './Card';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../common/constants';

interface NudgeCardProps {
  nudge: SelectedNudge;
  onDismiss?: () => void;
  variant?: 'card' | 'banner' | 'toast';
}

const TONE_STYLES: Record<NudgeTone, {
  gradient: [string, string];
  icon: string;
  iconColor: string;
}> = {
  witty: {
    gradient: [COLORS.primary + '15', COLORS.primary + '05'],
    icon: 'sparkles',
    iconColor: COLORS.primary,
  },
  sarcastic: {
    gradient: [COLORS.habitOrange + '15', COLORS.habitOrange + '05'],
    icon: 'alert-circle',
    iconColor: COLORS.habitOrange,
  },
  appreciative: {
    gradient: [COLORS.success + '15', COLORS.success + '05'],
    icon: 'heart',
    iconColor: COLORS.success,
  },
  motivational: {
    gradient: [COLORS.habitPurple + '15', COLORS.habitPurple + '05'],
    icon: 'flame',
    iconColor: COLORS.habitPurple,
  },
  educational: {
    gradient: [COLORS.habitCyan + '15', COLORS.habitCyan + '05'],
    icon: 'bulb',
    iconColor: COLORS.habitCyan,
  },
};

export function NudgeCard({ nudge, onDismiss, variant = 'card' }: NudgeCardProps) {
  const router = useRouter();
  const toneStyle = TONE_STYLES[nudge.tone];

  const handleAction = () => {
    if (nudge.action?.route) {
      router.push(nudge.action.route as any);
    }
  };

  if (variant === 'toast') {
    return (
      <View style={styles.toastContainer}>
        <View style={[styles.toastIcon, { backgroundColor: toneStyle.iconColor + '20' }]}>
          {nudge.emoji ? (
            <Text style={styles.emoji}>{nudge.emoji}</Text>
          ) : (
            <Ionicons name={toneStyle.icon as any} size={20} color={toneStyle.iconColor} />
          )}
        </View>
        <View style={styles.toastContent}>
          <Text style={styles.toastMessage}>{nudge.personalizedMessage}</Text>
          {nudge.personalizedSubtext && (
            <Text style={styles.toastSubtext}>{nudge.personalizedSubtext}</Text>
          )}
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.toastDismiss}>
            <Ionicons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === 'banner') {
    return (
      <LinearGradient
        colors={toneStyle.gradient}
        style={styles.bannerContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.bannerLeft}>
          {nudge.emoji ? (
            <Text style={styles.bannerEmoji}>{nudge.emoji}</Text>
          ) : (
            <Ionicons name={toneStyle.icon as any} size={24} color={toneStyle.iconColor} />
          )}
        </View>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerMessage}>{nudge.personalizedMessage}</Text>
        </View>
        {nudge.action && (
          <TouchableOpacity onPress={handleAction} style={styles.bannerAction}>
            <Text style={[styles.bannerActionText, { color: toneStyle.iconColor }]}>
              {nudge.action.label}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={toneStyle.iconColor} />
          </TouchableOpacity>
        )}
      </LinearGradient>
    );
  }

  // Default card variant
  return (
    <Card style={styles.cardContainer}>
      <LinearGradient
        colors={toneStyle.gradient}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIcon, { backgroundColor: toneStyle.iconColor + '20' }]}>
            {nudge.emoji ? (
              <Text style={styles.cardEmoji}>{nudge.emoji}</Text>
            ) : (
              <Ionicons name={toneStyle.icon as any} size={28} color={toneStyle.iconColor} />
            )}
          </View>
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
              <Ionicons name="close" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.cardMessage}>{nudge.personalizedMessage}</Text>
        
        {nudge.personalizedSubtext && (
          <Text style={styles.cardSubtext}>{nudge.personalizedSubtext}</Text>
        )}
        
        {nudge.action && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: toneStyle.iconColor }]}
            onPress={handleAction}
          >
            <Text style={styles.actionButtonText}>{nudge.action.label}</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  // Toast Variant
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toastIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  toastContent: {
    flex: 1,
  },
  toastMessage: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  toastSubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  toastDismiss: {
    padding: SPACING.sm,
  },
  emoji: {
    fontSize: 20,
  },

  // Banner Variant
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  bannerLeft: {
    marginRight: SPACING.md,
  },
  bannerEmoji: {
    fontSize: 24,
  },
  bannerContent: {
    flex: 1,
  },
  bannerMessage: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerActionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Card Variant
  cardContainer: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEmoji: {
    fontSize: 28,
  },
  dismissButton: {
    padding: SPACING.sm,
  },
  cardMessage: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 26,
  },
  cardSubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
});
