// 💰 Add Expense/Income Screen (The Dojo Style - Quick Log)
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppDispatch } from '../src/store';
import { addTransaction } from '../src/features/expenseTracking/expenseSlice';
import { awardPoints, updateStreak } from '../src/features/gamification/gamificationSlice';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  POINTS,
} from '../src/core/common/constants';

// Quick select categories (simplified for Dojo style) - Icons from Ionicons
const QUICK_CATEGORIES = [
  { id: 'food', label: 'Coffee', iconName: 'cafe', color: '#FF9A3C' },
  { id: 'food', label: 'Food', iconName: 'fast-food', color: '#00D4AA' },
  { id: 'entertainment', label: 'Fun', iconName: 'game-controller', color: '#7C3AED' },
  { id: 'transport', label: 'Transit', iconName: 'car', color: '#2E5CFF' },
  { id: 'shopping', label: 'Shop', iconName: 'bag', color: '#EC4899' },
  { id: 'bills', label: 'Bills', iconName: 'receipt', color: '#EF4444' },
];

// Check-ins (habit tracking)
const CHECK_INS = [
  { id: 'water', label: 'Drink Water', iconName: 'water' },
  { id: 'workout', label: 'Workout', iconName: 'fitness' },
  { id: 'no_spend', label: 'No Spend', iconName: 'wallet' },
];

export default function AddExpenseScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [type, setType] = useState<'expense' | 'habit'>('expense');
  const [amount, setAmount] = useState('50.00');
  const [selectedCategory, setSelectedCategory] = useState<any>(QUICK_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;
    if (num === 'backspace') {
      setAmount(amount.length > 1 ? amount.slice(0, -1) : '0');
    } else {
      setAmount(amount === '0' ? num : amount + num);
    }
  };

  const handleSave = async () => {
    if (type === 'habit') {
      // Handle habit check-in
      Alert.alert('Success! 🎉', 'Habit logged successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    // Validate
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      await dispatch(
        addTransaction({
          type: 'expense',
          amount: amountNum,
          categoryId: selectedCategory.id,
          categoryLabel: selectedCategory.label,
          categoryIcon: selectedCategory.icon,
          date: new Date().toISOString(),
          source: 'manual',
        })
      ).unwrap();

      await dispatch(awardPoints(POINTS.LOG_EXPENSE));
      await dispatch(updateStreak());

      Alert.alert('Success! 🎉', 'Expense logged successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to add transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Log</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Type Toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, type === 'habit' && styles.typeButtonActive]}
            onPress={() => setType('habit')}
          >
            <Text style={[styles.typeText, type === 'habit' && styles.typeTextActive]}>
              Habit
            </Text>
          </TouchableOpacity>
        </View>

        {type === 'expense' ? (
          <>
            {/* Amount Display */}
            <View style={styles.amountSection}>
              <Text style={styles.amountDisplay}>${amount}</Text>
              <View style={styles.onDeviceBadge}>
                <View style={styles.lockIcon}>
                  <Text style={styles.lockEmoji}>🔒</Text>
                </View>
                <Text style={styles.onDeviceText}>ON-DEVICE ONLY</Text>
              </View>
            </View>

            {/* Quick Select Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>QUICK SELECT</Text>
              <View style={styles.quickCategories}>
                {QUICK_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.label}
                    style={[
                      styles.quickCategoryButton,
                      { backgroundColor: cat.color + '20' },
                      selectedCategory?.label === cat.label && {
                        backgroundColor: cat.color + '40',
                        borderWidth: 2,
                        borderColor: cat.color,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Ionicons name={cat.iconName as any} size={24} color={cat.color} />
                    <Text style={styles.quickCategoryLabel}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Number Pad */}
            <View style={styles.numberPad}>
              <View style={styles.numberRow}>
                {['1', '2', '3'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.numberButton}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={styles.numberText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.numberRow}>
                {['4', '5', '6'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.numberButton}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={styles.numberText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.numberRow}>
                {['7', '8', '9'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={styles.numberButton}
                    onPress={() => handleNumberPress(num)}
                  >
                    <Text style={styles.numberText}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.numberRow}>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => handleNumberPress('.')}
                >
                  <Text style={styles.numberText}>.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => handleNumberPress('0')}
                >
                  <Text style={styles.numberText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.numberButton}
                  onPress={() => handleNumberPress('backspace')}
                >
                  <Text style={styles.numberText}>⌫</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          // Habit Check-ins
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CHECK-INS</Text>
            <View style={styles.checkIns}>
              {CHECK_INS.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={styles.checkInButton}
                  onPress={() => {}}
                >
                  <Text style={styles.checkInIcon}>{habit.icon}</Text>
                  <Text style={styles.checkInLabel}>{habit.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Log Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.logButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.logButtonText}>Log it ✓</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    padding: 4,
    marginBottom: SPACING.xl,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  amountSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  amountDisplay: {
    fontSize: 72,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  onDeviceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  lockIcon: {
    marginRight: SPACING.xs,
  },
  lockEmoji: {
    fontSize: 12,
  },
  onDeviceText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  quickCategories: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  quickCategoryButton: {
    flex: 1,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  quickCategoryIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  quickCategoryLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  checkIns: {
    gap: SPACING.md,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  checkInIcon: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  checkInLabel: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  numberPad: {
    gap: SPACING.md,
  },
  numberRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  numberButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numberText: {
    fontSize: 32,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  logButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
  },
});
