// 🏠 Home Dashboard Screen (Enhanced Polish Version)
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState, AppDispatch } from '../src/store';
import { selectTodayBalance } from '../src/features/expenseTracking/expenseSlice';
import { 
  loadUserPreferences, 
  trackAppOpen,
  selectPreferences 
} from '../src/features/userPreferences/userPreferencesSlice';
import { Card } from '../src/core/presentation/components/Card';
import { CircularProgress } from '../src/core/presentation/components/CircularProgress';
import { NudgeCard } from '../src/core/presentation/components/NudgeCard';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { SecurityInfoModal } from '../src/core/presentation/components/SecurityInfoModal';
import { StreakCalendar } from '../src/core/presentation/components/StreakCalendar';
import { formatCurrency } from '../src/core/common/utils';
import { getNudgeForHome, SelectedNudge } from '../src/core/common/nudgeEngine';
import { getTimeBasedGreeting, getContextualMessage, getCompanion } from '../src/core/common/companions';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

// Extended Habit Rings Data
const HABIT_RINGS_DATA = [
  { id: 'logging', label: 'Daily Log', icon: '💰', color: COLORS.habitBlue, percentage: 0 },
  { id: 'budget', label: 'Budget', icon: '🎯', color: COLORS.habitCyan, percentage: 65 },
  { id: 'savings', label: 'Savings', icon: '💎', color: COLORS.habitPurple, percentage: 85 },
  { id: 'mindful', label: 'Mindful $', icon: '🧘', color: COLORS.habitOrange, percentage: 40 },
  { id: 'income', label: 'Income', icon: '💵', color: COLORS.success, percentage: 100 },
];

