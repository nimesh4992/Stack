// 📅 Enhanced Streak Calendar Component (Week + Monthly View)
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../common/constants';

interface StreakCalendarProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ currentStreak }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');

  // Generate dates for current week
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });
  };

  // Generate dates for current month
  const getMonthDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const dates: (Date | null)[] = [];
    
    // Add empty slots for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      dates.push(null);
    }
    
    // Add all days of month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }

    return dates;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();
  const today = new Date();

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isLogged = (date: Date | null) => {
    if (!date) return false;
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 0 && daysDiff < currentStreak;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={18} color={COLORS.habitOrange} />
          </View>
          <View>
            <Text style={styles.title}>Streak: {currentStreak} days</Text>
            <Text style={styles.subtitle}>Keep it going!</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
        >
          <Ionicons 
            name={viewMode === 'week' ? 'calendar' : 'calendar-outline'} 
            size={18} 
            color={COLORS.primary} 
          />
          <Text style={styles.viewToggleText}>
            {viewMode === 'week' ? 'Month' : 'Week'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Calendar View */}
      {viewMode === 'week' ? (
        // Week View
        <View style={styles.weekView}>
          <View style={styles.daysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <Text key={i} style={styles.dayLabel}>{day}</Text>
            ))}
          </View>
          <View style={styles.datesRow}>
            {weekDates.map((date, index) => {
              const logged = isLogged(date);
              const todayDate = isToday(date);
              return (
                <View
                  key={index}
                  style={[
                    styles.dateCircle,
                    logged && styles.dateLogged,
                    todayDate && styles.dateToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      (logged || todayDate) && styles.dateTextActive,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {logged && !todayDate && (
                    <View style={styles.checkMark}>
                      <Ionicons name="checkmark" size={8} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        // Month View
        <View style={styles.monthView}>
          <View style={styles.daysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <Text key={i} style={styles.dayLabel}>{day}</Text>
            ))}
          </View>
          <View style={styles.monthGrid}>
            {monthDates.map((date, index) => {
              if (!date) {
                return <View key={index} style={styles.emptyDate} />;
              }
              const logged = isLogged(date);
              const todayDate = isToday(date);
              return (
                <View
                  key={index}
                  style={[
                    styles.monthDate,
                    logged && styles.dateLogged,
                    todayDate && styles.dateToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthDateText,
                      (logged || todayDate) && styles.dateTextActive,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {logged && !todayDate && (
                    <View style={styles.checkDot} />
                  )}
                </View>
              );
            })}
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
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.habitOrange + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  viewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  viewToggleText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  weekView: {
    gap: SPACING.sm,
  },
  monthView: {
    gap: SPACING.sm,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
    width: 36,
    textAlign: 'center',
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dateLogged: {
    backgroundColor: COLORS.primary + '20',
  },
  dateToday: {
    backgroundColor: COLORS.primary,
  },
  dateText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  dateTextActive: {
    color: '#FFFFFF',
  },
  checkMark: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  monthDate: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyDate: {
    width: 38,
    height: 38,
  },
  monthDateText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.textSecondary,
  },
  checkDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.success,
  },
});
