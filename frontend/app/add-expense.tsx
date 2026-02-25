// 💰 Add Expense/Income Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppDispatch } from '../src/store';
import { addTransaction } from '../src/features/expenseTracking/expenseSlice';
import { awardPoints, updateStreak } from '../src/features/gamification/gamificationSlice';
import { Button } from '../src/core/presentation/components/Button';
import { Input } from '../src/core/presentation/components/Input';
import { Card } from '../src/core/presentation/components/Card';
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

export default function AddExpenseScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSave = async () => {
    // Validation
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (!selectedCategory) {
      Alert.alert('Select Category', 'Please select a category');
      return;
    }

    setLoading(true);
    try {
      // Add transaction
      await dispatch(
        addTransaction({
          type,
          amount: parseFloat(amount),
          categoryId: selectedCategory.id,
          categoryLabel: selectedCategory.label,
          categoryIcon: selectedCategory.icon,
          note: note.trim() || undefined,
          date: new Date().toISOString(),
          source: 'manual',
        })
      ).unwrap();

      // Award points and update streak
      await dispatch(awardPoints(type === 'expense' ? POINTS.LOG_EXPENSE : POINTS.LOG_INCOME));
      await dispatch(updateStreak());

      // Show success feedback
      Alert.alert(
        'Success! 🎉',
        `${type === 'expense' ? 'Expense' : 'Income'} logged successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to add transaction:', error);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Type Selector */}
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
              onPress={() => {
                setType('expense');
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[styles.typeText, type === 'expense' && styles.typeTextActive]}
              >
                💸 Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
              onPress={() => {
                setType('income');
                setSelectedCategory(null);
              }}
            >
              <Text
                style={[styles.typeText, type === 'income' && styles.typeTextActive]}
              >
                💰 Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <Card style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <Input
                placeholder="0"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.amountInput}
                containerStyle={styles.amountInputWrapper}
              />
            </View>
          </Card>

          {/* Category Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Category</Text>
            <View style={styles.categoriesGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category)}
                  activeOpacity={0.7}
                >
                  <Card
                    style={[
                      styles.categoryCard,
                      selectedCategory?.id === category.id && styles.categoryCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryIconContainer,
                        { backgroundColor: category.color + '20' },
                        selectedCategory?.id === category.id && {
                          backgroundColor: category.color + '40',
                        },
                      ]}
                    >
                      <Text style={styles.categoryIcon}>{category.icon}</Text>
                    </View>
                    <Text style={styles.categoryLabel} numberOfLines={2}>
                      {category.label}
                    </Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Add Note (Optional)</Text>
            <Input
              placeholder="e.g., Lunch at café"
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              style={styles.noteInput}
            />
          </View>

          {/* Save Button */}
          <Button
            title={`Save ${type === 'expense' ? 'Expense' : 'Income'}`}
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
            fullWidth
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: FONT_SIZE.xxl,
    color: COLORS.textPrimary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
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
  typeSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '20',
  },
  typeText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.primary,
  },
  amountCard: {
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  amountLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  amountInputWrapper: {
    flex: 1,
  },
  amountInput: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    padding: 0,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  categoryCard: {
    width: (360 - SPACING.lg * 2 - SPACING.md * 2) / 3, // Approximate width for 3 columns
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  categoryIcon: {
    fontSize: FONT_SIZE.xl,
  },
  categoryLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    height: 32, // Fixed height for 2 lines
  },
  noteInput: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  saveButton: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
