// 🧠 Smart Nudge Engine - Contextual, Witty, and Engaging
// Analyzes user behavior and delivers perfectly-timed nudges

import { Transaction } from '../data/models';

// ============================================
// TYPES & INTERFACES
// ============================================

export type NudgeTone = 'witty' | 'sarcastic' | 'appreciative' | 'motivational' | 'sentimental' | 'educational';

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
  // Budget Triggers
  | 'daily_budget_exceeded'
  | 'budget_under_spent'
  | 'budget_under_spent_day'
  // Category-specific Triggers
  | 'coffee_category_over'
  | 'coffee_daily_high'
  | 'cigarettes_over_week'
  | 'cigarettes_monthly_high'
  | 'delivery_food_over_week'
  | 'swiggy_zomato_daily_high'
  | 'high_delivery_spend_month'
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
  | 'streak_breaker_risk'
  | 'streak_breaker_avoided'
  | 'no_spend_day'
  | 'impulse_spend_detected'
  | 'high_spend_no_category'
  // Milestone-based
  | 'streak_3_days'
  | 'streak_5_days'
  | 'streak_7_days'
  | 'streak_14_days'
  | 'streak_30_days'
  | 'streak_milestone'
  | 'streak_broken'
  | 'goal_25_percent'
  | 'goal_50_percent'
  | 'goal_75_percent'
  | 'goal_achieved'
  | 'first_week_complete'
  | 'first_month_complete'
  | 'transaction_milestone'
  | 'monthly_savings_milestone'
  // Sentimental/Goal Triggers
  | 'family_goal_progress'
  | 'rainy_day_fund_growth';

export type NudgeLocation =
  | 'home_card'
  | 'post_log'
  | 'app_greeting'
  | 'streak_section'
  | 'insights_screen'
  | 'challenge_screen'
  | 'notification';

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
  weight: number;
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
  
  // Budget Context
  dailyBudgetLimit: number;
  todaySpending: number;
  todayIncome: number;
  avgDailySpending: number;
  spendingLevel: 'under' | 'normal' | 'over' | 'way_over';
  budgetOver: number; // Amount over budget
  budgetSaved: number; // Amount under budget
  
  // Weekly/Monthly
  weekSpending: number;
  monthSpending: number;
  monthSavings: number;
  
  // Category-Specific Tracking
  coffeeToday: number;
  coffeeWeek: number;
  coffeeCount: number;
  cigarettesWeek: number;
  cigarettesMonth: number;
  cigarettesPacks: number;
  deliveryToday: number;
  deliveryWeek: number;
  deliveryMonth: number;
  deliveryCount: number;
  deliveryFees: number;
  
  // Transaction Context
  topCategoryToday: string | null;
  categoryCounts: Record<string, number>;
  lastTransaction?: {
    type: 'expense' | 'income';
    amount: number;
    category: string;
    categoryLabel: string;
    isFirstToday: boolean;
    isRepeatCategory: boolean;
    merchantName?: string;
    hasCategory: boolean;
  };
  
  // Impulse Tracking
  impulseCount: number;
  impulseTotalMonth: number;
  
  // Achievement Context
  recentBadge?: string;
  nearestMilestone?: {
    type: string;
    current: number;
    target: number;
    progress: number;
  };
  
  // Goal Progress
  familyGoalProgress: number;
  rainyDayFundAdded: number;
  
  // Pattern Flags
  isImpulseTime: boolean;
  isPayday: boolean;
  isNoSpendDay: boolean;
  consecutiveSameCategory: number;
  daysWithoutLog: number;
  loggedToday: boolean;
}

export interface SelectedNudge extends Nudge {
  personalizedMessage: string;
  personalizedSubtext?: string;
}

// ============================================
// CATEGORY MAPPINGS
// ============================================

