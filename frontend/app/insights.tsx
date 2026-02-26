// 📊 Insights & Charts Screen
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart, BarChart } from 'react-native-gifted-charts';
import { RootState } from '../src/store';
import { Card } from '../src/core/presentation/components/Card';
import { formatCurrency } from '../src/core/common/utils';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  EXPENSE_CATEGORIES,
} from '../src/core/common/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function InsightsScreen() {
  const router = useRouter();
  const transactions = useSelector((state: RootState) => state.expense.transactions);
  const gamification = useSelector((state: RootState) => state.gamification);

  // Calculate spending by category
  const categoryData = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryMap[t.categoryId] = (categoryMap[t.categoryId] || 0) + t.amount;
      });

    return EXPENSE_CATEGORIES.map(cat => ({
      value: categoryMap[cat.id] || 0,
      label: cat.label,
      color: cat.color,
      focused: false,
    })).filter(item => item.value > 0);
  }, [transactions]);

  // Calculate daily spending trend (last 7 days)
  const dailyTrendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date;
    });

    return last7Days.map(date => {
      const dayTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return (
          t.type === 'expense' &&
          tDate.getDate() === date.getDate() &&
          tDate.getMonth() === date.getMonth()
        );
      });

      const total = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      return {
        value: total,
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dataPointText: total > 0 ? `₹${Math.round(total)}` : '',
      };
    });
  }, [transactions]);

  // Calculate weekly comparison (this week vs last week)
  const weeklyComparison = useMemo(() => {
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= thisWeekStart)
      .reduce((sum, t) => sum + t.amount, 0);

    const lastWeekExpenses = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= lastWeekStart && tDate < thisWeekStart;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    return [
      { value: lastWeekExpenses, label: 'Last Week', frontColor: COLORS.textTertiary },
      { value: thisWeekExpenses, label: 'This Week', frontColor: COLORS.primary },
    ];
  }, [transactions]);

  // Calculate stats
  const totalSpent = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalSpent;

  const avgDailySpending = dailyTrendData.length > 0
    ? dailyTrendData.reduce((sum, d) => sum + d.value, 0) / dailyTrendData.length
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insights & Charts</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="elevated">
            <View style={styles.statIconContainer}>
              <Ionicons name="trending-down" size={24} color={COLORS.danger} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.success + '20' }]}>
              <Ionicons name="trending-up" size={24} color={COLORS.success} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(totalIncome)}</Text>
            <Text style={styles.statLabel}>Total Income</Text>
          </Card>
        </View>

        <View style={styles.statsRow}>
          <Card style={styles.statCard} variant="elevated">
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.primary + '20' }]}>
              <Ionicons name="wallet" size={24} color={COLORS.primary} />
            </View>
            <Text style={[styles.statValue, netBalance >= 0 ? styles.positive : styles.negative]}>
              {formatCurrency(netBalance)}
            </Text>
            <Text style={styles.statLabel}>Net Balance</Text>
          </Card>

          <Card style={styles.statCard} variant="elevated">
            <View style={[styles.statIconContainer, { backgroundColor: COLORS.habitOrange + '20' }]}>
              <Ionicons name="calendar" size={24} color={COLORS.habitOrange} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(avgDailySpending)}</Text>
            <Text style={styles.statLabel}>Avg Daily</Text>
          </Card>
        </View>

        {/* Spending by Category - Pie Chart */}
        {categoryData.length > 0 && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Spending by Category</Text>
              <Ionicons name="pie-chart" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.chartContainer}>
              <PieChart
                data={categoryData}
                donut
                radius={90}
                innerRadius={60}
                centerLabelComponent={() => (
                  <View style={styles.pieCenter}>
                    <Text style={styles.pieCenterValue}>
                      {formatCurrency(totalSpent)}
                    </Text>
                    <Text style={styles.pieCenterLabel}>Total</Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.legend}>
              {categoryData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendValue}>{formatCurrency(item.value)}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Daily Spending Trend - Line Chart */}
        {dailyTrendData.some(d => d.value > 0) && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>7-Day Spending Trend</Text>
              <Ionicons name="analytics" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.chartContainer}>
              <LineChart
                data={dailyTrendData}
                width={SCREEN_WIDTH - SPACING.lg * 4}
                height={200}
                curved
                areaChart
                startFillColor={COLORS.primary}
                startOpacity={0.3}
                endOpacity={0.1}
                color={COLORS.primary}
                thickness={3}
                hideDataPoints={false}
                dataPointsColor={COLORS.primary}
                dataPointsRadius={4}
                xAxisColor={COLORS.border}
                yAxisColor={COLORS.border}
                yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                noOfSections={4}
                maxValue={Math.max(...dailyTrendData.map(d => d.value)) * 1.2}
              />
            </View>
          </Card>
        )}

        {/* Weekly Comparison - Bar Chart */}
        {weeklyComparison.some(w => w.value > 0) && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Comparison</Text>
              <Ionicons name="bar-chart" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.chartContainer}>
              <BarChart
                data={weeklyComparison}
                width={SCREEN_WIDTH - SPACING.lg * 4}
                height={200}
                barWidth={80}
                spacing={40}
                roundedTop
                roundedBottom
                xAxisThickness={0}
                yAxisThickness={0}
                yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                noOfSections={4}
                maxValue={Math.max(...weeklyComparison.map(w => w.value)) * 1.2}
              />
            </View>
            <View style={styles.comparisonFooter}>
              {weeklyComparison[1].value > weeklyComparison[0].value ? (
                <>
                  <Ionicons name="trending-up" size={20} color={COLORS.danger} />
                  <Text style={styles.comparisonText}>
                    Spending increased by{' '}
                    {formatCurrency(weeklyComparison[1].value - weeklyComparison[0].value)}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="trending-down" size={20} color={COLORS.success} />
                  <Text style={styles.comparisonText}>
                    Spending decreased by{' '}
                    {formatCurrency(weeklyComparison[0].value - weeklyComparison[1].value)}
                  </Text>
                </>
              )}
            </View>
          </Card>
        )}

        {/* Empty State */}
        {transactions.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="stats-chart-outline" size={80} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No Data Yet</Text>
            <Text style={styles.emptyText}>
              Start logging transactions to see beautiful insights and charts!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/add-expense')}
            >
              <Text style={styles.emptyButtonText}>Add First Transaction</Text>
            </TouchableOpacity>
          </Card>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.danger + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  positive: {
    color: COLORS.success,
  },
  negative: {
    color: COLORS.danger,
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  pieCenter: {
    alignItems: 'center',
  },
  pieCenterValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  pieCenterLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  legend: {
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
  },
  legendValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  comparisonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  comparisonText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    padding: SPACING.xxl * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
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
});
