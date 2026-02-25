// 🎨 App Constants - Colors, Categories, and Configuration

export const COLORS = {
  // Primary palette
  primary: '#10B981',        // Emerald green - savings/growth
  primaryDark: '#059669',    // Darker emerald
  primaryLight: '#6EE7B7',   // Light emerald
  
  // Accent colors
  accent: '#F59E0B',         // Warm orange - alerts/spending
  accentDark: '#D97706',     // Darker orange
  accentLight: '#FCD34D',    // Light orange
  
  // Semantic colors
  success: '#10B981',        // Green
  warning: '#F59E0B',        // Amber
  danger: '#EF4444',         // Soft red
  info: '#3B82F6',           // Blue
  
  // Neutral colors (light mode)
  background: '#F3F4F6',     // Cool gray
  surface: '#FFFFFF',        // White
  surfaceAlt: '#F9FAFB',     // Off-white
  border: '#E5E7EB',         // Light gray border
  
  // Text colors (light mode)
  textPrimary: '#111827',    // Almost black
  textSecondary: '#6B7280',  // Medium gray
  textTertiary: '#9CA3AF',   // Light gray
  
  // Dark mode colors
  backgroundDark: '#111827',     // Almost black
  surfaceDark: '#1F2937',        // Dark gray
  surfaceAltDark: '#374151',     // Medium dark gray
  borderDark: '#4B5563',         // Dark border
  
  textPrimaryDark: '#F9FAFB',    // Almost white
  textSecondaryDark: '#D1D5DB',  // Light gray
  textTertiaryDark: '#9CA3AF',   // Medium gray
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// 💰 Expense Categories
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Food & Dining', icon: '🍔', color: '#F59E0B' },
  { id: 'transport', label: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 'shopping', label: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'bills', label: 'Bills & Utilities', icon: '💡', color: '#EF4444' },
  { id: 'health', label: 'Health', icon: '🏥', color: '#10B981' },
  { id: 'education', label: 'Education', icon: '📚', color: '#06B6D4' },
  { id: 'other', label: 'Other', icon: '📦', color: '#6B7280' },
];

// 💵 Income Categories
export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: '💼', color: '#10B981' },
  { id: 'freelance', label: 'Freelance', icon: '💻', color: '#3B82F6' },
  { id: 'investment', label: 'Investment', icon: '📈', color: '#8B5CF6' },
  { id: 'gift', label: 'Gift', icon: '🎁', color: '#EC4899' },
  { id: 'other', label: 'Other', icon: '💰', color: '#6B7280' },
];

// 🎯 Onboarding Quiz Questions
export const QUIZ_QUESTIONS = [
  {
    id: 'personality',
    question: 'What describes your spending style best?',
    options: [
      { id: 'saver', label: 'Cautious Saver', desc: 'I track every rupee', emoji: '🐢' },
      { id: 'balanced', label: 'Balanced Spender', desc: 'I spend mindfully', emoji: '⚖️' },
      { id: 'spontaneous', label: 'Spontaneous', desc: 'I enjoy life now', emoji: '🎈' },
    ],
  },
  {
    id: 'goal',
    question: 'What\'s your primary financial goal?',
    options: [
      { id: 'save', label: 'Build Savings', desc: 'Emergency fund & future', emoji: '🏦' },
      { id: 'reduce', label: 'Reduce Expenses', desc: 'Cut unnecessary costs', emoji: '✂️' },
      { id: 'invest', label: 'Start Investing', desc: 'Grow my wealth', emoji: '📈' },
      { id: 'debt', label: 'Pay Off Debt', desc: 'Become debt-free', emoji: '💳' },
    ],
  },
  {
    id: 'target',
    question: 'How much do you want to save this month?',
    type: 'amount',
    placeholder: 'Enter amount in ₹',
  },
];

// 🎮 Gamification Constants
export const POINTS = {
  LOG_EXPENSE: 10,
  LOG_INCOME: 10,
  DAILY_STREAK: 5,
  WEEKLY_GOAL_MET: 50,
  MONTHLY_GOAL_MET: 200,
  COMPLETE_QUIZ: 20,
};

export const BADGES = [
  { id: 'first_log', name: 'First Step', desc: 'Logged your first transaction', emoji: '🌱', pointsRequired: 0 },
  { id: 'week_streak', name: 'Week Warrior', desc: '7-day logging streak', emoji: '🔥', pointsRequired: 100 },
  { id: 'saver', name: 'Super Saver', desc: 'Met monthly savings goal', emoji: '💎', pointsRequired: 500 },
];

// 📱 Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  EXPENSES: 'expenses',
  INCOME: 'income',
  GAMIFICATION: 'gamification',
  THEME: 'theme_preference',
};