const COFFEE_CATEGORIES = ['coffee', 'cafe', 'starbucks', 'ccd'];
const CIGARETTE_CATEGORIES = ['cigarettes', 'smoking', 'tobacco'];
const DELIVERY_CATEGORIES = ['food', 'delivery', 'swiggy', 'zomato', 'uber_eats'];
const IMPULSE_CATEGORIES = ['shopping', 'entertainment', 'fun'];

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
  },
  userSettings?: {
    dailyBudgetLimit?: number;
    familyGoalTarget?: number;
    familyGoalSaved?: number;
    rainyDayFund?: number;
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
  
  // Date helpers
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  
  // Filter transactions by time period
  const todayTransactions = transactions.filter(t => new Date(t.date) >= todayStart);
  const weekTransactions = transactions.filter(t => new Date(t.date) >= weekStart);
  const monthTransactions = transactions.filter(t => new Date(t.date) >= monthStart);
  
  const todayExpenses = todayTransactions.filter(t => t.type === 'expense');
  const weekExpenses = weekTransactions.filter(t => t.type === 'expense');
  const monthExpenses = monthTransactions.filter(t => t.type === 'expense');
  
  // Basic spending calculations
  const todaySpending = todayExpenses.reduce((sum, t) => sum + t.amount, 0);
  const todayIncome = todayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const weekSpending = weekExpenses.reduce((sum, t) => sum + t.amount, 0);
  const monthSpending = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const monthSavings = monthIncome - monthSpending;
  
  // Average daily spending (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30DaysExpenses = transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
    .reduce((sum, t) => sum + t.amount, 0);
  const avgDailySpending = last30DaysExpenses / 30;
  
  // Daily budget tracking
  const dailyBudgetLimit = userSettings?.dailyBudgetLimit || 1000; // Default ₹1000
  const budgetOver = Math.max(0, todaySpending - dailyBudgetLimit);
  const budgetSaved = Math.max(0, dailyBudgetLimit - todaySpending);
  
  // Spending level comparison
  let spendingLevel: NudgeContext['spendingLevel'];
  if (avgDailySpending === 0) {
    spendingLevel = todaySpending > dailyBudgetLimit ? 'over' : 'normal';
  } else {
    const ratio = todaySpending / avgDailySpending;
    if (ratio < 0.5) spendingLevel = 'under';
    else if (ratio <= 1.2) spendingLevel = 'normal';
    else if (ratio <= 2) spendingLevel = 'over';
    else spendingLevel = 'way_over';
  }
  
  // Category-specific tracking helper
  const getCategorySpending = (categoryList: string[], txns: Transaction[]) => {
    return txns
      .filter(t => t.type === 'expense' && categoryList.some(c => 
        t.categoryId.toLowerCase().includes(c) || 
        t.categoryLabel?.toLowerCase().includes(c) ||
        t.merchantName?.toLowerCase().includes(c)
      ))
      .reduce((sum, t) => sum + t.amount, 0);
  };
  
  const getCategoryCount = (categoryList: string[], txns: Transaction[]) => {
    return txns.filter(t => t.type === 'expense' && categoryList.some(c => 
      t.categoryId.toLowerCase().includes(c) || 
      t.categoryLabel?.toLowerCase().includes(c) ||
      t.merchantName?.toLowerCase().includes(c)
    )).length;
  };
  
  // Coffee tracking
  const coffeeToday = getCategorySpending(COFFEE_CATEGORIES, todayExpenses);
  const coffeeWeek = getCategorySpending(COFFEE_CATEGORIES, weekExpenses);
  const coffeeCount = getCategoryCount(COFFEE_CATEGORIES, weekExpenses);
  
  // Cigarettes tracking (estimate packs from amount, ~₹200/pack)
  const cigarettesWeek = getCategorySpending(CIGARETTE_CATEGORIES, weekExpenses);
  const cigarettesMonth = getCategorySpending(CIGARETTE_CATEGORIES, monthExpenses);
  const cigarettesPacks = Math.round(cigarettesMonth / 200);
  
  // Delivery food tracking
  const deliveryToday = getCategorySpending(DELIVERY_CATEGORIES, todayExpenses);
  const deliveryWeek = getCategorySpending(DELIVERY_CATEGORIES, weekExpenses);
  const deliveryMonth = getCategorySpending(DELIVERY_CATEGORIES, monthExpenses);
  const deliveryCount = getCategoryCount(DELIVERY_CATEGORIES, weekExpenses);
  const deliveryFees = Math.round(deliveryWeek * 0.15); // Estimate 15% fees
  
  // Impulse tracking
  const impulseCount = getCategoryCount(IMPULSE_CATEGORIES, monthExpenses);
  const impulseTotalMonth = getCategorySpending(IMPULSE_CATEGORIES, monthExpenses);
  
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
      } else break;
    }
  }
  
  const daysWithoutLog = Math.floor(hoursSinceLastLog / 24);
  const isPayday = todayIncome >= 10000;
  const loggedToday = todayTransactions.length > 0;
  
  // Goal progress
  const familyGoalProgress = userSettings?.familyGoalSaved || 0;
  const rainyDayFundAdded = 0; // Would track recent additions
  
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
    dailyBudgetLimit,
    todaySpending,
    todayIncome,
    avgDailySpending,
    spendingLevel,
    budgetOver,
    budgetSaved,
    weekSpending,
    monthSpending,
    monthSavings,
    coffeeToday,
    coffeeWeek,
    coffeeCount,
    cigarettesWeek,
    cigarettesMonth,
    cigarettesPacks,
    deliveryToday,
    deliveryWeek,
    deliveryMonth,
    deliveryCount,
    deliveryFees,
    topCategoryToday,
    categoryCounts,
    impulseCount,
    impulseTotalMonth,
    familyGoalProgress,
    rainyDayFundAdded,
    isImpulseTime: hour >= 23 || hour < 2,
    isPayday,
    isNoSpendDay: todayExpenses.length === 0,
    consecutiveSameCategory,
    daysWithoutLog,
    loggedToday,
  };
}

