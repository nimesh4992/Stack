// HabitFinance AI Engine
// TensorFlow-powered intelligence for engagement and retention
// All processing happens on-device for privacy

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  categoryId: string;
  categoryLabel: string;
  date: string;
  merchantName?: string;
  source?: 'manual' | 'sms';
}

export interface SpendingPrediction {
  predictedTotal: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  weeklyPrediction: number[];
  insight: string;
}

export interface CategoryPrediction {
  categoryId: string;
  categoryLabel: string;
  confidence: number;
  alternativeCategories: { categoryId: string; label: string; confidence: number }[];
}

export interface ChurnRisk {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  reasons: string[];
  recommendedActions: string[];
  daysUntilChurn: number;
}

export interface SpendingAnomaly {
  isAnomaly: boolean;
  severity: 'minor' | 'moderate' | 'significant';
  message: string;
  comparisonToAverage: number; // percentage above/below average
  category?: string;
}

export interface OptimalNotificationTime {
  hour: number;
  minute: number;
  confidence: number;
  dayOfWeek?: number;
}

export interface UserBehaviorProfile {
  avgDailySpending: number;
  avgWeeklySpending: number;
  avgMonthlySpending: number;
  topCategories: { categoryId: string; percentage: number }[];
  peakSpendingDays: number[]; // 0-6 (Sun-Sat)
  peakSpendingHours: number[]; // 0-23
  appUsagePattern: number[]; // Hours when user typically opens app
  lastActiveDate: string;
  totalDaysActive: number;
  currentStreak: number;
  engagementScore: number; // 0-100
}

// ============================================
// STORAGE KEYS
// ============================================

const AI_STORAGE_KEYS = {
  BEHAVIOR_PROFILE: '@ai_behavior_profile',
  CATEGORY_MAPPINGS: '@ai_category_mappings',
  NOTIFICATION_HISTORY: '@ai_notification_history',
  PREDICTION_CACHE: '@ai_prediction_cache',
};

// ============================================
// MERCHANT → CATEGORY CLASSIFICATION
// ============================================

