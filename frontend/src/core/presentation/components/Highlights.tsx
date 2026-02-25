// 🎵 Spotify Wrapped Style - Highlights Feature
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../common/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - SPACING.xl * 2;

interface HighlightCardData {
  id: string;
  type: 'stat' | 'achievement' | 'streak' | 'top_category' | 'savings';
  title: string;
  subtitle: string;
  mainValue: string;
  description: string;
  gradient: string[];
  icon: string;
  iconFamily: 'Ionicons' | 'MaterialCommunityIcons';
}

interface HighlightsProps {
  period: 'daily' | 'weekly';
  stats: {
    totalTransactions: number;
    totalSpent: number;
    totalSaved: number;
    topCategory: string;
    streak: number;
    pointsEarned: number;
  };
}

export const Highlights: React.FC<HighlightsProps> = ({ period, stats }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate highlight cards based on stats
  const generateHighlightCards = (): HighlightCardData[] => {
    const cards: HighlightCardData[] = [];
    const periodText = period === 'daily' ? 'Today' : 'This Week';

    // Card 1: Total Transactions
    cards.push({
      id: 'transactions',
      type: 'stat',
      title: `${periodText}'s Activity`,
      subtitle: 'You logged',
      mainValue: `${stats.totalTransactions}`,
      description: 'transactions',
      gradient: ['#2E5CFF', '#1E3FCC'],
      icon: 'receipt-outline',
      iconFamily: 'Ionicons',
    });

    // Card 2: Total Spent
    if (stats.totalSpent > 0) {
      cards.push({
        id: 'spent',
        type: 'stat',
        title: `${periodText}'s Spending`,
        subtitle: 'You spent',
        mainValue: `₹${stats.totalSpent.toFixed(0)}`,
        description: 'tracking your expenses',
        gradient: ['#FF6B6B', '#EE5A52'],
        icon: 'trending-down',
        iconFamily: 'Ionicons',
      });
    }

    // Card 3: Streak Achievement
    if (stats.streak >= 3) {
      cards.push({
        id: 'streak',
        type: 'streak',
        title: 'Streak Master!',
        subtitle: 'You maintained',
        mainValue: `${stats.streak} Days`,
        description: 'Keep the fire burning! 🔥',
        gradient: ['#FF9A3C', '#FF8C26'],
        icon: 'flame',
        iconFamily: 'Ionicons',
      });
    }

    // Card 4: Top Category
    if (stats.topCategory) {
      cards.push({
        id: 'category',
        type: 'top_category',
        title: 'Top Category',
        subtitle: 'Most spent on',
        mainValue: stats.topCategory,
        description: 'your biggest expense',
        gradient: ['#7C3AED', '#6D28D9'],
        icon: 'stats-chart',
        iconFamily: 'Ionicons',
      });
    }

    // Card 5: Points Earned
    if (stats.pointsEarned > 0) {
      cards.push({
        id: 'points',
        type: 'achievement',
        title: 'XP Earned',
        subtitle: 'You gained',
        mainValue: `${stats.pointsEarned} XP`,
        description: 'building great habits!',
        gradient: ['#00D4AA', '#00A389'],
        icon: 'trophy',
        iconFamily: 'Ionicons',
      });
    }

    return cards.slice(0, 5); // Max 5 cards
  };

  const highlightCards = generateHighlightCards();

  const handleShare = async () => {
    try {
      const periodText = period === 'daily' ? 'my daily' : "this week's";
      await Share.share({
        message: `I just completed ${periodText} finance tracking! 💰\n\nCheck out HabitFinance to build your financial habits!`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderCard = (card: HighlightCardData, index: number) => {
    const Icon = card.iconFamily === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    return (
      <View key={card.id} style={styles.cardContainer}>
        <LinearGradient colors={card.gradient} style={styles.card}>
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {highlightCards.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === index && styles.progressDotActive,
                ]}
              />
            ))}
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Icon name={card.icon as any} size={60} color="rgba(255, 255, 255, 0.9)" />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.subtitle}>{card.subtitle}</Text>
            <Text style={styles.mainValue}>{card.mainValue}</Text>
            <Text style={styles.description}>{card.description}</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {index + 1} of {highlightCards.length}
            </Text>
            <Text style={styles.brandText}>HabitFinance</Text>
          </View>
        </LinearGradient>
      </View>
    );
  };

  if (highlightCards.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={64} color={COLORS.textTertiary} />
        <Text style={styles.emptyText}>No highlights yet</Text>
        <Text style={styles.emptySubtext}>Start logging to see your highlights!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {period === 'daily' ? "Today's" : "This Week's"} Highlights
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
          <Ionicons name="share-social" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / CARD_WIDTH);
          setCurrentIndex(index);
        }}
        style={styles.scrollView}
      >
        {highlightCards.map((card, index) => renderCard(card, index))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download-outline" size={20} color={COLORS.primary} />
          <Text style={styles.actionButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    paddingLeft: SPACING.lg,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: SPACING.lg,
  },
  card: {
    height: 520,
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.medium,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  mainValue: {
    fontSize: 64,
    fontWeight: FONT_WEIGHT.bold,
    color: '#FFFFFF',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: FONT_WEIGHT.semibold,
  },
  brandText: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: FONT_WEIGHT.bold,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
});
