// Streak Calendar Component
// Weekly view by default, expands to monthly on tap

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../common/constants';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
  loggedDates: string[]; // Array of ISO date strings
}

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentStreak,
  longestStreak,
  loggedDates,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get current week dates
  const weekDates = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dates: Date[] = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + i);
      dates.push(date);
    }
    
    return dates;
  }, []);
  
  // Get current month dates for calendar grid
  const monthDates = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates: (Date | null)[] = [];
    
    // Add empty slots for days before first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      dates.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push(new Date(year, month, i));
    }
    
    return dates;
  }, []);
  
  // Check if a date has a log
  const isDateLogged = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    return loggedDates.some(d => d.startsWith(dateStr));
  };
  
  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const today = new Date();
  const currentMonth = MONTHS[today.getMonth()];
  const currentYear = today.getFullYear();

  return (
    <View style={styles.container}>
      {/* Header */}
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons name="flame" size={24} color={COLORS.habitOrange} />
          <View style={styles.headerText}>
            <Text style={styles.streakCount}>{currentStreak} Day Streak</Text>
            <Text style={styles.streakBest}>Best: {longestStreak} days</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.expandText}>{isExpanded ? 'Weekly' : 'Monthly'}</Text>
          <Ionicons 
            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color={COLORS.textSecondary} 
          />
        </View>
      </TouchableOpacity>

      {/* Weekly View (Default) */}
      {!isExpanded && (
        <View style={styles.weekView}>
          {weekDates.map((date, index) => {
            const logged = isDateLogged(date);
            const isTodayDate = isToday(date);
            
            return (
              <View key={index} style={styles.dayColumn}>
                <Text style={[
                  styles.dayLabel,
                  isTodayDate && styles.dayLabelToday
                ]}>
                  {DAYS_OF_WEEK[index]}
                </Text>
                <View style={[
                  styles.dayCircle,
                  logged && styles.dayCircleLogged,
                  isTodayDate && styles.dayCircleToday,
                ]}>
                  {logged ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={[
                      styles.dayNumber,
                      isTodayDate && styles.dayNumberToday
                    ]}>
                      {date.getDate()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Monthly View (Expanded) */}
      {isExpanded && (
        <View style={styles.monthView}>
          <Text style={styles.monthTitle}>{currentMonth} {currentYear}</Text>
          
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS_OF_WEEK.map((day, index) => (
              <Text key={index} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>
          
          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {monthDates.map((date, index) => {
              if (!date) {
                return <View key={index} style={styles.emptyDay} />;
              }
              
              const logged = isDateLogged(date);
              const isTodayDate = isToday(date);
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              
              return (
                <View key={index} style={styles.calendarDay}>
                  <View style={[
                    styles.calendarDayInner,
                    logged && styles.calendarDayLogged,
                    isTodayDate && styles.calendarDayToday,
                    isPast && !logged && styles.calendarDayMissed,
                  ]}>
                    {logged ? (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    ) : (
                      <Text style={[
                        styles.calendarDayText,
                        isTodayDate && styles.calendarDayTextToday,
                        isPast && !logged && styles.calendarDayTextMissed,
                      ]}>
                        {date.getDate()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Logged</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>Today</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.textTertiary }]} />
              <Text style={styles.legendText}>Missed</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: SPACING.md,
  },
  streakCount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  streakBest: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  expandText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  weekView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    fontWeight: FONT_WEIGHT.medium,
  },
  dayLabelToday: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleLogged: {
    backgroundColor: COLORS.success,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  dayNumber: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  dayNumberToday: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },
  monthView: {
    marginTop: SPACING.sm,
  },
  monthTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.sm,
  },
  dayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.semibold,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarDayInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  calendarDayLogged: {
    backgroundColor: COLORS.success,
  },
  calendarDayToday: {
    backgroundColor: COLORS.primary,
  },
  calendarDayMissed: {
    backgroundColor: COLORS.textTertiary + '30',
  },
  calendarDayText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  calendarDayTextToday: {
    color: '#FFFFFF',
    fontWeight: FONT_WEIGHT.bold,
  },
  calendarDayTextMissed: {
    color: COLORS.textTertiary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
});

export default StreakCalendar;
