// 🧠 Smart Nudge Engine - Contextual, Witty, and Engaging
// Analyzes user behavior and delivers perfectly-timed nudges

import { Transaction } from '../data/models';

// ============================================
// TYPES & INTERFACES
// ============================================

export type NudgeTone = 'witty' | 'sarcastic' | 'appreciative' | 'motivational' | 'educational';

export type NudgeTrigger =
  // Time-based
  | 'morning_greeting'
  | 'midday_check'
  | 'evening_reflection'
  | 'late_night_warning'
  | 'weekend_vibes'
  | 'month_start'
  | 'month_end'
  | 'payday_detected'
  // Action-based
  | 'after_expense_small'
  | 'after_expense_medium'
  | 'after_expense_large'
  | 'after_expense_huge'
  | 'after_income'
  | 'after_first_log_today'
  | 'after_multiple_logs'
  | 'app_opened'
  | 'app_opened_after_absence'
  | 'challenge_completed'
  | 'badge_earned'
  | 'level_up'
  // Pattern-based
  | 'overspending_today'
  | 'underspending_today'
  | 'category_binge'
  | 'repeated_merchant'
  | 'weekend_splurge'
  | 'savings_improving'
  | 'savings_declining'
  | 'streak_at_risk'
  | 'no_spend_day'
  // Milestone-based
  | 'streak_3_days'
  | 'streak_7_days'
  | 'streak_14_days'
  | 'streak_30_days'
  | 'streak_broken'
  | 'goal_25_percent'
  | 'goal_50_percent'
  | 'goal_75_percent'
  | 'goal_achieved'
  | 'first_week_complete'
  | 'first_month_complete'
  | 'transaction_milestone';

export type NudgeLocation =
  | 'home_card'        // Main dashboard nudge card
  | 'post_log'         // After logging a transaction
  | 'app_greeting'     // On app open
  | 'streak_section'   // Near streak calendar
  | 'insights_screen'  // On insights page
  | 'challenge_screen' // On challenges page
  | 'notification';    // Push notification

export interface Nudge {
  id: string;
  trigger: NudgeTrigger;
  tone: NudgeTone;
  message: string;
  subtext?: string;
  emoji?: string;
  icon?: string;
  action?: {
    label: string;
    route: string;
  };
  conditions?: NudgeConditions;
  weight: number; // Higher = more likely to be selected
}

export interface NudgeConditions {
  minStreak?: number;
  maxStreak?: number;
  spendingLevel?: 'under' | 'normal' | 'over' | 'way_over';
  categoryMatch?: string;
  timeOfDay?: 'morning' | 'midday' | 'evening' | 'night';
  dayType?: 'weekday' | 'weekend';
  minTransactions?: number;
  isFirstLogToday?: boolean;
}

export interface NudgeContext {
  // Time Context
  timeOfDay: 'morning' | 'midday' | 'evening' | 'night';
  dayOfWeek: 'weekday' | 'weekend';
  dayOfMonth: number;
  hour: number;
  
  // User State
  currentStreak: number;
  streakStatus: 'active' | 'at_risk' | 'broken';
  hoursSinceLastLog: number;
  totalTransactions: number;
  userLevel: number;
  
  // Spending Context
  todaySpending: number;
  todayIncome: number;
  avgDailySpending: number;
  spendingLevel: 'under' | 'normal' | 'over' | 'way_over';
  weekSpending: number;
  monthSpending: number;
  topCategoryToday: string | null;
  categoryCounts: Record<string, number>;
  
  // Transaction Context (for post-log nudges)
  lastTransaction?: {
    type: 'expense' | 'income';
    amount: number;
    category: string;
    categoryLabel: string;
    isFirstToday: boolean;
    isRepeatCategory: boolean;
    merchantName?: string;
  };
  
  // Achievement Context
  recentBadge?: string;
  nearestMilestone?: {
    type: string;
    current: number;
    target: number;
    progress: number;
  };
  
  // Pattern Flags
  isImpulseTime: boolean;      // 11pm - 2am
  isPayday: boolean;           // Large income detected
  isNoSpendDay: boolean;       // No expenses today
  consecutiveSameCategory: number;
  daysWithoutLog: number;
}

