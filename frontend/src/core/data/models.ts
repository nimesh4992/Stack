// 📦 Data Models & TypeScript Interfaces

// 👤 User Profile
export interface UserProfile {
  id: string;
  name: string;
  personality: 'saver' | 'balanced' | 'spontaneous';
  primaryGoal: 'save' | 'reduce' | 'invest' | 'debt';
  monthlyTarget: number;
  createdAt: string;
}

// 💸 Transaction (Expense or Income)
export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId: string;
  categoryLabel: string;
  categoryIcon: string;
  note?: string;
  date: string;
  createdAt: string;
  // For SMS parsed transactions
  source?: 'manual' | 'sms';
  merchantName?: string;
  bankName?: string;
}

// 🎮 Gamification Data
export interface GamificationState {
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastLogDate: string | null;
  badges: string[]; // Array of badge IDs earned
  totalTransactions: number;
}

// 📊 Daily Summary
export interface DailySummary {
  date: string;
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  transactionCount: number;
}

// 🎯 Goal Progress
export interface GoalProgress {
  targetAmount: number;
  savedAmount: number;
  percentage: number;
  remainingDays: number;
}