// ============================================
// TRIGGER DETECTION
// ============================================

export function detectTriggers(context: NudgeContext): NudgeTrigger[] {
  const triggers: NudgeTrigger[] = [];
  
  // Budget triggers
  if (context.todaySpending > context.dailyBudgetLimit) {
    triggers.push('daily_budget_exceeded');
  }
  if (context.todaySpending < context.dailyBudgetLimit && context.loggedToday) {
    triggers.push('budget_under_spent');
    triggers.push('budget_under_spent_day');
  }
  
  // Coffee triggers
  if (context.coffeeWeek > 500) triggers.push('coffee_category_over');
  if (context.coffeeToday > 200) triggers.push('coffee_daily_high');
  
  // Cigarettes triggers
  if (context.cigarettesWeek > 500) triggers.push('cigarettes_over_week');
  if (context.cigarettesMonth > 2000) triggers.push('cigarettes_monthly_high');
  
  // Delivery triggers
  if (context.deliveryWeek > 1500) triggers.push('delivery_food_over_week');
  if (context.deliveryToday > 500) triggers.push('swiggy_zomato_daily_high');
  if (context.deliveryMonth > 5000) triggers.push('high_delivery_spend_month');
  
  // Impulse triggers
  if (context.impulseCount > 5) triggers.push('impulse_spend_detected');
  
  // Streak triggers
  if (context.currentStreak === 3) triggers.push('streak_3_days');
  if (context.currentStreak === 5) triggers.push('streak_5_days');
  if (context.currentStreak === 7) {
    triggers.push('streak_7_days');
    triggers.push('streak_milestone');
  }
  if (context.currentStreak === 14) triggers.push('streak_14_days');
  if (context.currentStreak === 30) triggers.push('streak_30_days');
  
  if (context.daysWithoutLog >= 2 && context.currentStreak > 0) {
    triggers.push('streak_breaker_risk');
    triggers.push('streak_at_risk');
  }
  if (context.streakStatus === 'broken') triggers.push('streak_broken');
  
  // Logged today after risk
  if (context.loggedToday && context.hoursSinceLastLog > 20 && context.hoursSinceLastLog < 48) {
    triggers.push('streak_breaker_avoided');
  }
  
  // Savings triggers
  if (context.monthSavings > 5000) triggers.push('monthly_savings_milestone');
  
  // Time-based triggers
  if (context.timeOfDay === 'morning') triggers.push('morning_greeting');
  if (context.timeOfDay === 'evening') triggers.push('evening_reflection');
  if (context.isImpulseTime) triggers.push('late_night_warning');
  
  // Pattern-based
  if (context.spendingLevel === 'over' || context.spendingLevel === 'way_over') {
    triggers.push('overspending_today');
  }
  if (context.spendingLevel === 'under') triggers.push('underspending_today');
  if (context.consecutiveSameCategory >= 3) triggers.push('category_binge');
  if (context.isNoSpendDay && context.timeOfDay === 'evening') triggers.push('no_spend_day');
  
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
  
  // No category selected
  if (!transaction.hasCategory) {
    triggers.push('high_spend_no_category');
  }
  
  if (transaction.type === 'income') {
    triggers.push('after_income');
    if (transaction.amount >= 10000) triggers.push('payday_detected');
  } else {
    // Expense triggers based on amount
    if (transaction.amount < 100) triggers.push('after_expense_small');
    else if (transaction.amount < 1000) triggers.push('after_expense_medium');
    else if (transaction.amount < 5000) triggers.push('after_expense_large');
    else triggers.push('after_expense_huge');
    
    // Category-specific post-log triggers
    const cat = transaction.category.toLowerCase();
    if (COFFEE_CATEGORIES.some(c => cat.includes(c))) {
      if (context.coffeeToday > 150) triggers.push('coffee_daily_high');
    }
    if (DELIVERY_CATEGORIES.some(c => cat.includes(c) || transaction.merchantName?.toLowerCase().includes(c))) {
      if (context.deliveryToday > 300) triggers.push('swiggy_zomato_daily_high');
    }
    
    // First log of the day
    if (transaction.isFirstToday) triggers.push('after_first_log_today');
    
    // Category binge
    if (transaction.isRepeatCategory && context.consecutiveSameCategory >= 2) {
      triggers.push('category_binge');
    }
    
    // Late night spending
    if (context.isImpulseTime) triggers.push('late_night_warning');
    
    // Budget exceeded
    if (context.todaySpending > context.dailyBudgetLimit) {
      triggers.push('daily_budget_exceeded');
    }
  }
  
  // Multiple logs today
  const todayCount = Object.values(context.categoryCounts).reduce((a, b) => a + b, 0);
  if (todayCount >= 3) triggers.push('after_multiple_logs');
  
  return triggers;
}