export interface SelectedNudge extends Nudge {
  personalizedMessage: string;
  personalizedSubtext?: string;
}

// ============================================
// CONTEXT BUILDER
// ============================================

export function buildNudgeContext(
  transactions: Transaction[],
  gamification: {
    currentStreak: number;
    lastLogDate: string | null;
    totalTransactions: number;
    level: number;
    badges: string[];
  }
): NudgeContext {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  
  // Time of day
  let timeOfDay: NudgeContext['timeOfDay'];
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'midday';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  // Today's transactions
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayTransactions = transactions.filter(t => 
    new Date(t.date) >= todayStart
  );
  
  const todayExpenses = todayTransactions.filter(t => t.type === 'expense');
  const todayIncomeTransactions = todayTransactions.filter(t => t.type === 'income');
  
  const todaySpending = todayExpenses.reduce((sum, t) => sum + t.amount, 0);
  const todayIncome = todayIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate average daily spending (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const last30DaysExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const avgDailySpending = last30DaysExpenses / 30;
  
  // Spending level comparison
  let spendingLevel: NudgeContext['spendingLevel'];
  if (avgDailySpending === 0) {
    spendingLevel = 'normal';
  } else {
    const ratio = todaySpending / avgDailySpending;
    if (ratio < 0.5) spendingLevel = 'under';
    else if (ratio <= 1.2) spendingLevel = 'normal';
    else if (ratio <= 2) spendingLevel = 'over';
    else spendingLevel = 'way_over';
  }
  
  // Week and month spending
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  const weekSpending = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= weekStart)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthSpending = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Category analysis for today
  const categoryCounts: Record<string, number> = {};
  todayExpenses.forEach(t => {
    categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
  });
  
  const topCategoryToday = Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
  
  // Hours since last log
  let hoursSinceLastLog = 999;
  if (gamification.lastLogDate) {
    const lastLog = new Date(gamification.lastLogDate);
    hoursSinceLastLog = (now.getTime() - lastLog.getTime()) / (1000 * 60 * 60);
  }
  
  // Streak status
  let streakStatus: NudgeContext['streakStatus'];
  if (gamification.currentStreak === 0) {
    streakStatus = 'broken';
  } else if (hoursSinceLastLog > 20 && hour >= 20) {
    streakStatus = 'at_risk';
  } else {
    streakStatus = 'active';
  }
  
  // Consecutive same category
  let consecutiveSameCategory = 0;
  if (todayExpenses.length >= 2) {
    const lastCategory = todayExpenses[todayExpenses.length - 1]?.categoryId;
    for (let i = todayExpenses.length - 1; i >= 0; i--) {
      if (todayExpenses[i].categoryId === lastCategory) {
        consecutiveSameCategory++;
      } else {
        break;
      }
    }
  }
  
  // Days without log
  const daysWithoutLog = Math.floor(hoursSinceLastLog / 24);
  
  // Is payday (large income today)
  const isPayday = todayIncome >= 10000;
  
  return {
    timeOfDay,
    dayOfWeek: dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'weekday',
    dayOfMonth,
    hour,
    currentStreak: gamification.currentStreak,
    streakStatus,
    hoursSinceLastLog,
    totalTransactions: gamification.totalTransactions,
    userLevel: gamification.level,
    todaySpending,
    todayIncome,
    avgDailySpending,
    spendingLevel,
    weekSpending,
    monthSpending,
    topCategoryToday,
    categoryCounts,
    isImpulseTime: hour >= 23 || hour < 2,
    isPayday,
    isNoSpendDay: todayExpenses.length === 0,
    consecutiveSameCategory,
    daysWithoutLog,
  };
}

// ============================================
// TRIGGER DETECTION
// ============================================

