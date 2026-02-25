// 🏠 Home Dashboard Screen
import React, { useEffect } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { RootState } from '../src/store';
import { selectTodayBalance } from '../src/features/expenseTracking/expenseSlice';
import { Card } from '../src/core/presentation/components/Card';
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMotivationalMessage = () => {
    if (todayBalance > 0) return 'Great job! Your money is growing! 🌱';
    if (todayBalance === 0) return 'Ready to track your finances today?';
    return 'Every rupee counts. Stay mindful! 💪';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}! 👋</Text>
              <Text style={styles.userName}>{userProfile?.name || 'User'}</Text>
            </View>
            <TouchableOpacity
              style={styles.levelBadge}
              onPress={() => {
                // Navigate to gamification details
              }}
            >
              <Text style={styles.levelText}>Lv {gamification.level}</Text>
              <Text style={styles.pointsText}>{gamification.points} pts</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Today's Balance Card */}
        <Card style={styles.balanceCard} variant="elevated">
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Today's Balance</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>{gamification.currentStreak} days</Text>
            </View>
          </View>
          <Text
            style={[
              styles.balanceAmount,
              todayBalance >= 0 ? styles.balancePositive : styles.balanceNegative,
            ]}
          >
            {formatCurrency(todayBalance)}
          </Text>
          <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
        </Card>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>{todayTransactions.length}</Text>
            <Text style={styles.statLabel}>Today's Logs</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statEmoji}>🎯</Text>
            <Text style={styles.statValue}>
              {formatCurrency(userProfile?.monthlyTarget || 0)}
            </Text>
            <Text style={styles.statLabel}>Monthly Goal</Text>
          </Card>
          <Card style={styles.statCard} variant="outlined">
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>{gamification.badges.length}</Text>
            <Text style={styles.statLabel}>Badges Earned</Text>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {transactions.length > 5 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>📝</Text>
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>
                Start logging your expenses to build your financial habits!
              </Text>
            </Card>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((transaction) => (
                <Card key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionContent}>
                    <View style={styles.transactionLeft}>
                      <Text style={styles.transactionEmoji}>
                        {transaction.categoryIcon}
                      </Text>
                      <View>
                        <Text style={styles.transactionCategory}>
                          {transaction.categoryLabel}
                        </Text>
                        {transaction.note && (
                          <Text style={styles.transactionNote} numberOfLines={1}>
                            {transaction.note}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.type === 'expense'
                          ? styles.expenseAmount
                          : styles.incomeAmount,
                      ]}
                    >
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-expense')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[COLORS.accent, COLORS.accentDark]}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    paddingBottom: SPACING.xxl + 60, // Space for FAB
  },
  header: {
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  levelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  pointsText: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  balanceCard: {
    margin: SPACING.lg,
    marginTop: -SPACING.xl - 20,
    padding: SPACING.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentLight + '30',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  streakEmoji: {
    fontSize: FONT_SIZE.md,
    marginRight: SPACING.xs,
  },
  streakText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.accentDark,
  },
  balanceAmount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    marginBottom: SPACING.sm,
  },
  balancePositive: {
    color: COLORS.success,
  },
  balanceNegative: {
    color: COLORS.danger,
  },
  motivationalText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: FONT_SIZE.xxl,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  seeAllText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  emptyCard: {
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
  transactionsList: {
    gap: SPACING.sm,
  },
  transactionCard: {
    padding: SPACING.md,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionEmoji: {
    fontSize: FONT_SIZE.xxl,
    marginRight: SPACING.md,
  },
  transactionCategory: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  transactionNote: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  transactionAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
  expenseAmount: {
    color: COLORS.danger,
  },
  incomeAmount: {
    color: COLORS.success,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.lg,
    borderRadius: BORDER_RADIUS.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
});