// ============================================
// PERSONALIZATION
// ============================================

function personalizeMessage(message: string, context: NudgeContext): string {
  return message
    // Budget & Spending
    .replace(/{spent}/g, `₹${context.todaySpending.toLocaleString()}`)
    .replace(/{limit}/g, `₹${context.dailyBudgetLimit.toLocaleString()}`)
    .replace(/{over}/g, `₹${context.budgetOver.toLocaleString()}`)
    .replace(/{saved}/g, `₹${context.budgetSaved.toLocaleString()}`)
    .replace(/{todaySpending}/g, `₹${context.todaySpending.toLocaleString()}`)
    .replace(/{weekSpending}/g, `₹${context.weekSpending.toLocaleString()}`)
    .replace(/{monthSpending}/g, `₹${context.monthSpending.toLocaleString()}`)
    .replace(/{avgDaily}/g, `₹${Math.round(context.avgDailySpending).toLocaleString()}`)
    // Coffee
    .replace(/{total_coffee}/g, `₹${context.coffeeWeek.toLocaleString()}`)
    .replace(/{today_coffee}/g, `₹${context.coffeeToday.toLocaleString()}`)
    .replace(/{coffee_count}/g, context.coffeeCount.toString())
    // Cigarettes
    .replace(/{cigarettes_week}/g, `₹${context.cigarettesWeek.toLocaleString()}`)
    .replace(/{cigarettes_month}/g, `₹${context.cigarettesMonth.toLocaleString()}`)
    .replace(/{packs}/g, context.cigarettesPacks.toString())
    // Delivery
    .replace(/{delivery_today}/g, `₹${context.deliveryToday.toLocaleString()}`)
    .replace(/{delivery_week}/g, `₹${context.deliveryWeek.toLocaleString()}`)
    .replace(/{delivery_month}/g, `₹${context.deliveryMonth.toLocaleString()}`)
    .replace(/{delivery_count}/g, context.deliveryCount.toString())
    .replace(/{fees}/g, `₹${context.deliveryFees.toLocaleString()}`)
    // Impulse
    .replace(/{impulse_count}/g, context.impulseCount.toString())
    // Streaks & General
    .replace(/{streak}/g, context.currentStreak.toString())
    .replace(/{daysAway}/g, context.daysWithoutLog.toString())
    .replace(/{level}/g, context.userLevel.toString())
    .replace(/{transactions}/g, context.totalTransactions.toString())
    .replace(/{topCategory}/g, context.topCategoryToday || 'spending')
    .replace(/{consecutiveCategory}/g, context.consecutiveSameCategory.toString())
    // Transaction-specific
    .replace(/{amount}/g, context.lastTransaction ? `₹${context.lastTransaction.amount.toLocaleString()}` : '')
    .replace(/{lastAmount}/g, context.lastTransaction ? `₹${context.lastTransaction.amount.toLocaleString()}` : '')
    .replace(/{lastCategory}/g, context.lastTransaction?.categoryLabel || '')
    .replace(/{merchant}/g, context.lastTransaction?.merchantName || 'somewhere')
    // Goals
    .replace(/{progress}/g, `₹${context.familyGoalProgress.toLocaleString()}`)
    .replace(/{added}/g, `₹${context.rainyDayFundAdded.toLocaleString()}`)
    .replace(/{month_savings}/g, `₹${Math.max(0, context.monthSavings).toLocaleString()}`);
}

