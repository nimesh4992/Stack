// Invite Friends Screen
// Share app with friends and earn rewards

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../src/store';
import { awardPoints } from '../src/features/gamification/gamificationSlice';
import { selectPreferences } from '../src/features/userPreferences/userPreferencesSlice';
import { Card } from '../src/core/presentation/components/Card';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { getCompanion } from '../src/core/common/companions';
import {
  shareInvite,
  getInviteStats,
  InviteStats,
  INVITE_REWARDS,
  checkInviteReward,
  getNextInviteReward,
} from '../src/core/services/socialService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function InviteFriendsScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const preferences = useSelector(selectPreferences);
  const gamification = useSelector((state: RootState) => state.gamification);
  
  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null);
  const [sharing, setSharing] = useState(false);
  
  const companion = getCompanion(preferences.companionId);
  const displayName = preferences.displayName || 'Friend';
  
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = async () => {
    const stats = await getInviteStats();
    setInviteStats(stats);
  };
  
  const handleShareInvite = async () => {
    setSharing(true);
    try {
      const previousInvites = inviteStats?.totalInvitesSent || 0;
      const result = await shareInvite(displayName, companion?.name);
      
      if (result.success) {
        await loadStats();
        
        // Check if user earned a new reward
        const newInvites = previousInvites + 1;
        const previousReward = checkInviteReward(previousInvites);
        const newReward = checkInviteReward(newInvites);
        
        if (newReward && (!previousReward || newReward.invites > previousReward.invites)) {
          // Award XP for reaching new tier
          await dispatch(awardPoints(newReward.xp));
          
          Alert.alert(
            `${newReward.icon} Reward Unlocked!`,
            `You earned the "${newReward.title}" badge and ${newReward.xp} XP!`,
            [{ text: 'Awesome!' }]
          );
        } else {
          Alert.alert(
            '🎉 Invite Sent!',
            'Thanks for spreading the word! Keep inviting to earn rewards.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setSharing(false);
    }
  };
  
  const nextReward = getNextInviteReward(inviteStats?.totalInvitesSent || 0);
  const currentReward = checkInviteReward(inviteStats?.totalInvitesSent || 0);
  const invitesUntilNext = nextReward 
    ? nextReward.invites - (inviteStats?.totalInvitesSent || 0)
    : 0;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invite Friends</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <CompanionAvatar companionId={preferences.companionId} size="large" />
          <Text style={styles.heroTitle}>Share the Love!</Text>
          <Text style={styles.heroSubtitle}>
            {companion?.name} wants to help more people build better money habits!
          </Text>
        </View>
        
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{inviteStats?.totalInvitesSent || 0}</Text>
              <Text style={styles.statLabel}>Invites Sent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentReward?.icon || '🎯'}</Text>
              <Text style={styles.statLabel}>{currentReward?.title || 'No Badge Yet'}</Text>
            </View>
          </View>
        </Card>
        
        {/* Progress to Next Reward */}
        {nextReward && (
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Next Reward</Text>
              <Text style={styles.progressBadge}>{nextReward.icon} {nextReward.title}</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { 
                    width: `${((inviteStats?.totalInvitesSent || 0) / nextReward.invites) * 100}%` 
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {invitesUntilNext} more invite{invitesUntilNext !== 1 ? 's' : ''} to unlock +{nextReward.xp} XP
            </Text>
          </Card>
        )}
        
        {/* Share Button */}
        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShareInvite}
          disabled={sharing}
          activeOpacity={0.8}
        >
          <Ionicons name="share-social" size={24} color="#FFFFFF" />
          <Text style={styles.shareButtonText}>
            {sharing ? 'Sharing...' : 'Share Invite Link'}
          </Text>
        </TouchableOpacity>
        
        {/* Rewards Tiers */}
        <View style={styles.rewardsSection}>
          <Text style={styles.sectionTitle}>Referral Rewards</Text>
          <Text style={styles.sectionSubtitle}>Invite friends and unlock exclusive badges!</Text>
          
          {INVITE_REWARDS.map((reward, index) => {
            const isUnlocked = (inviteStats?.totalInvitesSent || 0) >= reward.invites;
            return (
              <Card 
                key={reward.badge}
                style={[
                  styles.rewardCard,
                  isUnlocked && styles.rewardCardUnlocked
                ]}
              >
                <View style={[
                  styles.rewardIcon,
                  isUnlocked && styles.rewardIconUnlocked
                ]}>
                  <Text style={styles.rewardEmoji}>{reward.icon}</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={[
                    styles.rewardTitle,
                    isUnlocked && styles.rewardTitleUnlocked
                  ]}>
                    {reward.title}
                  </Text>
                  <Text style={styles.rewardRequirement}>
                    {reward.invites} invite{reward.invites > 1 ? 's' : ''} • +{reward.xp} XP
                  </Text>
                </View>
                {isUnlocked ? (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                ) : (
                  <Ionicons name="lock-closed" size={20} color={COLORS.textTertiary} />
                )}
              </Card>
            );
          })}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
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
  statsCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.lg,
  },
  progressCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  progressBadge: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  shareButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  rewardsSection: {
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
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    marginBottom: SPACING.md,
    opacity: 0.6,
  },
  rewardCardUnlocked: {
    opacity: 1,
    backgroundColor: COLORS.success + '10',
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  rewardIconUnlocked: {
    backgroundColor: COLORS.success + '20',
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  rewardTitleUnlocked: {
    color: COLORS.textPrimary,
  },
  rewardRequirement: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
});