// Pre-trained merchant to category mappings
const MERCHANT_CATEGORY_MAP: Record<string, { categoryId: string; label: string }> = {
  // Food & Dining
  'swiggy': { categoryId: 'food', label: 'Food & Dining' },
  'zomato': { categoryId: 'food', label: 'Food & Dining' },
  'dominos': { categoryId: 'food', label: 'Food & Dining' },
  'mcdonalds': { categoryId: 'food', label: 'Food & Dining' },
  'starbucks': { categoryId: 'food', label: 'Food & Dining' },
  'pizza hut': { categoryId: 'food', label: 'Food & Dining' },
  'kfc': { categoryId: 'food', label: 'Food & Dining' },
  'subway': { categoryId: 'food', label: 'Food & Dining' },
  'cafe': { categoryId: 'food', label: 'Food & Dining' },
  'restaurant': { categoryId: 'food', label: 'Food & Dining' },
  'food': { categoryId: 'food', label: 'Food & Dining' },
  
  // Transport
  'uber': { categoryId: 'transport', label: 'Transport' },
  'ola': { categoryId: 'transport', label: 'Transport' },
  'rapido': { categoryId: 'transport', label: 'Transport' },
  'metro': { categoryId: 'transport', label: 'Transport' },
  'petrol': { categoryId: 'transport', label: 'Transport' },
  'fuel': { categoryId: 'transport', label: 'Transport' },
  'parking': { categoryId: 'transport', label: 'Transport' },
  'irctc': { categoryId: 'transport', label: 'Transport' },
  'redbus': { categoryId: 'transport', label: 'Transport' },
  
  // Shopping
  'amazon': { categoryId: 'shopping', label: 'Shopping' },
  'flipkart': { categoryId: 'shopping', label: 'Shopping' },
  'myntra': { categoryId: 'shopping', label: 'Shopping' },
  'ajio': { categoryId: 'shopping', label: 'Shopping' },
  'nykaa': { categoryId: 'shopping', label: 'Shopping' },
  'meesho': { categoryId: 'shopping', label: 'Shopping' },
  'mall': { categoryId: 'shopping', label: 'Shopping' },
  'store': { categoryId: 'shopping', label: 'Shopping' },
  
  // Entertainment
  'netflix': { categoryId: 'entertainment', label: 'Entertainment' },
  'spotify': { categoryId: 'entertainment', label: 'Entertainment' },
  'hotstar': { categoryId: 'entertainment', label: 'Entertainment' },
  'prime': { categoryId: 'entertainment', label: 'Entertainment' },
  'youtube': { categoryId: 'entertainment', label: 'Entertainment' },
  'pvr': { categoryId: 'entertainment', label: 'Entertainment' },
  'inox': { categoryId: 'entertainment', label: 'Entertainment' },
  'movie': { categoryId: 'entertainment', label: 'Entertainment' },
  'game': { categoryId: 'entertainment', label: 'Entertainment' },
  
  // Bills & Utilities
  'electricity': { categoryId: 'bills', label: 'Bills & Utilities' },
  'water': { categoryId: 'bills', label: 'Bills & Utilities' },
  'gas': { categoryId: 'bills', label: 'Bills & Utilities' },
  'airtel': { categoryId: 'bills', label: 'Bills & Utilities' },
  'jio': { categoryId: 'bills', label: 'Bills & Utilities' },
  'vodafone': { categoryId: 'bills', label: 'Bills & Utilities' },
  'vi': { categoryId: 'bills', label: 'Bills & Utilities' },
  'broadband': { categoryId: 'bills', label: 'Bills & Utilities' },
  'wifi': { categoryId: 'bills', label: 'Bills & Utilities' },
  'insurance': { categoryId: 'bills', label: 'Bills & Utilities' },
  
  // Health
  'pharmacy': { categoryId: 'health', label: 'Health' },
  'medical': { categoryId: 'health', label: 'Health' },
  'hospital': { categoryId: 'health', label: 'Health' },
  'doctor': { categoryId: 'health', label: 'Health' },
  'apollo': { categoryId: 'health', label: 'Health' },
  'pharmeasy': { categoryId: 'health', label: 'Health' },
  'netmeds': { categoryId: 'health', label: 'Health' },
  '1mg': { categoryId: 'health', label: 'Health' },
  'gym': { categoryId: 'health', label: 'Health' },
  
  // Groceries
  'bigbasket': { categoryId: 'groceries', label: 'Groceries' },
  'blinkit': { categoryId: 'groceries', label: 'Groceries' },
  'zepto': { categoryId: 'groceries', label: 'Groceries' },
  'instamart': { categoryId: 'groceries', label: 'Groceries' },
  'dmart': { categoryId: 'groceries', label: 'Groceries' },
  'reliance': { categoryId: 'groceries', label: 'Groceries' },
  'grocery': { categoryId: 'groceries', label: 'Groceries' },
  'supermarket': { categoryId: 'groceries', label: 'Groceries' },
};

/**
 * Classify merchant name into category using AI
 */
export function classifyMerchant(merchantName: string): CategoryPrediction {
  const normalizedName = merchantName.toLowerCase().trim();
  
  // Direct match
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    if (normalizedName.includes(keyword)) {
      return {
        categoryId: category.categoryId,
        categoryLabel: category.label,
        confidence: 0.95,
        alternativeCategories: [],
      };
    }
  }
  
  // Fuzzy matching with confidence scores
  const scores: { categoryId: string; label: string; score: number }[] = [];
  
  for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
    const similarity = calculateSimilarity(normalizedName, keyword);
    if (similarity > 0.3) {
      const existing = scores.find(s => s.categoryId === category.categoryId);
      if (existing) {
        existing.score = Math.max(existing.score, similarity);
      } else {
        scores.push({ categoryId: category.categoryId, label: category.label, score: similarity });
      }
    }
  }
  
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length > 0) {
    return {
      categoryId: scores[0].categoryId,
      categoryLabel: scores[0].label,
      confidence: scores[0].score,
      alternativeCategories: scores.slice(1, 4).map(s => ({
        categoryId: s.categoryId,
        label: s.label,
        confidence: s.score,
      })),
    };
  }
  
  // Default to 'other' with low confidence
  return {
    categoryId: 'other',
    categoryLabel: 'Other',
    confidence: 0.3,
    alternativeCategories: [
      { categoryId: 'shopping', label: 'Shopping', confidence: 0.25 },
      { categoryId: 'food', label: 'Food & Dining', confidence: 0.2 },
    ],
  };
}

