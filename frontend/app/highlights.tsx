// 📊 Highlights Screen - Spotify Wrapped Style
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../src/store';
import { Highlights } from '../src/core/presentation/components/Highlights';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../src/core/common/constants';

export default function HighlightsScreen() {
  const router = useRouter();
  const gamification = useSelector((state: RootState) => state.gamification);
  const transactions = useSelector((state: RootState) => state.expense.transactions);

  // Calculate stats for highlights
  const todayTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const today = new Date();
    return (
      transactionDate.getDate() === today.getDate() &&
      transactionDate.getMonth() === today.getMonth() &&
      transactionDate.getFullYear() === today.getFullYear()
    );
  });

  const totalSpent = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = {
    totalTransactions: todayTransactions.length,
    totalSpent,
    totalSaved: 0, // Calculate from goals
    topCategory: todayTransactions[0]?.categoryLabel || 'Food',
    streak: gamification.currentStreak,
    pointsEarned: 20, // From today's activities
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Highlights</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Highlights Component */}
      <Highlights period="daily" stats={stats} />
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
});
