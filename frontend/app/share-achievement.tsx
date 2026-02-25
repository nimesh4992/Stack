// Share Achievement Screen
// Display and share achievements on social media

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../src/store';
import { selectPreferences } from '../src/features/userPreferences/userPreferencesSlice';
import { Card } from '../src/core/presentation/components/Card';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { getCompanion } from '../src/core/common/companions';
import {
  shareAchievement,
  createStreakAchievement,
  createLevelAchievement,
  createSavingsAchievement,
  createBadgeAchievement,
  createChallengeAchievement,
  ShareableAchievement,
} from '../src/core/services/socialService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function ShareAchievementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const preferences = useSelector(selectPreferences);
  const gamification = useSelector((state: RootState) => state.gamification);
  
  const [sharing, setSharing] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<ShareableAchievement | null>(null);
  
  const companion = getCompanion(preferences.companionId);
  
  // Build list of shareable achievements
  const achievements: ShareableAchievement[] = [
    // Current Streak
    ...(gamification.currentStreak > 0 ? [
      createStreakAchievement(gamification.currentStreak)
    ] : []),
    
    // Current Level
    createLevelAchievement(gamification.level),
    
    // Badges
    ...gamification.badges.map(badge => 
      createBadgeAchievement({
        id: badge,
        name: getBadgeName(badge),
        description: getBadgeDescription(badge),
      })
    ),
    
    // Longest Streak
    ...(gamification.longestStreak > gamification.currentStreak ? [
      {
        type: 'milestone' as const,
        title: `${gamification.longestStreak}-Day Best Streak`,
        description: `Personal record of ${gamification.longestStreak} consecutive days!`,
        value: gamification.longestStreak,
        icon: '🏆',
        color: '#FFD700',
      }
    ] : []),
    
    // Total Transactions
    ...(gamification.totalTransactions >= 10 ? [
      {
        type: 'milestone' as const,
        title: `${gamification.totalTransactions} Transactions Logged`,
        description: `Tracked ${gamification.totalTransactions} expenses and counting!`,
        value: gamification.totalTransactions,
        icon: '📊',
        color: '#5856D6',
      }
    ] : []),
    
    // XP Milestone
    ...(gamification.points >= 100 ? [
      {
        type: 'milestone' as const,
        title: `${gamification.points.toLocaleString()} XP Earned`,
        description: `Building financial habits, one point at a time!`,
        value: gamification.points,
        icon: '⭐',
        color: '#FF9500',
      }
    ] : []),
  ];
  
  const handleShare = async (achievement: ShareableAchievement) => {
    setSharing(true);
    setSelectedAchievement(achievement);
    
    try {
      const result = await shareAchievement(achievement);
      
      if (result.success) {
        Alert.alert(
          '🎉 Shared!',
          'Your achievement has been shared. Keep up the great work!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
      setSelectedAchievement(null);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Achievement</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <CompanionAvatar companionId={preferences.companionId} size="large" />
          <Text style={styles.heroTitle}>Show Off Your Progress!</Text>
          <Text style={styles.heroSubtitle}>
            {companion?.name} is proud of you! Share your achievements with friends.
          </Text>
        </View>
        
        {/* Achievements List */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          <Text style={styles.sectionSubtitle}>Tap to share on social media</Text>
          
          {achievements.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="trophy-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>Start logging expenses to earn achievements!</Text>
            </Card>
          ) : (
            achievements.map((achievement, index) => (
              <TouchableOpacity
                key={`${achievement.type}-${index}`}
                onPress={() => handleShare(achievement)}
                disabled={sharing}
                activeOpacity={0.7}
              >
                <Card style={[
                  styles.achievementCard,
                  selectedAchievement === achievement && styles.achievementCardSelected
                ]}>
                  <View style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.color + '20' }
                  ]}>
                    <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription} numberOfLines={2}>
                      {achievement.description}
                    </Text>
                  </View>
                  <View style={[styles.shareIcon, { backgroundColor: achievement.color }]}>
                    <Ionicons 
                      name={sharing && selectedAchievement === achievement ? "hourglass" : "share-outline"} 
                      size={18} 
                      color="#FFFFFF" 
                    />
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
        </View>
        
        {/* Share All Button */}
        {achievements.length > 0 && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color={COLORS.habitOrange} />
            <Text style={styles.tipText}>
              Sharing your progress can motivate others and help you stay accountable!
            </Text>
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getBadgeName(badgeId: string): string {
  const names: Record<string, string> = {
    first_log: 'First Log',
    streak_3: '3-Day Streak',
    streak_7: 'Week Warrior',
    streak_14: 'Fortnight Fighter',
    streak_30: 'Monthly Master',
    budget_conscious: 'Budget Conscious',
    early_bird: 'Early Bird',
    night_owl: 'Night Owl',
    category_explorer: 'Category Explorer',
    first_referral: 'First Referral',
    social_butterfly: 'Social Butterfly',
  };
  return names[badgeId] || badgeId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getBadgeDescription(badgeId: string): string {
  const descriptions: Record<string, string> = {
    first_log: 'Logged your first expense!',
    streak_3: 'Logged expenses for 3 days straight!',
    streak_7: 'A whole week of tracking!',
    streak_14: 'Two weeks of dedication!',
    streak_30: 'A month of financial discipline!',
    budget_conscious: 'Stayed under budget this week!',
    early_bird: 'Logged an expense before 8 AM!',
    night_owl: 'Late night expense tracking!',
    category_explorer: 'Used 5 different categories!',
    first_referral: 'Invited your first friend!',
    social_butterfly: 'Invited 5 friends!',
  };
  return descriptions[badgeId] || 'Achievement unlocked!';
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  achievementsSection: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  achievementCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  achievementTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  shareIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.habitOrange + '15',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
    gap: SPACING.md,
  },
  tipText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