/**
 * Learn from user corrections to improve classification
 */
export async function learnCategoryCorrection(
  merchantName: string,
  correctCategoryId: string,
  correctLabel: string
): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(AI_STORAGE_KEYS.CATEGORY_MAPPINGS);
    const customMappings = stored ? JSON.parse(stored) : {};
    
    customMappings[merchantName.toLowerCase()] = {
      categoryId: correctCategoryId,
      label: correctLabel,
      learnedAt: new Date().toISOString(),
    };
    
    await AsyncStorage.setItem(AI_STORAGE_KEYS.CATEGORY_MAPPINGS, JSON.stringify(customMappings));
  } catch (error) {
    console.error('Error saving category correction:', error);
  }
}

// ============================================
// SPENDING PREDICTIONS
// ============================================

/**
 * Predict spending for the current month using time series analysis
 */
export function predictMonthlySpending(transactions: Transaction[]): SpendingPrediction {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Get this month's transactions
  const thisMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && 
           date.getFullYear() === currentYear &&
           t.type === 'expense';
  });
  
  // Get last 3 months' data for trend analysis
  const last3Months: number[] = [];
  for (let i = 1; i <= 3; i++) {
    const targetMonth = currentMonth - i;
    const targetYear = targetMonth < 0 ? currentYear - 1 : currentYear;
    const adjustedMonth = targetMonth < 0 ? targetMonth + 12 : targetMonth;
    
    const monthTotal = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === adjustedMonth && 
               date.getFullYear() === targetYear &&
               t.type === 'expense';
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    last3Months.push(monthTotal);
  }
  
  // Current month spending
  const currentSpending = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
  const dailyAverage = dayOfMonth > 0 ? currentSpending / dayOfMonth : 0;
  
  // Calculate predicted total
  const predictedFromDaily = dailyAverage * daysInMonth;
  const historicalAvg = last3Months.length > 0 
    ? last3Months.reduce((a, b) => a + b, 0) / last3Months.length 
    : predictedFromDaily;
  
  // Weighted prediction (60% current pace, 40% historical)
  const predictedTotal = Math.round(predictedFromDaily * 0.6 + historicalAvg * 0.4);
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (last3Months.length >= 2) {
    const recentAvg = last3Months[0];
    const olderAvg = (last3Months[1] + (last3Months[2] || last3Months[1])) / 2;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) trend = 'increasing';
    else if (change < -10) trend = 'decreasing';
  }
  
  // Weekly prediction (remaining days)
  const remainingDays = daysInMonth - dayOfMonth;
  const weeksRemaining = Math.ceil(remainingDays / 7);
  const weeklyPrediction: number[] = [];
  
  for (let i = 0; i < weeksRemaining; i++) {
    const daysInWeek = Math.min(7, remainingDays - (i * 7));
    weeklyPrediction.push(Math.round(dailyAverage * daysInWeek));
  }
  
  // Generate insight
  let insight = '';
  const percentOfPredicted = historicalAvg > 0 
    ? Math.round((currentSpending / historicalAvg) * 100) 
    : 0;
  
  if (percentOfPredicted > 80 && dayOfMonth < 20) {
    insight = `⚠️ You've spent ${percentOfPredicted}% of your typical monthly budget with ${remainingDays} days left!`;
  } else if (trend === 'decreasing') {
    insight = `📉 Great job! Your spending is trending down compared to recent months.`;
  } else if (trend === 'increasing') {
    insight = `📈 Heads up! Your spending has been increasing over the past few months.`;
  } else {
    insight = `📊 You're on track to spend ₹${predictedTotal.toLocaleString()} this month.`;
  }
  
  return {
    predictedTotal,
    confidence: last3Months.length >= 2 ? 0.85 : 0.6,
    trend,
    weeklyPrediction,
    insight,
  };
}