// Extended Power-Ups Data
const POWER_UPS_DATA = [
  { id: 'streak_7', label: '7-Day Streak', emoji: '🔥', color: COLORS.habitCyan, active: true },
  { id: 'first_save', label: 'First Save', emoji: '💰', color: COLORS.primary, active: true },
  { id: 'budget_king', label: 'Budget King', emoji: '👑', color: COLORS.habitPurple, active: true },
  { id: 'early_bird', label: 'Early Bird', emoji: '🌅', color: COLORS.habitOrange, active: false },
  { id: 'night_owl', label: 'Night Owl', emoji: '🦉', color: COLORS.habitBlue, active: false },
  { id: 'penny_pincher', label: 'Saver', emoji: '🐷', color: COLORS.habitPink, active: true },
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.onboarding.userProfile);
  const gamification = useSelector((state: RootState) => state.gamification);
  const todayBalance = useSelector(selectTodayBalance);
  const transactions = useSelector((state: RootState) => state.expense.transactions);
  const preferences = useSelector(selectPreferences);

  // Nudge state
  const [showNudge, setShowNudge] = useState(true);
  
  // Security modal state
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  // Load user preferences and track app open on mount
  useEffect(() => {
    dispatch(loadUserPreferences());
    dispatch(trackAppOpen());
  }, [dispatch]);
  
  // Get user's display name and companion
  const displayName = preferences.displayName || userProfile?.name || 'Friend';
  const companionId = preferences.companionId || 'bear';
  const companion = getCompanion(companionId);
  
  // Time-based greeting
  const greeting = getTimeBasedGreeting(displayName);
  const contextMessage = getContextualMessage();
  
  // Get contextual nudge
  const nudge = useMemo(() => {
    return getNudgeForHome(transactions, {
      currentStreak: gamification.currentStreak,
      lastLogDate: gamification.lastLogDate,
      totalTransactions: gamification.totalTransactions,
      level: gamification.level,
      badges: gamification.badges,
    }, {
      dailyBudgetLimit: userProfile?.monthlyTarget ? userProfile.monthlyTarget / 30 : 1000,
    });
  }, [transactions, gamification, userProfile]);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const today = new Date();
    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  });

  // Calculate XP progress
  const xpForNextLevel = (gamification.level + 1) * 500;
  const currentLevelXP = gamification.level * 500;
  const xpProgress = gamification.points - currentLevelXP;
  const xpRequired = xpForNextLevel - currentLevelXP;
  const xpPercentage = Math.min((xpProgress / xpRequired) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Personalized Greeting and Companion */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.headerLeft}
            onPress={() => router.push('/choose-companion')}
            activeOpacity={0.7}
          >
            <CompanionAvatar companionId={companionId} size="medium" />
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>{greeting}</Text>
              <Text style={styles.contextMessage}>{contextMessage}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.onDeviceBadge}
            onPress={() => setShowSecurityModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="lock-closed" size={14} color={COLORS.success} />
            <Text style={styles.onDeviceText}>SECURE</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Current Rank Card - Enhanced */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Card style={styles.rankCard}>
            <View style={styles.rankHeader}>
              <Text style={styles.rankLabel}>CURRENT RANK</Text>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>LV {gamification.level}</Text>
              </View>
            </View>
            <Text style={styles.rankTitle}>Finance Apprentice</Text>
            <Text style={styles.rankSubtitle}>
              Keep logging daily to reach &quot;Consistency King&quot; 👑
            </Text>
            <View style={styles.xpProgressContainer}>
              <View style={styles.xpBar}>
                <Animated.View
                  style={[
                    styles.xpBarFill,
                    {
                      width: `${xpPercentage}%`,
                      opacity: fadeAnim,
                    },
                  ]}
                />
              </View>
              <Text style={styles.xpText}>
                {gamification.points}/{xpForNextLevel} XP
              </Text>
            </View>
            <View style={styles.rankFooter}>
              <View style={styles.rankStat}>
                <Text style={styles.rankStatValue}>{gamification.totalTransactions}</Text>
                <Text style={styles.rankStatLabel}>Logs</Text>
              </View>
              <View style={styles.rankDivider} />
              <View style={styles.rankStat}>
                <Text style={styles.rankStatValue}>{gamification.currentStreak}</Text>
                <Text style={styles.rankStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.rankDivider} />
              <View style={styles.rankStat}>
                <Text style={styles.rankStatValue}>{gamification.badges.length + 3}</Text>
                <Text style={styles.rankStatLabel}>Badges</Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Highlights Button - Spotify Wrapped Style */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <TouchableOpacity
            style={styles.highlightsButton}
            onPress={() => router.push('/highlights')}
          >
            <View style={styles.highlightsButtonContent}>
              <View style={styles.highlightsIcon}>
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.highlightsText}>
                <Text style={styles.highlightsTitle}>Your Highlights</Text>
                <Text style={styles.highlightsSubtitle}>See your daily & weekly wrapped</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Smart Nudge Card */}
        {nudge && showNudge && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <NudgeCard
              nudge={nudge}
              variant="banner"
              onDismiss={() => setShowNudge(false)}
            />
          </Animated.View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/sms-import')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.habitCyan + '20' }]}>
              <Ionicons name="chatbubble-ellipses" size={20} color={COLORS.habitCyan} />
            </View>
            <Text style={styles.quickActionText}>SMS Import</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/challenges')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.habitOrange + '20' }]}>
              <Ionicons name="trophy" size={20} color={COLORS.habitOrange} />
            </View>
            <Text style={styles.quickActionText}>Challenges</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/insights')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: COLORS.habitPurple + '20' }]}>
              <Ionicons name="stats-chart" size={20} color={COLORS.habitPurple} />
            </View>
            <Text style={styles.quickActionText}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Habit Rings - Enhanced with More Rings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Habit Rings</Text>
              <Text style={styles.sectionSubtitle}>Your daily progress tracked</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitRings}
          >
            {HABIT_RINGS_DATA.map((ring, index) => (
              <Animated.View
                key={ring.id}
                style={[
                  styles.habitRingCard,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.1)),
                      },
                    ],
                  },
                ]}
              >
                <CircularProgress
                  size={110}
                  strokeWidth={8}
                  percentage={ring.percentage}
                  color={ring.color}
                  icon={ring.icon}
                />
                <Text style={styles.habitRingLabel}>{ring.label}</Text>
                <Text style={[styles.habitRingPercent, { color: ring.color }]}>
                  {ring.percentage}%
                </Text>
                {ring.percentage === 100 && (
                  <View style={[styles.completeBadge, { backgroundColor: ring.color }]}>
                    <Text style={styles.completeBadgeText}>✓</Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Streak Calendar - Enhanced */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streak Calendar</Text>
            <Card style={styles.streakCard}>
              <View style={styles.streakHeader}>
                <View style={styles.streakIconContainer}>
                  <Text style={styles.streakEmoji}>🔥</Text>
                </View>
                <View style={styles.streakInfo}>
                  <Text style={styles.streakText}>
                    {gamification.currentStreak} Day Streak
                  </Text>
                  <Text style={styles.streakSubtext}>Keep it burning! 🔥</Text>
                </View>
                <Text style={styles.streakDate}>Feb 2026</Text>
              </View>
              <View style={styles.calendarDays}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <Text key={i} style={styles.dayLabel}>
                    {day}
                  </Text>
                ))}
              </View>
              {/* Week 1 */}
              <View style={styles.calendarDates}>
                {[1, 2, 3, 4, 5, 6, 7].map((date, index) => {
                  const isActive = date <= gamification.currentStreak;
                  const isToday = date === 26;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.calendarDate,
                        isActive && styles.calendarDateActive,
                        isToday && styles.calendarDateToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDateText,
                          (isActive || isToday) && styles.calendarDateTextActive,
                        ]}
                      >
                        {date}
                      </Text>
                      {isActive && !isToday && (
                        <View style={styles.checkDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              {/* Week 2 */}
              <View style={styles.calendarDates}>
                {[8, 9, 10, 11, 12, 13, 14].map((date, index) => {
                  const isActive = date <= gamification.currentStreak;
                  const isToday = date === 26;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.calendarDate,
                        isActive && styles.calendarDateActive,
                        isToday && styles.calendarDateToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDateText,
                          (isActive || isToday) && styles.calendarDateTextActive,
                        ]}
                      >
                        {date}
                      </Text>
                      {isActive && !isToday && (
                        <View style={styles.checkDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              {/* Week 3 */}
              <View style={styles.calendarDates}>
                {[15, 16, 17, 18, 19, 20, 21].map((date, index) => {
                  const isActive = date <= gamification.currentStreak;
                  const isToday = date === 26;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.calendarDate,
                        isActive && styles.calendarDateActive,
                        isToday && styles.calendarDateToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDateText,
                          (isActive || isToday) && styles.calendarDateTextActive,
                        ]}
                      >
                        {date}
                      </Text>
                      {isActive && !isToday && (
                        <View style={styles.checkDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
              {/* Week 4 */}
              <View style={styles.calendarDates}>
                {[22, 23, 24, 25, 26, 27, 28].map((date, index) => {
                  const isActive = date <= 26 && date >= 22; // Current week active
                  const isToday = date === 26;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.calendarDate,
                        isActive && styles.calendarDateActive,
                        isToday && styles.calendarDateToday,
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDateText,
                          (isActive || isToday) && styles.calendarDateTextActive,
                        ]}
                      >
                        {date}
                      </Text>
                      {isActive && !isToday && (
                        <View style={styles.checkDot}>
                          <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </Card>
          </View>
        </Animated.View>

        {/* Power-Ups Earned - Enhanced with More Badges */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Power-Ups Collection</Text>
              <Text style={styles.sectionSubtitle}>4 active • 2 locked</Text>
            </View>
          </View>
          <View style={styles.powerUpsGrid}>
            {POWER_UPS_DATA.map((powerUp, index) => (
              <Animated.View
                key={powerUp.id}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: Animated.multiply(
                        slideAnim,
                        new Animated.Value(1 + (index % 3) * 0.1)
                      ),
                    },
                  ],
                }}
              >
                <Card
                  style={[
                    styles.powerUpCard,
                    powerUp.active
                      ? {
                          borderColor: powerUp.color,
                          backgroundColor: powerUp.color + '10',
                        }
                      : styles.powerUpCardLocked,
                  ]}
                >
                  <View
                    style={[
                      styles.powerUpIcon,
                      {
                        backgroundColor: powerUp.active
                          ? powerUp.color + '30'
                          : COLORS.border,
                      },
                    ]}
                  >
                    <Text style={[styles.powerUpEmoji, !powerUp.active && styles.powerUpEmojiLocked]}>
                      {powerUp.emoji}
                    </Text>
                  </View>
                  <Text style={[styles.powerUpLabel, !powerUp.active && styles.powerUpLabelLocked]}>
                    {powerUp.label}
                  </Text>
                  {powerUp.active && (
                    <View style={styles.activeDot}>
                      <Text style={styles.activeDotText}>⚡</Text>
                    </View>
                  )}
                  {!powerUp.active && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                </Card>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Recent Activity - Enhanced */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All →</Text>
            </TouchableOpacity>
          </View>
          {transactions.length === 0 ? (
            <Card style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyEmoji}>🌱</Text>
              </View>
              <Text style={styles.emptyText}>Start Your Journey</Text>
              <Text style={styles.emptySubtext}>
                Log your first transaction to build financial habits!
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/add-expense')}
              >
                <Text style={styles.emptyButtonText}>Log First Transaction</Text>
              </TouchableOpacity>
            </Card>
          ) : (
            <View style={styles.activityList}>
              {transactions.slice(0, 4).map((transaction, index) => (
                <Animated.View
                  key={transaction.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: Animated.multiply(slideAnim, new Animated.Value(1 + index * 0.05)),
                      },
                    ],
                  }}
                >
                  <Card style={styles.activityCard}>
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
                        <Text style={styles.activityTime}>Today • Just now</Text>
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
                        {formatCurrency(transaction.amount).replace('₹', '₹')}
                      </Text>
                      <View style={styles.xpBadge}>
                        <Text style={styles.xpBadgeText}>+10 XP</Text>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        {/* Bottom Padding */}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Bottom Navigation - Enhanced */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.navIconActive}>
            <Ionicons name="home" size={22} color={COLORS.primary} />
          </View>
          <Text style={[styles.navLabel, styles.navLabelActive]}>DASH</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/insights')}>
          <View style={styles.navIcon}>
            <Ionicons name="stats-chart" size={22} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.navLabel}>INSIGHTS</Text>
        </TouchableOpacity>

        {/* FAB - Enhanced */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-expense')}
          activeOpacity={0.8}
        >
          <View style={styles.fabInner}>
            <Text style={styles.fabIcon}>+</Text>
          </View>
          <View style={styles.fabPulse} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/highlights')}>
          <View style={styles.navIcon}>
            <Ionicons name="sparkles" size={22} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.navLabel}>HIGHLIGHTS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <View style={styles.navIcon}>
            <Ionicons name="settings-outline" size={22} color={COLORS.textSecondary} />
          </View>
          <Text style={styles.navLabel}>SETTINGS</Text>
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  greetingContainer: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  greetingText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  contextMessage: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  appIconContainer: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  appIcon: {
    fontSize: 28,
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  appTagline: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
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
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  rankCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    padding: SPACING.xl,
    backgroundColor: COLORS.surfaceTint,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  rankLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1.2,
  },
  levelBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  levelBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  rankTitle: {
    fontSize: 28,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  rankSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  xpProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  xpBar: {
    flex: 1,
    height: 10,
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
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    minWidth: 80,
    textAlign: 'right',
  },
  rankFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rankStat: {
    alignItems: 'center',
  },
  rankStatValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  rankStatLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  rankDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
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
    borderRadius: BORDER_RADIUS.xxl,
    marginRight: SPACING.md,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  habitRingLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  habitRingPercent: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: SPACING.xs,
  },
  completeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadgeText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
  streakCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.xl,
    backgroundColor: COLORS.primary,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  streakIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakInfo: {
    flex: 1,
  },
  streakText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  streakSubtext: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  streakDate: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  calendarDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  dayLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: 'rgba(255, 255, 255, 0.75)',
    width: 44,
    textAlign: 'center',
  },
  calendarDates: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  calendarDate: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calendarDateActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  calendarDateToday: {
    backgroundColor: '#FFFFFF',
  },
  calendarDateText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  calendarDateTextActive: {
    color: COLORS.primary,
  },
  checkDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerUpsGrid: {
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  powerUpCard: {
    width: '31%',
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  powerUpCardLocked: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    opacity: 0.6,
  },
  powerUpIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  powerUpEmoji: {
    fontSize: 28,
  },
  powerUpEmojiLocked: {
    opacity: 0.4,
  },
  powerUpLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  powerUpLabelLocked: {
    color: COLORS.textTertiary,
  },
  activeDot: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDotText: {
    fontSize: 12,
  },
  lockOverlay: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  lockIcon: {
    fontSize: 16,
  },
  activityList: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  activityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  activityEmoji: {
    fontSize: 26,
  },
  activityCategory: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: FONT_SIZE.xs,
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
  xpBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  xpBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  emptyCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  emptyButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  navIconActive: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  navIconText: {
    fontSize: 22,
  },
  navLabel: {
    fontSize: 9,
    fontWeight: FONT_WEIGHT.bold,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
  fabPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
  },
  highlightsButton: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  highlightsButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
  },
  highlightsIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  highlightsText: {
    flex: 1,
  },
  highlightsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  highlightsSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  quickActionText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
