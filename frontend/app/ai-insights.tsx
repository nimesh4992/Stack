// AI Insights Screen
// Display AI-powered predictions, anomalies, and personalized insights

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../src/store';
import { selectPreferences } from '../src/features/userPreferences/userPreferencesSlice';
import { Card } from '../src/core/presentation/components/Card';
import { CompanionAvatar } from '../src/core/presentation/components/CompanionAvatar';
import { getCompanion } from '../src/core/common/companions';
import {
  predictMonthlySpending,
  predictChurnRisk,
  buildUserBehaviorProfile,
  calculateOptimalNotificationTime,
  SpendingPrediction,
  ChurnRisk,
  UserBehaviorProfile,
} from '../src/core/services/aiEngine';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

export default function AIInsightsScreen() {
  const router = useRouter();
  const preferences = useSelector(selectPreferences);
  const transactions = useSelector((state: RootState) => state.expense.transactions);
  const gamification = useSelector((state: RootState) => state.gamification);
  
  const [refreshing, setRefreshing] = useState(false);
  
  const companion = getCompanion(preferences.companionId);
  
  // Calculate AI insights
  const spendingPrediction = useMemo(() => 
    predictMonthlySpending(transactions), 
    [transactions]
  );
  
  const churnRisk = useMemo(() => 
    predictChurnRisk(
      gamification.lastLogDate,
      gamification.currentStreak,
      gamification.totalTransactions,
      preferences.appOpenTimes,
      preferences.totalAppOpens
    ),
    [gamification, preferences]
  );
  
  const userProfile = useMemo(() =>
    buildUserBehaviorProfile(
      transactions,
      preferences.appOpenTimes,
      gamification.currentStreak,
      gamification.lastLogDate
    ),
    [transactions, preferences, gamification]
  );
  
  const optimalTime = useMemo(() =>
    calculateOptimalNotificationTime(preferences.appOpenTimes),
    [preferences.appOpenTimes]
  );
  
  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return { icon: 'trending-up', color: COLORS.danger };
      case 'decreasing': return { icon: 'trending-down', color: COLORS.success };
      default: return { icon: 'remove', color: COLORS.textSecondary };
    }
  };
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return COLORS.danger;
      case 'high': return COLORS.habitOrange;
      case 'medium': return COLORS.warning;
      default: return COLORS.success;
    }
  };
  
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Insights</Text>
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={16} color={COLORS.primary} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* AI Companion Message */}
        <Card style={styles.companionCard}>
          <View style={styles.companionHeader}>
            <CompanionAvatar companionId={preferences.companionId} size="small" />
            <View style={styles.companionMessage}>
              <Text style={styles.companionName}>{companion?.name} says:</Text>
              <Text style={styles.companionText}>{spendingPrediction.insight}</Text>
            </View>
          </View>
        </Card>

        {/* Spending Prediction */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending Forecast</Text>
          
          <Card style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View>
                <Text style={styles.predictionLabel}>Predicted This Month</Text>
                <Text style={styles.predictionAmount}>
                  ₹{spendingPrediction.predictedTotal.toLocaleString()}
                </Text>
              </View>
              <View style={[
                styles.trendBadge,
                { backgroundColor: getTrendIcon(spendingPrediction.trend).color + '20' }
              ]}>
                <Ionicons 
                  name={getTrendIcon(spendingPrediction.trend).icon as any}
                  size={20}
                  color={getTrendIcon(spendingPrediction.trend).color}
                />
                <Text style={[
                  styles.trendText,
                  { color: getTrendIcon(spendingPrediction.trend).color }
                ]}>
                  {spendingPrediction.trend.charAt(0).toUpperCase() + spendingPrediction.trend.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.confidenceBar}>
              <View style={styles.confidenceLabel}>
                <Text style={styles.confidenceText}>AI Confidence</Text>
                <Text style={styles.confidenceValue}>
                  {Math.round(spendingPrediction.confidence * 100)}%
                </Text>
              </View>
              <View style={styles.confidenceTrack}>
                <View 
                  style={[
                    styles.confidenceFill,
                    { width: `${spendingPrediction.confidence * 100}%` }
                  ]}
                />
              </View>
            </View>
            
            {/* Weekly Breakdown */}
            {spendingPrediction.weeklyPrediction.length > 0 && (
              <View style={styles.weeklyPrediction}>
                <Text style={styles.weeklyTitle}>Remaining Weeks</Text>
                <View style={styles.weeklyBars}>
                  {spendingPrediction.weeklyPrediction.map((amount, index) => (
                    <View key={index} style={styles.weeklyBarContainer}>
                      <View 
                        style={[
                          styles.weeklyBar,
                          { 
                            height: Math.max(20, (amount / Math.max(...spendingPrediction.weeklyPrediction)) * 60)
                          }
                        ]}
                      />
                      <Text style={styles.weeklyLabel}>W{index + 1}</Text>
                      <Text style={styles.weeklyAmount}>₹{(amount / 1000).toFixed(1)}k</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Engagement Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Engagement</Text>
          
          <Card style={styles.engagementCard}>
            <View style={styles.engagementHeader}>
              <View style={styles.engagementScore}>
                <Text style={styles.scoreValue}>{userProfile.engagementScore}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={styles.engagementStats}>
                <View style={styles.engagementStat}>
                  <Ionicons name="flame" size={20} color={COLORS.habitOrange} />
                  <Text style={styles.statValue}>{gamification.currentStreak}</Text>
                  <Text style={styles.statLabel}>Streak</Text>
                </View>
                <View style={styles.engagementStat}>
                  <Ionicons name="calendar" size={20} color={COLORS.habitCyan} />
                  <Text style={styles.statValue}>{userProfile.totalDaysActive}</Text>
                  <Text style={styles.statLabel}>Days Active</Text>
                </View>
                <View style={styles.engagementStat}>
                  <Ionicons name="receipt" size={20} color={COLORS.habitPurple} />
                  <Text style={styles.statValue}>{gamification.totalTransactions}</Text>
                  <Text style={styles.statLabel}>Logged</Text>
                </View>
              </View>
            </View>
            
            {/* Risk Assessment */}
            <View style={styles.riskSection}>
              <View style={styles.riskHeader}>
                <Text style={styles.riskTitle}>Retention Risk</Text>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(churnRisk.riskLevel) + '20' }
                ]}>
                  <View style={[
                    styles.riskDot,
                    { backgroundColor: getRiskColor(churnRisk.riskLevel) }
                  ]} />
                  <Text style={[
                    styles.riskText,
                    { color: getRiskColor(churnRisk.riskLevel) }
                  ]}>
                    {churnRisk.riskLevel.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              {churnRisk.reasons.length > 0 && (
                <View style={styles.riskReasons}>
                  {churnRisk.reasons.map((reason, index) => (
                    <View key={index} style={styles.reasonItem}>
                      <Ionicons name="alert-circle" size={14} color={COLORS.textTertiary} />
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Smart Timing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Smart Notifications</Text>
          
          <Card style={styles.timingCard}>
            <View style={styles.timingContent}>
              <View style={styles.timingIcon}>
                <Ionicons name="notifications" size={28} color={COLORS.primary} />
              </View>
              <View style={styles.timingInfo}>
                <Text style={styles.timingLabel}>Optimal Time for You</Text>
                <Text style={styles.timingValue}>
                  {formatHour(optimalTime.hour)}:{optimalTime.minute.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.timingConfidence}>
                  Based on your usage pattern ({Math.round(optimalTime.confidence * 100)}% confident)
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Spending Patterns */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Spending Patterns</Text>
          
          <Card style={styles.patternsCard}>
            <View style={styles.patternRow}>
              <View style={styles.patternItem}>
                <Text style={styles.patternLabel}>Daily Avg</Text>
                <Text style={styles.patternValue}>₹{userProfile.avgDailySpending.toLocaleString()}</Text>
              </View>
              <View style={styles.patternDivider} />
              <View style={styles.patternItem}>
                <Text style={styles.patternLabel}>Weekly Avg</Text>
                <Text style={styles.patternValue}>₹{userProfile.avgWeeklySpending.toLocaleString()}</Text>
              </View>
              <View style={styles.patternDivider} />
              <View style={styles.patternItem}>
                <Text style={styles.patternLabel}>Monthly Avg</Text>
                <Text style={styles.patternValue}>₹{userProfile.avgMonthlySpending.toLocaleString()}</Text>
              </View>
            </View>
            
            {userProfile.topCategories.length > 0 && (
              <View style={styles.topCategories}>
                <Text style={styles.categoriesTitle}>Top Categories</Text>
                {userProfile.topCategories.slice(0, 3).map((cat, index) => (
                  <View key={index} style={styles.categoryItem}>
                    <View style={styles.categoryBar}>
                      <View 
                        style={[
                          styles.categoryFill,
                          { width: `${cat.percentage}%` }
                        ]}
                      />
                    </View>
                    <Text style={styles.categoryLabel}>{cat.categoryId}</Text>
                    <Text style={styles.categoryPercent}>{cat.percentage}%</Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </View>

        {/* AI Powered Badge */}
        <View style={styles.aiBanner}>
          <Ionicons name="hardware-chip" size={20} color={COLORS.primary} />
          <Text style={styles.aiBannerText}>
            All AI processing happens on-device. Your data never leaves your phone.
          </Text>
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
  aiBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  companionCard: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    marginBottom: SPACING.lg,
  },
  companionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companionMessage: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  companionName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  companionText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  predictionCard: {
    padding: SPACING.lg,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  predictionLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  predictionAmount: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  trendText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
  },
  confidenceBar: {
    marginBottom: SPACING.lg,
  },
  confidenceLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  confidenceText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  confidenceValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  confidenceTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  weeklyPrediction: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
  weeklyTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  weeklyBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  weeklyBarContainer: {
    alignItems: 'center',
  },
  weeklyBar: {
    width: 40,
    backgroundColor: COLORS.primary + '30',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.xs,
  },
  weeklyLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  weeklyAmount: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  engagementCard: {
    padding: SPACING.lg,
  },
  engagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  engagementScore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  scoreValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  engagementStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  engagementStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  riskSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  riskTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
  },
  riskReasons: {
    marginTop: SPACING.sm,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
  },
  reasonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  timingCard: {
    padding: SPACING.lg,
  },
  timingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  timingInfo: {
    flex: 1,
  },
  timingLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  timingValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  timingConfidence: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  patternsCard: {
    padding: SPACING.lg,
  },
  patternRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  patternItem: {
    flex: 1,
    alignItems: 'center',
  },
  patternDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  patternLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  patternValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  topCategories: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },
  categoriesTitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  categoryFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  categoryLabel: {
    width: 80,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  categoryPercent: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    width: 40,
    textAlign: 'right',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  aiBannerText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
