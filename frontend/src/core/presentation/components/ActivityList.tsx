// 📋 Polished Activity List Component (Minimal Design)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../../data/models';
import { formatCurrency, formatTimeAgo } from '../../common/utils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../common/constants';

interface ActivityListProps {
  transactions: Transaction[];
  onTransactionPress?: (transaction: Transaction) => void;
}

// Minimal category icon mapping
const getCategoryIcon = (categoryId: string): string => {
  const iconMap: { [key: string]: string } = {
    food: 'restaurant',
    transport: 'car',
    shopping: 'cart',
    entertainment: 'game-controller',
    bills: 'receipt',
    health: 'fitness',
    education: 'school',
    salary: 'wallet',
    freelance: 'briefcase',
    investment: 'trending-up',
    gift: 'gift',
    other: 'ellipsis-horizontal',
  };
  return iconMap[categoryId] || 'ellipsis-horizontal';
};

const getCategoryColor = (categoryId: string): string => {
  const colorMap: { [key: string]: string } = {
    food: COLORS.habitOrange,
    transport: COLORS.primary,
    shopping: COLORS.habitPink,
    entertainment: COLORS.habitPurple,
    bills: COLORS.danger,
    health: COLORS.success,
    education: COLORS.habitCyan,
    salary: COLORS.success,
    freelance: COLORS.primary,
    investment: COLORS.habitPurple,
    gift: COLORS.habitPink,
    other: COLORS.textSecondary,
  };
  return colorMap[categoryId] || COLORS.textSecondary;
};

export const ActivityList: React.FC<ActivityListProps> = ({ transactions, onTransactionPress }) => {
  if (transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Ionicons name="receipt-outline" size={32} color={COLORS.textTertiary} />
        </View>
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptyText}>Start logging to see your activity</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {transactions.map((transaction) => {
        const icon = getCategoryIcon(transaction.categoryId);
        const color = getCategoryColor(transaction.categoryId);
        
        return (
          <TouchableOpacity
            key={transaction.id}
            style={styles.item}
            onPress={() => onTransactionPress?.(transaction)}
            activeOpacity={0.7}
          >
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
              <Ionicons name={icon as any} size={18} color={color} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.category} numberOfLines={1}>
                {transaction.categoryLabel}
              </Text>
              <Text style={styles.time}>
                {formatTimeAgo(transaction.date)}
              </Text>
            </View>

            {/* Amount & Badge */}
            <View style={styles.right}>
              <Text
                style={[
                  styles.amount,
                  transaction.type === 'expense' ? styles.expenseAmount : styles.incomeAmount,
                ]}
              >
                {transaction.type === 'expense' ? '-' : '+'}
                {formatCurrency(transaction.amount)}
              </Text>
              <View style={styles.xpBadge}>
                <Text style={styles.xpText}>+10</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: SPACING.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  category: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  time: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  amount: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
  },
  expenseAmount: {
    color: COLORS.textPrimary,
  },
  incomeAmount: {
    color: COLORS.success,
  },
  xpBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  xpText: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
});