export function detectTriggers(context: NudgeContext): NudgeTrigger[] {
  const triggers: NudgeTrigger[] = [];
  
  // Time-based triggers
  if (context.timeOfDay === 'morning') triggers.push('morning_greeting');
  if (context.timeOfDay === 'midday') triggers.push('midday_check');
  if (context.timeOfDay === 'evening') triggers.push('evening_reflection');
  if (context.isImpulseTime) triggers.push('late_night_warning');
  if (context.dayOfWeek === 'weekend') triggers.push('weekend_vibes');
  if (context.dayOfMonth <= 3) triggers.push('month_start');
  if (context.dayOfMonth >= 28) triggers.push('month_end');
  if (context.isPayday) triggers.push('payday_detected');
  
  // Pattern-based triggers
  if (context.spendingLevel === 'over') triggers.push('overspending_today');
  if (context.spendingLevel === 'way_over') triggers.push('overspending_today');
  if (context.spendingLevel === 'under') triggers.push('underspending_today');
  if (context.consecutiveSameCategory >= 3) triggers.push('category_binge');
  if (context.streakStatus === 'at_risk') triggers.push('streak_at_risk');
  if (context.isNoSpendDay && context.timeOfDay === 'evening') triggers.push('no_spend_day');
  if (context.spendingLevel === 'under') triggers.push('savings_improving');
  
  // Milestone triggers
  if (context.currentStreak === 3) triggers.push('streak_3_days');
  if (context.currentStreak === 7) triggers.push('streak_7_days');
  if (context.currentStreak === 14) triggers.push('streak_14_days');
  if (context.currentStreak === 30) triggers.push('streak_30_days');
  if (context.streakStatus === 'broken' && context.daysWithoutLog > 1) triggers.push('streak_broken');
  
  // Absence trigger
  if (context.daysWithoutLog >= 1) triggers.push('app_opened_after_absence');
  
  // Default
  triggers.push('app_opened');
  
  return triggers;
}

export function detectPostLogTrigger(
  context: NudgeContext,
  transaction: NonNullable<NudgeContext['lastTransaction']>
): NudgeTrigger[] {
  const triggers: NudgeTrigger[] = [];
  
  if (transaction.type === 'income') {
    triggers.push('after_income');
    if (transaction.amount >= 10000) triggers.push('payday_detected');
  } else {
    // Expense triggers based on amount
    if (transaction.amount < 100) triggers.push('after_expense_small');
    else if (transaction.amount < 1000) triggers.push('after_expense_medium');
    else if (transaction.amount < 5000) triggers.push('after_expense_large');
    else triggers.push('after_expense_huge');
    
    // First log of the day
    if (transaction.isFirstToday) triggers.push('after_first_log_today');
    
    // Category binge
    if (transaction.isRepeatCategory && context.consecutiveSameCategory >= 2) {
      triggers.push('category_binge');
    }
    
    // Late night spending
    if (context.isImpulseTime) triggers.push('late_night_warning');
  }
  
  // Check for multiple logs today
  const todayCount = Object.values(context.categoryCounts).reduce((a, b) => a + b, 0);
  if (todayCount >= 3) triggers.push('after_multiple_logs');
  
  return triggers;
}

// ============================================
// TONE SELECTION
// ============================================

export function selectTone(trigger: NudgeTrigger, context: NudgeContext): NudgeTone {
  // Sarcastic tones for "bad" behavior
  const sarcasticTriggers: NudgeTrigger[] = [
    'overspending_today',
    'category_binge',
    'late_night_warning',
    'after_expense_huge',
    'weekend_splurge',
  ];
  
  // Appreciative tones for achievements
  const appreciativeTriggers: NudgeTrigger[] = [
    'streak_7_days',
    'streak_14_days',
    'streak_30_days',
    'challenge_completed',
    'badge_earned',
    'level_up',
    'goal_achieved',
    'no_spend_day',
    'savings_improving',
    'first_week_complete',
    'first_month_complete',
  ];
  
  // Motivational tones for recovery/near-goals
  const motivationalTriggers: NudgeTrigger[] = [
    'streak_broken',
    'app_opened_after_absence',
    'streak_at_risk',
    'goal_25_percent',
    'goal_50_percent',
    'goal_75_percent',
  ];
  
  if (sarcasticTriggers.includes(trigger)) return 'sarcastic';
  if (appreciativeTriggers.includes(trigger)) return 'appreciative';
  if (motivationalTriggers.includes(trigger)) return 'motivational';
  
  // Context-based tone selection for neutral triggers
  if (context.currentStreak >= 7) return 'appreciative';
  if (context.daysWithoutLog >= 3) return 'motivational';
  if (context.spendingLevel === 'way_over') return 'sarcastic';
  
  return 'witty';
}