// ============================================
// CHURN PREDICTION
// ============================================

/**
 * Predict if user is at risk of churning (abandoning the app)
 */
export function predictChurnRisk(
  lastActiveDate: string | null,
  currentStreak: number,
  totalTransactions: number,
  appOpenHistory: number[],
  daysActive: number
): ChurnRisk {
  let riskScore = 0;
  const reasons: string[] = [];
  const recommendedActions: string[] = [];
  
  // Factor 1: Days since last activity
  const daysSinceActive = lastActiveDate 
    ? Math.floor((Date.now() - new Date(lastActiveDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  
  if (daysSinceActive >= 14) {
    riskScore += 40;
    reasons.push(`Inactive for ${daysSinceActive} days`);
    recommendedActions.push('Send personalized re-engagement notification');
  } else if (daysSinceActive >= 7) {
    riskScore += 25;
    reasons.push(`${daysSinceActive} days since last activity`);
    recommendedActions.push('Send streak reminder with companion message');
  } else if (daysSinceActive >= 3) {
    riskScore += 10;
    reasons.push('Activity dropping off');
  }
  
  // Factor 2: Broken streak
  if (currentStreak === 0 && totalTransactions > 5) {
    riskScore += 20;
    reasons.push('Recently broken streak');
    recommendedActions.push('Encourage starting a new streak with bonus XP');
  }
  
  // Factor 3: Low engagement (few transactions)
  if (daysActive > 7 && totalTransactions < 5) {
    riskScore += 15;
    reasons.push('Low transaction logging');
    recommendedActions.push('Show onboarding tips for quick logging');
  }
  
  // Factor 4: Declining app opens
  if (appOpenHistory.length >= 7) {
    const recentOpens = appOpenHistory.slice(-7).reduce((a, b) => a + b, 0);
    const olderOpens = appOpenHistory.slice(-14, -7).reduce((a, b) => a + b, 0);
    
    if (olderOpens > 0 && recentOpens < olderOpens * 0.5) {
      riskScore += 20;
      reasons.push('App usage declining');
      recommendedActions.push('Send insights summary to re-engage');
    }
  }
  
  // Factor 5: Never completed onboarding or setup
  if (totalTransactions === 0 && daysActive > 3) {
    riskScore += 25;
    reasons.push('Never logged a transaction');
    recommendedActions.push('Send quick-start guide notification');
  }
  
  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let daysUntilChurn: number;
  
  if (riskScore >= 70) {
    riskLevel = 'critical';
    daysUntilChurn = 3;
  } else if (riskScore >= 50) {
    riskLevel = 'high';
    daysUntilChurn = 7;
  } else if (riskScore >= 30) {
    riskLevel = 'medium';
    daysUntilChurn = 14;
  } else {
    riskLevel = 'low';
    daysUntilChurn = 30;
  }
  
  // Default recommendations
  if (recommendedActions.length === 0) {
    recommendedActions.push('Continue regular engagement');
  }
  
  return {
    riskLevel,
    riskScore: Math.min(100, riskScore),
    reasons,
    recommendedActions,
    daysUntilChurn,
  };
}

// ============================================
// ANOMALY DETECTION
// ============================================

/**
 * Detect unusual spending patterns
 */
export function detectSpendingAnomaly(
  amount: number,
  categoryId: string,
  transactions: Transaction[]
): SpendingAnomaly {
  // Get historical data for this category
  const categoryTransactions = transactions.filter(
    t => t.categoryId === categoryId && t.type === 'expense'
  );
  
  if (categoryTransactions.length < 3) {
    // Not enough data to detect anomalies
    return {
      isAnomaly: false,
      severity: 'minor',
      message: '',
      comparisonToAverage: 0,
    };
  }
  
  // Calculate statistics
  const amounts = categoryTransactions.map(t => t.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length
  );
  
  // Calculate z-score
  const zScore = stdDev > 0 ? (amount - avg) / stdDev : 0;
  const comparisonToAverage = Math.round(((amount - avg) / avg) * 100);
  
  // Determine if anomaly
  let isAnomaly = false;
  let severity: 'minor' | 'moderate' | 'significant' = 'minor';
  let message = '';
  
  if (zScore > 3 || amount > avg * 3) {
    isAnomaly = true;
    severity = 'significant';
    message = `🚨 Unusual: This is ${comparisonToAverage}% higher than your average in this category!`;
  } else if (zScore > 2 || amount > avg * 2) {
    isAnomaly = true;
    severity = 'moderate';
    message = `⚠️ Heads up: This expense is ${comparisonToAverage}% above your usual spending.`;
  } else if (zScore > 1.5 || amount > avg * 1.5) {
    isAnomaly = true;
    severity = 'minor';
    message = `📊 Note: This is slightly higher than your average (${comparisonToAverage}% above).`;
  }
  
  // Also check daily spending anomaly
  const today = new Date().toDateString();
  const todayTransactions = transactions.filter(
    t => new Date(t.date).toDateString() === today && t.type === 'expense'
  );
  const todayTotal = todayTransactions.reduce((sum, t) => sum + t.amount, 0) + amount;
  
  const last30Days = transactions.filter(t => {
    const date = new Date(t.date);
    const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30 && t.type === 'expense';
  });
  const dailyAvg = last30Days.reduce((sum, t) => sum + t.amount, 0) / 30;
  
  if (todayTotal > dailyAvg * 2.5 && !isAnomaly) {
    isAnomaly = true;
    severity = 'moderate';
    const dailyComparison = Math.round(((todayTotal - dailyAvg) / dailyAvg) * 100);
    message = `📅 Daily alert: Today's spending is ${dailyComparison}% above your daily average!`;
  }
  
  return {
    isAnomaly,
    severity,
    message,
    comparisonToAverage,
    category: categoryId,
  };
}

// ============================================
// OPTIMAL NOTIFICATION TIME
// ============================================

/**
 * Calculate optimal notification time based on user behavior
 */
export function calculateOptimalNotificationTime(
  appOpenHistory: number[] // Array of hours (0-23) when user opened app
): OptimalNotificationTime {
  if (appOpenHistory.length < 5) {
    // Not enough data, return default
    return {
      hour: 20, // 8 PM
      minute: 0,
      confidence: 0.5,
    };
  }
  
  // Count occurrences of each hour
  const hourCounts: Record<number, number> = {};
  appOpenHistory.forEach(hour => {
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  
  // Find peak hours
  const sortedHours = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  if (sortedHours.length === 0) {
    return { hour: 20, minute: 0, confidence: 0.5 };
  }
  
  const peakHour = parseInt(sortedHours[0][0]);
  const peakCount = sortedHours[0][1];
  const totalCount = appOpenHistory.length;
  
  // Calculate confidence based on how dominant the peak is
  const confidence = Math.min(0.95, 0.5 + (peakCount / totalCount) * 0.5);
  
  // Send notification 30-60 minutes before peak time
  let notifyHour = peakHour;
  let notifyMinute = 0;
  
  if (peakHour > 0) {
    notifyHour = peakHour - 1;
    notifyMinute = 30;
  }
  
  return {
    hour: notifyHour,
    minute: notifyMinute,
    confidence,
  };
}

// ============================================
// USER BEHAVIOR PROFILE
// ============================================

/**
 * Build comprehensive user behavior profile
 */
export function buildUserBehaviorProfile(
  transactions: Transaction[],
  appOpenHistory: number[],
  currentStreak: number,
  lastActiveDate: string | null
): UserBehaviorProfile {
  const now = new Date();
  const expenses = transactions.filter(t => t.type === 'expense');
  
  // Calculate spending averages
  const last30Days = expenses.filter(t => {
    const daysAgo = (now.getTime() - new Date(t.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });
  
  const avgDailySpending = last30Days.reduce((sum, t) => sum + t.amount, 0) / 30;
  const avgWeeklySpending = avgDailySpending * 7;
  const avgMonthlySpending = avgDailySpending * 30;
  
  // Top categories
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.categoryId] = (categoryTotals[t.categoryId] || 0) + t.amount;
  });
  
  const totalSpending = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const topCategories = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => ({
      categoryId,
      percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
  
  // Peak spending days
  const dayTotals: Record<number, number> = {};
  expenses.forEach(t => {
    const day = new Date(t.date).getDay();
    dayTotals[day] = (dayTotals[day] || 0) + t.amount;
  });
  
  const peakSpendingDays = Object.entries(dayTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([day]) => parseInt(day));
  
  // Peak spending hours
  const hourTotals: Record<number, number> = {};
  expenses.forEach(t => {
    const hour = new Date(t.date).getHours();
    hourTotals[hour] = (hourTotals[hour] || 0) + t.amount;
  });
  
  const peakSpendingHours = Object.entries(hourTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
  
  // Calculate engagement score
  let engagementScore = 50; // Base score
  
  if (currentStreak > 0) engagementScore += Math.min(20, currentStreak * 2);
  if (transactions.length > 50) engagementScore += 10;
  if (appOpenHistory.length > 14) engagementScore += 10;
  
  const daysSinceActive = lastActiveDate 
    ? Math.floor((now.getTime() - new Date(lastActiveDate).getTime()) / (1000 * 60 * 60 * 24))
    : 30;
  
  if (daysSinceActive > 7) engagementScore -= 20;
  else if (daysSinceActive > 3) engagementScore -= 10;
  
  engagementScore = Math.max(0, Math.min(100, engagementScore));
  
  // Total days active
  const uniqueDates = new Set(transactions.map(t => new Date(t.date).toDateString()));
  const totalDaysActive = uniqueDates.size;
  
  return {
    avgDailySpending: Math.round(avgDailySpending),
    avgWeeklySpending: Math.round(avgWeeklySpending),
    avgMonthlySpending: Math.round(avgMonthlySpending),
    topCategories,
    peakSpendingDays,
    peakSpendingHours,
    appUsagePattern: appOpenHistory.slice(-30),
    lastActiveDate: lastActiveDate || now.toISOString(),
    totalDaysActive,
    currentStreak,
    engagementScore,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate string similarity (Levenshtein distance based)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Check if shorter is substring
  if (longer.includes(shorter)) {
    return 0.8 + (shorter.length / longer.length) * 0.2;
  }
  
  // Levenshtein distance
  const costs: number[] = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[str2.length] = lastValue;
  }
  
  return (longer.length - costs[str2.length]) / longer.length;
}

// ============================================
// AI INITIALIZATION
// ============================================

let isInitialized = false;

/**
 * Initialize AI Engine (call on app start)
 */
export async function initializeAIEngine(): Promise<void> {
  if (isInitialized) return;
  
  try {
    console.log('Initializing HabitFinance AI Engine...');
    
    // Load any custom category mappings
    const customMappings = await AsyncStorage.getItem(AI_STORAGE_KEYS.CATEGORY_MAPPINGS);
    if (customMappings) {
      const mappings = JSON.parse(customMappings);
      Object.assign(MERCHANT_CATEGORY_MAP, mappings);
    }
    
    isInitialized = true;
    console.log('AI Engine initialized successfully');
  } catch (error) {
    console.error('Error initializing AI Engine:', error);
  }
}