// ============================================
// NUDGE SELECTION
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

// ============================================
// NUDGE REGISTRY - USER'S WITTY CONTENT
// ============================================

export const NUDGE_REGISTRY: Nudge[] = [
  // ===== DAILY BUDGET LIMIT TRIGGERS =====
  {
    id: 'budget_exceeded_1',
    trigger: 'daily_budget_exceeded',
    tone: 'sarcastic',
    message: "Congrats! You just burned through your entire daily budget like it owes you money. Wallet's in therapy now. 😏",
    subtext: "Spent {spent} / {limit} today",
    emoji: '🔥💸',
    action: { label: 'See breakdown', route: '/insights' },
    weight: 10,
  },
  {
    id: 'budget_exceeded_2',
    trigger: 'daily_budget_exceeded',
    tone: 'sarcastic',
    message: "Budget limit? What budget limit? Your spending said 'hold my beer' and kept going.",
    subtext: "You're {over} over — impressive commitment to chaos",
    emoji: '🚨🍻',
    action: { label: 'Cut something?', route: '/insights' },
    weight: 10,
  },

  // ===== COFFEE OVERSPEND TRIGGERS =====
  {
    id: 'coffee_over_1',
    trigger: 'coffee_category_over',
    tone: 'sarcastic',
    message: "Another {amount} on coffee? Your barista just bought a yacht named after you. ☕🛥️",
    subtext: "This week: {coffee_count} coffees = {total_coffee}",
    emoji: '☕💰',
    action: { label: 'Log less caffeine?', route: '/add-expense' },
    weight: 10,
  },
  {
    id: 'coffee_over_2',
    trigger: 'coffee_category_over',
    tone: 'witty',
    message: "{amount} for caffeine today. At this rate you'll need a second job… to fund your third espresso.",
    subtext: "You're basically dating Starbucks at this point",
    emoji: '💔☕',
    weight: 10,
  },
  {
    id: 'coffee_daily_high_1',
    trigger: 'coffee_daily_high',
    tone: 'sarcastic',
    message: "Three coffees before lunch? Bold strategy. Your adrenal glands just sent a resignation letter.",
    subtext: "Daily coffee spend: {today_coffee}",
    emoji: '⚡😴',
    weight: 10,
  },

  // ===== CIGARETTES / SMOKING TRIGGERS =====
  {
    id: 'cigarettes_week_1',
    trigger: 'cigarettes_over_week',
    tone: 'sarcastic',
    message: "{cigarettes_week} on smokes this week? Your lungs and bank account are tag-teaming an intervention.",
    subtext: "That's {packs} packs — future you is coughing in debt",
    emoji: '🚬😷💸',
    action: { label: 'Track habit', route: '/challenges' },
    weight: 10,
  },
  {
    id: 'cigarettes_month_1',
    trigger: 'cigarettes_monthly_high',
    tone: 'sarcastic',
    message: "Cigarette budget officially in 'why are we even trying' territory. {cigarettes_month} gone in smoke. Literally.",
    subtext: "Month-to-date: {packs} packs",
    emoji: '💨🏦',
    action: { label: 'Set limit', route: '/settings' },
    weight: 10,
  },

  // ===== GENERAL / IMPULSE OVERSPEND =====
  {
    id: 'impulse_1',
    trigger: 'impulse_spend_detected',
    tone: 'witty',
    message: "{amount} on '{merchant}'? You said 'treat yourself'… your savings said 'please don't'.",
    subtext: "Impulse purchases this month: {impulse_count}",
    emoji: '🛍️😑',
    action: { label: 'Review impulse buys', route: '/insights' },
    weight: 10,
  },
  {
    id: 'no_category_1',
    trigger: 'high_spend_no_category',
    tone: 'sarcastic',
    message: "{amount} just vanished into the void called 'miscellaneous'. Mystery solved: you're very generous… to strangers.",
    subtext: "No category selected — living dangerously",
    emoji: '❓💨',
    weight: 10,
  },
  {
    id: 'streak_risk_1',
    trigger: 'streak_breaker_risk',
    tone: 'sarcastic',
    message: "Haven't logged in 2 days? Your streak is currently ghosting you. Don't worry, it's not you… it's definitely you.",
    subtext: "One more skip = streak officially dead ☠️",
    emoji: '👻🔥',
    action: { label: 'Log now', route: '/add-expense' },
    weight: 15,
  },

  // ===== DELIVERY FOOD OVERSPEND =====
  {
    id: 'delivery_week_1',
    trigger: 'delivery_food_over_week',
    tone: 'sarcastic',
    message: "{delivery_week} on Swiggy/Zomato this week? Your delivery guy probably has a better credit score than you now. 🛵💸",
    subtext: "{delivery_count} orders = enough biryani to feed the whole society",
    emoji: '🍲🚀',
    action: { label: 'Review delivery spends', route: '/insights' },
    weight: 10,
  },
  {
    id: 'delivery_week_2',
    trigger: 'delivery_food_over_week',
    tone: 'witty',
    message: "Another {delivery_today} Swiggy order? At this rate, you'll own shares in Zomato before you own a kitchen. Congrats on funding someone else's dream!",
    subtext: "Platform fees + delivery + GST = your new silent partner",
    emoji: '😏📱',
    weight: 10,
  },
  {
    id: 'delivery_daily_1',
    trigger: 'swiggy_zomato_daily_high',
    tone: 'sarcastic',
    message: "{delivery_today} delivered today? Your fridge is unemployed and your wallet is crying in the corner like it's monsoon season.",
    subtext: "Convenience tax paid: {fees}",
    emoji: '🌧️😢',
    action: { label: 'Cook tonight?', route: '/challenges' },
    weight: 10,
  },

  // ===== MOTIVATIONAL NUDGES =====
  {
    id: 'budget_under_1',
    trigger: 'budget_under_spent_day',
    tone: 'motivational',
    message: "Only spent {spent} of {limit} today! You're walking the talk – small steps today, big Diwali shopping tomorrow. Keep shining! ✨",
    subtext: "Saved {saved} – that's one more gift for family",
    emoji: '💪🌟',
    action: { label: 'Set next goal', route: '/challenges' },
    weight: 10,
  },
  {
    id: 'streak_5_1',
    trigger: 'streak_5_days',
    tone: 'motivational',
    message: "5-day streak locked in! You're building discipline stronger than Ahmedabad traffic. One day at a time – you've got this, champ!",
    subtext: "Consistency = future freedom",
    emoji: '🏆🔥',
    weight: 10,
  },
  {
    id: 'streak_7_1',
    trigger: 'streak_7_days',
    tone: 'appreciative',
    message: "7-day logging streak! You're out here adulting harder than most people on payday.",
    subtext: "Keep going — future you is sending virtual high-fives",
    emoji: '🥳🙌',
    action: { label: 'View progress', route: '/challenges' },
    weight: 10,
  },
  {
    id: 'monthly_savings_1',
    trigger: 'monthly_savings_milestone',
    tone: 'motivational',
    message: "{month_savings} saved this month already! You're not just saving money – you're saving choices for your future self. Proud of you!",
    subtext: "Keep going – Diwali bonus is coming",
    emoji: '🎉💰',
    weight: 10,
  },

  // ===== SENTIMENTAL / EMOTIONAL NUDGES =====
  {
    id: 'family_goal_1',
    trigger: 'family_goal_progress',
    tone: 'sentimental',
    message: "{progress} closer to your family goal. Remember how Mummy used to save every rupee for our Diwali? You're carrying that legacy forward.",
    subtext: "For the ones who matter most ❤️",
    emoji: '👨‍👩‍👧‍👦🪔',
    action: { label: 'Add family note', route: '/challenges' },
    weight: 10,
  },
  {
    id: 'delivery_sentimental_1',
    trigger: 'high_delivery_spend_month',
    tone: 'sentimental',
    message: "{delivery_month} on food apps this month… Imagine if that went to a surprise for your parents or a weekend with friends. Small choices, big memories.",
    subtext: "One less order = one more moment",
    emoji: '🥺❤️',
    weight: 10,
  },
  {
    id: 'rainy_day_1',
    trigger: 'rainy_day_fund_growth',
    tone: 'sentimental',
    message: "Your rainy-day fund just grew by {added}. Like Mummy's secret stash during tough times – you're building that same safety net for your loved ones.",
    subtext: "Peace of mind > biryani any day",
    emoji: '☔🏠',
    weight: 10,
  },
  {
    id: 'streak_avoided_1',
    trigger: 'streak_breaker_avoided',
    tone: 'appreciative',
    message: "You logged today despite the mood. That's real strength – the kind that makes your future self smile and say 'thank you'.",
    subtext: "You're writing a better story, one day at a time",
    emoji: '📖😊',
    weight: 10,
  },

  // ===== BONUS / FALLBACK NUDGES =====
  {
    id: 'morning_1',
    trigger: 'morning_greeting',
    tone: 'witty',
    message: "Good morning! Ready to make your wallet proud today? ☀️",
    subtext: "Yesterday's spending: {todaySpending}",
    emoji: '☀️',
    weight: 5,
  },
  {
    id: 'app_open_1',
    trigger: 'app_opened',
    tone: 'witty',
    message: "Welcome back! Your money missed you. 👋",
    subtext: "Let's see what today brings",
    emoji: '👋',
    weight: 5,
  },
  {
    id: 'late_night_1',
    trigger: 'late_night_warning',
    tone: 'sarcastic',
    message: "Shopping at this hour? Nothing good happens after midnight. Your wallet agrees. 🌙",
    subtext: "Sleep on it — your bank account will thank you",
    emoji: '🌙',
    weight: 15,
  },
  {
    id: 'no_spend_1',
    trigger: 'no_spend_day',
    tone: 'appreciative',
    message: "Zero spending today! Your future self is writing a thank-you note. 💪",
    subtext: "No-spend days = compound interest on discipline",
    emoji: '💪',
    weight: 10,
  },
];

