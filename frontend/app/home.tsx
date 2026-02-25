// 🏠 Home Dashboard Screen (The Dojo Style)
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { selectTodayBalance } from '../src/features/expenseTracking/expenseSlice';
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

export default function HomeScreen() {
  const router = useRouter();
  const userProfile = useSelector((state: RootState) => state.onboarding.userProfile);
  const gamification = useSelector((state: RootState) => state.gamification);
  const todayBalance = useSelector(selectTodayBalance);
  const transactions = useSelector((state: RootState) => state.expense.transactions);

  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const today = new Date();
    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  });

  // Calculate XP progress (points) for next level
  const xpForNextLevel = (gamification.level + 1) * 500;
  const currentLevelXP = gamification.level * 500;
  const xpProgress = gamification.points - currentLevelXP;
  const xpRequired = xpForNextLevel - currentLevelXP;
  const xpPercentage = (xpProgress / xpRequired) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.appIconContainer}>
              <Text style={styles.appIcon}>💰</Text>
            </View>
            <Text style={styles.appName}>HabitFinance</Text>
          </View>
          <View style={styles.onDeviceBadge}>
            <View style={styles.onDeviceIcon} />
            <Text style={styles.onDeviceText}>ON-DEVICE</Text>
          </View>
        </View>

        {/* Current Rank Card */}
        <Card style={styles.rankCard}>
          <Text style={styles.rankLabel}>CURRENT RANK</Text>
          <Text style={styles.rankTitle}>Level {gamification.level} - Finance Apprentice</Text>
          <View style={styles.xpProgressContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpBarFill, { width: `${xpPercentage}%` }]} />
            </View>
            <Text style={styles.xpText}>{gamification.points}/{xpForNextLevel} XP</Text>
          </View>
          <Text style={styles.rankHint}>
            Earn {xpRequired - xpProgress} XP more to unlock 'Consistency King' status
          </Text>
        </Card>

        {/* Habit Rings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit Rings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitRings}
          >
            <View style={styles.habitRingCard}>
              <CircularProgress
                size={120}
                strokeWidth={10}
                percentage={gamification.currentStreak > 0 ? 80 : 0}
                color={COLORS.habitBlue}
                icon="💰"
              />
              <Text style={styles.habitRingLabel}>Logging</Text>
              <Text style={[styles.habitRingPercent, { color: COLORS.habitBlue }]}>
                {gamification.currentStreak > 0 ? '80%' : '0%'}
              </Text>
            </View>

            <View style={styles.habitRingCard}>
              <CircularProgress
                size={120}
                strokeWidth={10}
                percentage={45}
                color={COLORS.habitCyan}
                icon="🎯"
              />
              <Text style={styles.habitRingLabel}>Budget</Text>
              <Text style={[styles.habitRingPercent, { color: COLORS.habitCyan }]}>45%</Text>
            </View>

            <View style={styles.habitRingCard}>
              <CircularProgress
                size={120}
                strokeWidth={10}
                percentage={100}
                color={COLORS.habitPurple}
                icon="💎"
              />
              <Text style={styles.habitRingLabel}>Savings</Text>
              <Text style={[styles.habitRingPercent, { color: COLORS.habitPurple }]}>100%</Text>
            </View>
          </ScrollView>
        </View>

        {/* Streak Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Streak Calendar</Text>
          <Card style={styles.streakCard}>
            <View style={styles.streakHeader}>
              <View style={styles.streakIcon}>
                <Text style={styles.streakEmoji}>🔥</Text>
              </View>
              <Text style={styles.streakText}>
                Logging Streak: {gamification.currentStreak} Days
              </Text>
              <Text style={styles.streakDate}>February 2026</Text>
            </View>
            <View style={styles.calendarDays}>
              <Text style={styles.dayLabel}>M</Text>
              <Text style={styles.dayLabel}>T</Text>
              <Text style={styles.dayLabel}>W</Text>
              <Text style={styles.dayLabel}>T</Text>
              <Text style={styles.dayLabel}>F</Text>
              <Text style={styles.dayLabel}>S</Text>
              <Text style={styles.dayLabel}>S</Text>
            </View>
            <View style={styles.calendarDates}>
              {[24, 25, 26, 27, 28, 1, 2].map((date, index) => (
                <View
                  key={index}
                  style={[
                    styles.calendarDate,
                    index < gamification.currentStreak && styles.calendarDateActive,
                    index === 2 && styles.calendarDateToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDateText,
                      (index < gamification.currentStreak || index === 2) &&
                        styles.calendarDateTextActive,
                    ]}
                  >
                    {date}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Power-Ups Earned */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Power-Ups Earned</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeIcon}>⚡</Text>
              <Text style={styles.activeText}>Active: {gamification.badges.length}</Text>
            </View>
          </View>
          <View style={styles.powerUps}>
            <Card
              style={[
                styles.powerUpCard,
                { borderColor: COLORS.habitCyan, backgroundColor: COLORS.habitCyan + '10' },
              ]}
            >
              <View style={[styles.powerUpIcon, { backgroundColor: COLORS.habitCyan + '30' }]}>
                <Text style={styles.powerUpEmoji}>⚡</Text>
              </View>
              <Text style={styles.powerUpLabel}>7-Day Streak</Text>
            </Card>

            <Card
              style={[
                styles.powerUpCard,
                { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
              ]}
            >
              <View style={[styles.powerUpIcon, { backgroundColor: COLORS.primary + '30' }]}>
                <Text style={styles.powerUpEmoji}>💰</Text>
              </View>
              <Text style={styles.powerUpLabel}>Savings Master</Text>
            </Card>

            <Card
              style={[
                styles.powerUpCard,
                { borderColor: COLORS.habitPurple, backgroundColor: COLORS.habitPurple + '10' },
              ]}
            >
              <View style={[styles.powerUpIcon, { backgroundColor: COLORS.habitPurple + '30' }]}>
                <Text style={styles.powerUpEmoji}>👑</Text>
              </View>
              <Text style={styles.powerUpLabel}>Daily Habit</Text>
            </Card>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          {transactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Start logging to build your financial habits!
              </Text>
            </Card>
          ) : (
            <View style={styles.activityList}>
              {transactions.slice(0, 3).map((transaction) => (
                <Card key={transaction.id} style={styles.activityCard}>
                  <View style={styles.activityLeft}>
                    <View
                      style={[
                        styles.activityIcon,
                        {
                          backgroundColor:
                            transaction.type === 'expense'
                              ? COLORS.accent + '20'
                              : COLORS.success + '20',
                        },
                      ]}
                    >
                      <Text style={styles.activityEmoji}>{transaction.categoryIcon}</Text>
                    </View>
                    <View>
                      <Text style={styles.activityCategory}>{transaction.categoryLabel}</Text>
                      <Text style={styles.activityTime}>Today, 09:15 AM</Text>
                    </View>
                  </View>
                  <View style={styles.activityRight}>
                    <Text
                      style={[
                        styles.activityAmount,
                        transaction.type === 'expense'
                          ? styles.expenseAmount
                          : styles.incomeAmount,
                      ]}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount).replace('₹', '$')}
                    </Text>
                    <Text style={styles.activityXP}>
                      +{transaction.type === 'expense' ? '10' : '15'} XP
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation - The Dojo Style */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Text style={styles.navIconText}>☰</Text>
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>DASH</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>👁</Text>
          </View>
          <Text style={styles.navLabel}>DOJO</Text>
        </TouchableOpacity>

        {/* FAB - Center */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-expense')}
          activeOpacity={0.8}
        >
          <View style={styles.fabInner}>
            <Text style={styles.fabIcon}>+</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>🔒</Text>
          </View>
          <Text style={styles.navLabel}>VAULT</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>👤</Text>
          </View>
          <Text style={styles.navLabel}>PROFILE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  appIcon: {
    fontSize: 24,
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  onDeviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  onDeviceIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.xs,
  },
  onDeviceText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  rankCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceTint,
  },
  rankLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  rankTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  xpProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  xpBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.full,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  xpText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  rankHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  habitRings: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  habitRingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: SPACING.md,
    minWidth: 160,
  },
  habitRingLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  habitRingPercent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.xs,
  },
  streakCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  streakEmoji: {
    fontSize: 20,
  },
  streakText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  streakDate: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  dayLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255, 255, 255, 0.7)',
    width: 40,
    textAlign: 'center',
  },
  calendarDates: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDate: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDateActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  calendarDateToday: {
    backgroundColor: '#FFFFFF',
  },
  calendarDateText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  calendarDateTextActive: {
    color: COLORS.primary,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  activeIcon: {
    fontSize: 12,
    marginRight: SPACING.xs,
  },
  activeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  powerUps: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  powerUpCard: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
  },
  powerUpIcon: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  powerUpEmoji: {
    fontSize: 28,
  },
  powerUpLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  activityList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityCategory: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  activityTime: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  activityRight: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.xs,
  },
  expenseAmount: {
    color: COLORS.textPrimary,
  },
  incomeAmount: {
    color: COLORS.success,
  },
  activityXP: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  emptyCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  navIconActive: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  navIconText: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  navLabelActive: {
    color: COLORS.primary,
  },
  fab: {
    position: 'absolute',
    top: -28,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
});