// ============================================
// NUDGE SELECTION & PERSONALIZATION
// ============================================

export function selectNudge(
  nudges: Nudge[],
  triggers: NudgeTrigger[],
  context: NudgeContext,
  location: NudgeLocation
): SelectedNudge | null {
  // Filter nudges by trigger
  let matchingNudges = nudges.filter(n => triggers.includes(n.trigger));
  
  if (matchingNudges.length === 0) {
    // Fallback to generic nudges
    matchingNudges = nudges.filter(n => n.trigger === 'app_opened');
  }
  
  if (matchingNudges.length === 0) return null;
  
  // Filter by conditions
  matchingNudges = matchingNudges.filter(n => {
    if (!n.conditions) return true;
    
    const c = n.conditions;
    if (c.minStreak !== undefined && context.currentStreak < c.minStreak) return false;
    if (c.maxStreak !== undefined && context.currentStreak > c.maxStreak) return false;
    if (c.spendingLevel && context.spendingLevel !== c.spendingLevel) return false;
    if (c.timeOfDay && context.timeOfDay !== c.timeOfDay) return false;
    if (c.dayType && context.dayOfWeek !== c.dayType) return false;
    if (c.minTransactions !== undefined && context.totalTransactions < c.minTransactions) return false;
    
    return true;
  });
  
  if (matchingNudges.length === 0) return null;
  
  // Weighted random selection
  const totalWeight = matchingNudges.reduce((sum, n) => sum + n.weight, 0);
  let random = Math.random() * totalWeight;
  
  let selected: Nudge | null = null;
  for (const nudge of matchingNudges) {
    random -= nudge.weight;
    if (random <= 0) {
      selected = nudge;
      break;
    }
  }
  
  if (!selected) selected = matchingNudges[0];
  
  // Personalize the message
  const personalizedMessage = personalizeMessage(selected.message, context);
  const personalizedSubtext = selected.subtext 
    ? personalizeMessage(selected.subtext, context) 
    : undefined;
  
  return {
    ...selected,
    personalizedMessage,
    personalizedSubtext,
  };
}

function personalizeMessage(message: string, context: NudgeContext): string {
  return message
    .replace('{streak}', context.currentStreak.toString())
    .replace('{todaySpending}', `₹${context.todaySpending.toLocaleString()}`)
    .replace('{weekSpending}', `₹${context.weekSpending.toLocaleString()}`)
    .replace('{monthSpending}', `₹${context.monthSpending.toLocaleString()}`)
    .replace('{avgDaily}', `₹${Math.round(context.avgDailySpending).toLocaleString()}`)
    .replace('{topCategory}', context.topCategoryToday || 'spending')
    .replace('{level}', context.userLevel.toString())
    .replace('{transactions}', context.totalTransactions.toString())
    .replace('{daysAway}', context.daysWithoutLog.toString())
    .replace('{lastAmount}', context.lastTransaction ? `₹${context.lastTransaction.amount.toLocaleString()}` : '')
    .replace('{lastCategory}', context.lastTransaction?.categoryLabel || '')
    .replace('{consecutiveCategory}', context.consecutiveSameCategory.toString());
}

// ============================================
// NUDGE REGISTRY (User will populate this)
// ============================================

