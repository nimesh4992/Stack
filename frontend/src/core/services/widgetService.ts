// 📱 Widget Configuration for Stack App
// Home screen widgets for quick access to app features

import { Platform } from 'react-native';

// Widget types supported by Stack
export type WidgetType = 
  | 'quick_expense'      // Quick log expense widget
  | 'daily_summary'      // Today's spending summary
  | 'streak_counter'     // Current streak display
  | 'habit_rings'        // Habit progress rings
  | 'budget_progress';   // Budget utilization

export interface WidgetConfig {
  id: WidgetType;
  name: string;
  description: string;
  sizes: ('small' | 'medium' | 'large')[];
  previewImage: string;
  defaultSize: 'small' | 'medium' | 'large';
  refreshInterval: number; // in minutes
  requiresAuth: boolean;
}

// Available widgets configuration
export const WIDGETS: WidgetConfig[] = [
  {
    id: 'quick_expense',
    name: 'Quick Log',
    description: 'Log expenses with one tap. Shows recent categories for quick access.',
    sizes: ['small', 'medium'],
    previewImage: 'widget_quick_expense',
    defaultSize: 'medium',
    refreshInterval: 0, // No refresh needed
    requiresAuth: false,
  },
  {
    id: 'daily_summary',
    name: 'Daily Summary',
    description: 'View today\'s total spending at a glance with category breakdown.',
    sizes: ['small', 'medium', 'large'],
    previewImage: 'widget_daily_summary',
    defaultSize: 'medium',
    refreshInterval: 15,
    requiresAuth: false,
  },
  {
    id: 'streak_counter',
    name: 'Streak Counter',
    description: 'Keep your streak visible! Shows current streak with fire animation.',
    sizes: ['small'],
    previewImage: 'widget_streak',
    defaultSize: 'small',
    refreshInterval: 60,
    requiresAuth: false,
  },
  {
    id: 'habit_rings',
    name: 'Habit Rings',
    description: 'Track your daily habits progress with beautiful activity rings.',
    sizes: ['small', 'medium'],
    previewImage: 'widget_habits',
    defaultSize: 'small',
    refreshInterval: 30,
    requiresAuth: false,
  },
  {
    id: 'budget_progress',
    name: 'Budget Tracker',
    description: 'See how much of your monthly budget remains with visual progress bar.',
    sizes: ['small', 'medium'],
    previewImage: 'widget_budget',
    defaultSize: 'medium',
    refreshInterval: 60,
    requiresAuth: false,
  },
];

// Widget dimensions by size (in dp)
export const WIDGET_DIMENSIONS = {
  small: { width: 110, height: 110 },
  medium: { width: 250, height: 110 },
  large: { width: 250, height: 250 },
};

// Get widget by ID
export const getWidgetConfig = (id: WidgetType): WidgetConfig | undefined => {
  return WIDGETS.find(w => w.id === id);
};

// Check if widgets are supported on current platform
export const areWidgetsSupported = (): boolean => {
  // Widgets require native implementation
  // Only available in development builds with native modules
  return Platform.OS === 'ios' || Platform.OS === 'android';
};

// Get platform-specific widget instructions
export const getWidgetInstructions = (): string => {
  if (Platform.OS === 'ios') {
    return `To add Stack widgets:
1. Long press on your home screen
2. Tap the + button in the top-left
3. Search for "Stack"
4. Choose a widget size and tap "Add Widget"
5. Long press the widget to configure it`;
  } else if (Platform.OS === 'android') {
    return `To add Stack widgets:
1. Long press on your home screen
2. Tap "Widgets"
3. Find "Stack" in the list
4. Long press and drag the widget to your home screen
5. Resize if needed`;
  }
  return 'Widgets are not available on web.';
};

// Widget data structure for native bridge
export interface WidgetData {
  quickExpense: {
    recentCategories: { id: string; icon: string; label: string }[];
  };
  dailySummary: {
    totalSpent: number;
    budget: number;
    currency: string;
    topCategories: { id: string; amount: number; percentage: number }[];
  };
  streakCounter: {
    currentStreak: number;
    longestStreak: number;
    lastLogDate: string;
  };
  habitRings: {
    steps: { current: number; goal: number; percentage: number };
    water: { current: number; goal: number; percentage: number };
    mindful: { current: number; goal: number; percentage: number };
  };
  budgetProgress: {
    spent: number;
    budget: number;
    remaining: number;
    percentage: number;
    daysLeft: number;
  };
}

// Generate widget data from app state
export const generateWidgetData = (state: any): WidgetData => {
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today.getDate();
  
  const todayExpenses = state.expense?.transactions?.filter((t: any) => {
    return t.date === today.toISOString().split('T')[0] && t.type === 'expense';
  }) || [];
  
  const totalSpent = todayExpenses.reduce((sum: number, t: any) => sum + t.amount, 0);
  const budget = state.onboarding?.userProfile?.monthlyTarget || 50000;
  
  const habits = state.habits?.dailyData?.[today.toISOString().split('T')[0]] || {
    steps: 0, stepsGoal: 10000,
    water: 0, waterGoal: 8,
    mindfulMinutes: 0, mindfulGoal: 15,
  };
  
  return {
    quickExpense: {
      recentCategories: [
        { id: 'food', icon: '🍔', label: 'Food' },
        { id: 'transport', icon: '🚗', label: 'Transport' },
        { id: 'shopping', icon: '🛍️', label: 'Shopping' },
      ],
    },
    dailySummary: {
      totalSpent,
      budget,
      currency: '₹',
      topCategories: [],
    },
    streakCounter: {
      currentStreak: state.gamification?.currentStreak || 0,
      longestStreak: state.gamification?.longestStreak || 0,
      lastLogDate: today.toISOString().split('T')[0],
    },
    habitRings: {
      steps: {
        current: habits.steps,
        goal: habits.stepsGoal,
        percentage: Math.min(100, (habits.steps / habits.stepsGoal) * 100),
      },
      water: {
        current: habits.water,
        goal: habits.waterGoal,
        percentage: Math.min(100, (habits.water / habits.waterGoal) * 100),
      },
      mindful: {
        current: habits.mindfulMinutes,
        goal: habits.mindfulGoal,
        percentage: Math.min(100, (habits.mindfulMinutes / habits.mindfulGoal) * 100),
      },
    },
    budgetProgress: {
      spent: totalSpent,
      budget,
      remaining: Math.max(0, budget - totalSpent),
      percentage: Math.min(100, (totalSpent / budget) * 100),
      daysLeft,
    },
  };
};
