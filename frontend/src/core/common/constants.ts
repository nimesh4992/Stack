// 🎨 App Constants - Colors, Categories, and Configuration

export const COLORS = {
  // Primary palette (The Dojo style)
  primary: '#2E5CFF',        // Vibrant blue
  primaryDark: '#1E3FCC',    // Darker blue
  primaryLight: '#6B8AFF',   // Light blue
  
  // Accent colors
  accent: '#FF6B6B',         // Coral red
  accentDark: '#EE5A52',     // Darker coral
  accentLight: '#FF8787',    // Light coral
  
  // Semantic colors
  success: '#00D4AA',        // Cyan/teal
  warning: '#FFB800',        // Yellow
  danger: '#FF4757',         // Red
  info: '#2E5CFF',           // Blue
  
  // Habit ring colors
  habitBlue: '#2E5CFF',      // Blue ring
  habitCyan: '#00D4AA',      // Cyan ring
  habitPurple: '#7C3AED',    // Purple ring
  habitOrange: '#FF9A3C',    // Orange ring
  habitPink: '#EC4899',      // Pink ring
  
  // Neutral colors (light mode) - The Dojo style
  background: '#F7F8FC',     // Very light blue-gray
  surface: '#FFFFFF',        // White
  surfaceAlt: '#F0F2F9',     // Light purple tint
  surfaceTint: '#F7F9FF',    // Very light blue tint
  border: '#E2E5F1',         // Subtle border
  
  // Text colors (light mode)
  textPrimary: '#0A0B14',    // Almost black
  textSecondary: '#6B7280',  // Medium gray
  textTertiary: '#9CA3AF',   // Light gray
  
  // Dark mode colors
  backgroundDark: '#0A0B14',     // Very dark blue-black
  surfaceDark: '#1A1B2E',        // Dark blue-gray
  surfaceAltDark: '#252640',     // Medium dark
  borderDark: '#2A2B3F',         // Dark border
  
  textPrimaryDark: '#F7F8FC',    // Almost white
  textSecondaryDark: '#B4B7C9',  // Light gray-blue
  textTertiaryDark: '#7C7F93',   // Medium gray
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
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
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