export const NUDGE_REGISTRY: Nudge[] = [
  // ===== PLACEHOLDER NUDGES =====
  // These will be replaced with user's witty content
  
  // Morning Greetings
  {
    id: 'morning_1',
    trigger: 'morning_greeting',
    tone: 'witty',
    message: "Good morning! Ready to make your wallet proud today?",
    emoji: '☀️',
    weight: 10,
  },
  
  // App Opened
  {
    id: 'app_open_1',
    trigger: 'app_opened',
    tone: 'witty',
    message: "Welcome back! Your money missed you.",
    emoji: '👋',
    weight: 10,
  },
  
  // After Absence
  {
    id: 'absence_1',
    trigger: 'app_opened_after_absence',
    tone: 'motivational',
    message: "It's been {daysAway} days! Let's get back on track.",
    subtext: "Every comeback story starts with showing up.",
    emoji: '🔥',
    weight: 10,
  },
  
  // Overspending
  {
    id: 'overspend_1',
    trigger: 'overspending_today',
    tone: 'sarcastic',
    message: "Whoa there, big spender! {todaySpending} already?",
    subtext: "Your average is {avgDaily}. Just saying.",
    emoji: '😅',
    weight: 10,
  },
  
  // Streak Milestones
  {
    id: 'streak_7_1',
    trigger: 'streak_7_days',
    tone: 'appreciative',
    message: "🎉 7-day streak! You're officially committed!",
    subtext: "Most people quit by day 3. Not you.",
    emoji: '🔥',
    weight: 10,
  },
  
  // Late Night Warning
  {
    id: 'late_night_1',
    trigger: 'late_night_warning',
    tone: 'sarcastic',
    message: "Shopping at this hour? Nothing good happens after midnight.",
    emoji: '🌙',
    weight: 10,
  },
  
  // Category Binge
  {
    id: 'category_binge_1',
    trigger: 'category_binge',
    tone: 'sarcastic',
    message: "{consecutiveCategory}x {lastCategory} today? Sensing a pattern here.",
    emoji: '🤔',
    weight: 10,
  },
  
  // No Spend Day
  {
    id: 'no_spend_1',
    trigger: 'no_spend_day',
    tone: 'appreciative',
    message: "Zero spending today! Your future self is sending a thank you note.",
    emoji: '💪',
    weight: 10,
  },
  
  // Post Small Expense
  {
    id: 'small_expense_1',
    trigger: 'after_expense_small',
    tone: 'witty',
    message: "Small wins! {lastAmount} logged. Every rupee counts.",
    emoji: '✨',
    weight: 10,
  },
  
  // Post Large Expense
  {
    id: 'large_expense_1',
    trigger: 'after_expense_large',
    tone: 'sarcastic',
    message: "{lastAmount}? That's a big one! Hope it was worth it.",
    emoji: '💸',
    weight: 10,
  },
  
  // Streak Broken
  {
    id: 'streak_broken_1',
    trigger: 'streak_broken',
    tone: 'motivational',
    message: "Streak broken? Every master was once a disaster. Start fresh!",
    emoji: '🌱',
    action: {
      label: 'Log Now',
      route: '/add-expense',
    },
    weight: 10,
  },
  
  // Payday
  {
    id: 'payday_1',
    trigger: 'payday_detected',
    tone: 'witty',
    message: "Payday vibes! 💰 Remember: Budget first, YOLO second.",
    emoji: '🤑',
    weight: 10,
  },
];

// ============================================
// MAIN API
// ============================================

export function getNudgeForHome(
  transactions: Transaction[],
  gamification: Parameters<typeof buildNudgeContext>[1]
): SelectedNudge | null {
  const context = buildNudgeContext(transactions, gamification);
  const triggers = detectTriggers(context);
  return selectNudge(NUDGE_REGISTRY, triggers, context, 'home_card');
}

export function getNudgeForPostLog(
  transactions: Transaction[],
  gamification: Parameters<typeof buildNudgeContext>[1],
  lastTransaction: NonNullable<NudgeContext['lastTransaction']>
): SelectedNudge | null {
  const context = buildNudgeContext(transactions, gamification);
  context.lastTransaction = lastTransaction;
  const triggers = detectPostLogTrigger(context, lastTransaction);
  return selectNudge(NUDGE_REGISTRY, triggers, context, 'post_log');
}

export function getNudgeForStreak(
  transactions: Transaction[],
  gamification: Parameters<typeof buildNudgeContext>[1]
): SelectedNudge | null {
  const context = buildNudgeContext(transactions, gamification);
  
  // Only streak-related triggers
  const streakTriggers: NudgeTrigger[] = [];
  if (context.streakStatus === 'at_risk') streakTriggers.push('streak_at_risk');
  if (context.currentStreak === 3) streakTriggers.push('streak_3_days');
  if (context.currentStreak === 7) streakTriggers.push('streak_7_days');
  if (context.currentStreak === 14) streakTriggers.push('streak_14_days');
  if (context.currentStreak === 30) streakTriggers.push('streak_30_days');
  if (context.streakStatus === 'broken') streakTriggers.push('streak_broken');
  
  if (streakTriggers.length === 0) return null;
  
  return selectNudge(NUDGE_REGISTRY, streakTriggers, context, 'streak_section');
}