// ============================================
// MAIN API
// ============================================

export function getNudgeForHome(
  transactions: Transaction[],
  gamification: Parameters<typeof buildNudgeContext>[1],
  userSettings?: Parameters<typeof buildNudgeContext>[2]
): SelectedNudge | null {
  const context = buildNudgeContext(transactions, gamification, userSettings);
  const triggers = detectTriggers(context);
  return selectNudge(NUDGE_REGISTRY, triggers, context, 'home_card');
}

export function getNudgeForPostLog(
  transactions: Transaction[],
  gamification: Parameters<typeof buildNudgeContext>[1],
  lastTransaction: NonNullable<NudgeContext['lastTransaction']>,
  userSettings?: Parameters<typeof buildNudgeContext>[2]
): SelectedNudge | null {
  const context = buildNudgeContext(transactions, gamification, userSettings);
  context.lastTransaction = lastTransaction;
  const triggers = detectPostLogTrigger(context, lastTransaction);
  return selectNudge(NUDGE_REGISTRY, triggers, context, 'post_log');
}

export function getNudgeForStreak(
  transactions: Transaction[],
  gamification: Parameters<typeof buildNudgeContext>[1],
  userSettings?: Parameters<typeof buildNudgeContext>[2]
): SelectedNudge | null {
  const context = buildNudgeContext(transactions, gamification, userSettings);
  
  const streakTriggers: NudgeTrigger[] = [];
  if (context.streakStatus === 'at_risk') streakTriggers.push('streak_at_risk', 'streak_breaker_risk');
  if (context.currentStreak === 3) streakTriggers.push('streak_3_days');
  if (context.currentStreak === 5) streakTriggers.push('streak_5_days');
  if (context.currentStreak === 7) streakTriggers.push('streak_7_days', 'streak_milestone');
  if (context.currentStreak === 14) streakTriggers.push('streak_14_days');
  if (context.currentStreak === 30) streakTriggers.push('streak_30_days');
  if (context.streakStatus === 'broken') streakTriggers.push('streak_broken');
  
  if (streakTriggers.length === 0) return null;
  
  return selectNudge(NUDGE_REGISTRY, streakTriggers, context, 'streak_section');
}

// Export context builder for external use
export { buildNudgeContext as createNudgeContext };
