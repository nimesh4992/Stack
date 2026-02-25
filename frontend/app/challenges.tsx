// 🎯 Challenges & Goals Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../src/store';
import { Card } from '../src/core/presentation/components/Card';
import { CircularProgress } from '../src/core/presentation/components/CircularProgress';
import { formatCurrency } from '../src/core/common/utils';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

// Challenge types
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  unit: string;
  reward: number;
  icon: string;
  color: string;
  isCompleted: boolean;
}

// Goal types
interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export default function ChallengesScreen() {
  const router = useRouter();
  const gamification = useSelector((state: RootState) => state.gamification);
  const transactions = useSelector((state: RootState) => state.expense.transactions);
  const userProfile = useSelector((state: RootState) => state.onboarding.userProfile);

  const [activeTab, setActiveTab] = useState<'challenges' | 'goals'>('challenges');

  // Calculate challenge progress
  const todayTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const today = new Date();
    return tDate.toDateString() === today.toDateString();
  });

  const weekTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return tDate >= weekAgo;
  });

  const monthTransactions = transactions.filter(t => {
    const tDate = new Date(t.date);
    const monthStart = new Date();
    monthStart.setDate(1);
    return tDate >= monthStart;
  });

  // Active challenges
  const challenges: Challenge[] = [
    {
      id: 'daily_log',
      title: 'Daily Logger',
      description: 'Log at least 3 transactions today',
      type: 'daily',
      target: 3,
      current: todayTransactions.length,
      unit: 'transactions',
      reward: 50,
      icon: 'create',
      color: COLORS.habitBlue,
      isCompleted: todayTransactions.length >= 3,
    },
    {
      id: 'streak_7',
      title: '7-Day Streak',
      description: 'Maintain a 7-day logging streak',
      type: 'weekly',
      target: 7,
      current: gamification.currentStreak,
      unit: 'days',
      reward: 100,
      icon: 'flame',
      color: COLORS.habitOrange,
      isCompleted: gamification.currentStreak >= 7,
    },
    {
      id: 'budget_master',
      title: 'Budget Master',
      description: 'Stay under ₹500 daily spending for a week',
      type: 'weekly',
      target: 7,
      current: 4, // Mock: Days under budget
      unit: 'days',
      reward: 150,
      icon: 'shield-checkmark',
      color: COLORS.habitCyan,
      isCompleted: false,
    },
    {
      id: 'no_impulse',
      title: 'Impulse Control',
      description: 'No shopping expenses for 3 days',
      type: 'daily',
      target: 3,
      current: 1,
      unit: 'days',
      reward: 75,
      icon: 'bag-remove',
      color: COLORS.habitPurple,
      isCompleted: false,
    },
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Log your first expense before 9 AM',
      type: 'daily',
      target: 1,
      current: 0,
      unit: 'log',
      reward: 25,
      icon: 'sunny',
      color: COLORS.warning,
      isCompleted: false,
    },
    {
      id: 'monthly_save',
      title: 'Monthly Saver',
      description: `Save ₹${(userProfile?.monthlyTarget || 10000).toLocaleString()} this month`,
      type: 'monthly',
      target: userProfile?.monthlyTarget || 10000,
      current: monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) -
        monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      unit: 'rupees',
      reward: 500,
      icon: 'diamond',
      color: COLORS.success,
      isCompleted: false,
    },
  ];

  // User goals
  const goals: Goal[] = [
    {
      id: 'emergency_fund',
      title: 'Emergency Fund',
      targetAmount: 100000,
      savedAmount: 25000,
      deadline: '2026-12-31',
      icon: '🛡️',
      color: COLORS.habitCyan,
    },
    {
      id: 'vacation',
      title: 'Dream Vacation',
      targetAmount: 50000,
      savedAmount: 12000,
      deadline: '2026-08-15',
      icon: '✈️',
      color: COLORS.habitPurple,
    },
    {
      id: 'gadget',
      title: 'New Gadget',
      targetAmount: 30000,
      savedAmount: 18000,
      deadline: '2026-04-30',
      icon: '📱',
      color: COLORS.habitBlue,
    },
  ];

  const renderChallenge = (challenge: Challenge) => {
    const progress = Math.min((challenge.current / challenge.target) * 100, 100);
    
    return (
      <Card key={challenge.id} style={styles.challengeCard}>
        <View style={styles.challengeHeader}>
          <View style={[styles.challengeIcon, { backgroundColor: challenge.color + '20' }]}>
            <Ionicons name={challenge.icon as any} size={24} color={challenge.color} />
          </View>
          <View style={styles.challengeInfo}>
            <View style={styles.challengeTitleRow}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <View style={[styles.typeBadge, { backgroundColor: challenge.color + '15' }]}>
                <Text style={[styles.typeBadgeText, { color: challenge.color }]}>
                  {challenge.type.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.challengeDescription}>{challenge.description}</Text>
          </View>
        </View>
        
        <View style={styles.challengeProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progress}%`, backgroundColor: challenge.color }
              ]} 
            />
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressText}>
              {challenge.current}/{challenge.target} {challenge.unit}
            </Text>
            <View style={styles.rewardBadge}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.rewardText}>{challenge.reward} XP</Text>
            </View>
          </View>
        </View>
        
        {challenge.isCompleted && (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <Text style={styles.completedText}>Completed!</Text>
          </View>
        )}
      </Card>
    );
  };

  const renderGoal = (goal: Goal) => {
    const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);
    const daysLeft = Math.ceil(
      (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return (
      <Card key={goal.id} style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <CircularProgress
            size={80}
            strokeWidth={8}
            percentage={progress}
            color={goal.color}
            icon={goal.icon}
          />
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{goal.title}</Text>
            <Text style={styles.goalAmount}>
              {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
            </Text>
            <View style={styles.goalDeadline}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.goalDeadlineText}>
                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.goalActions}>
          <TouchableOpacity 
            style={[styles.goalButton, { backgroundColor: goal.color }]}
            onPress={() => Alert.alert('Coming Soon', 'Add funds feature coming soon!')}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.goalButtonText}>Add Funds</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.goalEditButton}>
            <Ionicons name="pencil" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Challenges & Goals</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          data-testid="challenges-tab-btn"
          style={[styles.tab, activeTab === 'challenges' && styles.tabActive]}
          onPress={() => setActiveTab('challenges')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="trophy" 
            size={20} 
            color={activeTab === 'challenges' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.tabTextActive]}>
            Challenges
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          data-testid="goals-tab-btn"
          style={[styles.tab, activeTab === 'goals' && styles.tabActive]}
          onPress={() => setActiveTab('goals')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="flag" 
            size={20} 
            color={activeTab === 'goals' ? COLORS.primary : COLORS.textSecondary} 
          />
          <Text style={[styles.tabText, activeTab === 'goals' && styles.tabTextActive]}>
            Goals
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'challenges' ? (
          <>
            {/* Stats Summary */}
            <Card style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{challenges.filter(c => c.isCompleted).length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{challenges.filter(c => !c.isCompleted).length}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: COLORS.warning }]}>
                  {challenges.reduce((sum, c) => sum + (c.isCompleted ? c.reward : 0), 0)}
                </Text>
                <Text style={styles.statLabel}>XP Earned</Text>
              </View>
            </Card>

            {/* Challenge List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ACTIVE CHALLENGES</Text>
              {challenges.map(renderChallenge)}
            </View>
          </>
        ) : (
          <>
            {/* Goals List */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>YOUR GOALS</Text>
                <TouchableOpacity 
                  style={styles.addGoalButton}
                  onPress={() => Alert.alert('Coming Soon', 'Create new goal feature coming soon!')}
                >
                  <Ionicons name="add" size={20} color={COLORS.primary} />
                  <Text style={styles.addGoalText}>Add Goal</Text>
                </TouchableOpacity>
              </View>
              {goals.map(renderGoal)}
            </View>
          </>
        )}
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 44,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceAlt,
    gap: SPACING.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary + '40',
  },
  tabText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  statsCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  challengeCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  challengeTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  typeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
  },
  challengeDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  challengeProgress: {
    marginTop: SPACING.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  rewardText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.warning,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.success + '15',
    borderRadius: BORDER_RADIUS.md,
  },
  completedText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.success,
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  addGoalText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  goalCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  goalInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  goalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  goalAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  goalDeadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  goalDeadlineText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  goalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  goalButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  goalEditButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
