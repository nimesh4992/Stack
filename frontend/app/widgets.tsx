// Widgets Configuration Screen
// Manage home screen widgets for Stack app

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/core/presentation/components/Card';
import {
  WIDGETS,
  WidgetConfig,
  areWidgetsSupported,
  getWidgetInstructions,
  WIDGET_DIMENSIONS,
} from '../src/core/services/widgetService';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../src/core/common/constants';

const WIDGET_ICONS: Record<string, string> = {
  quick_expense: 'add-circle',
  daily_summary: 'pie-chart',
  streak_counter: 'flame',
  habit_rings: 'fitness',
  budget_progress: 'wallet',
};

const WIDGET_COLORS: Record<string, string> = {
  quick_expense: COLORS.primary,
  daily_summary: COLORS.habitOrange,
  streak_counter: COLORS.danger,
  habit_rings: COLORS.habitPurple,
  budget_progress: COLORS.success,
};

export default function WidgetsScreen() {
  const router = useRouter();
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  
  const isSupported = areWidgetsSupported();

  const handleWidgetPress = (widget: WidgetConfig) => {
    setSelectedWidget(selectedWidget === widget.id ? null : widget.id);
  };

  const showInstructions = () => {
    Alert.alert(
      'Add Widget to Home Screen',
      getWidgetInstructions(),
      [{ text: 'Got it!' }]
    );
  };

  const renderSizeIndicator = (sizes: ('small' | 'medium' | 'large')[]) => {
    return (
      <View style={styles.sizeIndicators}>
        {sizes.map((size, index) => (
          <View 
            key={size}
            style={[
              styles.sizeIndicator,
              size === 'small' && styles.sizeSmall,
              size === 'medium' && styles.sizeMedium,
              size === 'large' && styles.sizeLarge,
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']} data-testid="widgets-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="widgets-back-btn">
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Widgets</Text>
        <TouchableOpacity onPress={showInstructions} style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Platform Info */}
        {!isSupported ? (
          <Card style={styles.warningCard}>
            <Ionicons name="warning" size={24} color={COLORS.warning} />
            <Text style={styles.warningText}>
              Widgets are only available on iOS and Android devices. They're not supported in web browsers.
            </Text>
          </Card>
        ) : (
          <Card style={styles.infoCard}>
            <Ionicons name="apps" size={24} color={COLORS.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Home Screen Widgets</Text>
              <Text style={styles.infoText}>
                Add Stack widgets to your home screen for quick access to your finances.
              </Text>
            </View>
          </Card>
        )}

        {/* How to Add Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Add</Text>
          <Card style={styles.howToCard}>
            <View style={styles.howToStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                {Platform.OS === 'ios' 
                  ? 'Long press on your home screen'
                  : 'Long press on your home screen'}
              </Text>
            </View>
            <View style={styles.howToStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                {Platform.OS === 'ios'
                  ? 'Tap the + button and search for "Stack"'
                  : 'Tap "Widgets" and find "Stack"'}
              </Text>
            </View>
            <View style={styles.howToStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                Choose your preferred widget size and add it
              </Text>
            </View>
          </Card>
        </View>

        {/* Available Widgets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Widgets</Text>
          
          {WIDGETS.map((widget) => (
            <TouchableOpacity
              key={widget.id}
              activeOpacity={0.8}
              onPress={() => handleWidgetPress(widget)}
            >
              <Card style={[
                styles.widgetCard,
                selectedWidget === widget.id && styles.widgetCardSelected,
              ]}>
                <View style={styles.widgetHeader}>
                  <View style={[styles.widgetIcon, { backgroundColor: WIDGET_COLORS[widget.id] + '20' }]}>
                    <Ionicons 
                      name={WIDGET_ICONS[widget.id] as any} 
                      size={24} 
                      color={WIDGET_COLORS[widget.id]} 
                    />
                  </View>
                  <View style={styles.widgetInfo}>
                    <Text style={styles.widgetName}>{widget.name}</Text>
                    {renderSizeIndicator(widget.sizes)}
                  </View>
                  <Ionicons 
                    name={selectedWidget === widget.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                </View>
                
                {selectedWidget === widget.id && (
                  <View style={styles.widgetDetails}>
                    <View style={styles.detailDivider} />
                    <Text style={styles.widgetDescription}>{widget.description}</Text>
                    
                    <View style={styles.widgetMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="resize" size={16} color={COLORS.textTertiary} />
                        <Text style={styles.metaText}>
                          {widget.sizes.join(', ')} sizes
                        </Text>
                      </View>
                      {widget.refreshInterval > 0 && (
                        <View style={styles.metaItem}>
                          <Ionicons name="refresh" size={16} color={COLORS.textTertiary} />
                          <Text style={styles.metaText}>
                            Updates every {widget.refreshInterval} min
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Widget Preview */}
                    <View style={[
                      styles.widgetPreview,
                      { backgroundColor: WIDGET_COLORS[widget.id] + '10' }
                    ]}>
                      <Ionicons 
                        name={WIDGET_ICONS[widget.id] as any} 
                        size={32} 
                        color={WIDGET_COLORS[widget.id]} 
                      />
                      <Text style={[styles.previewText, { color: WIDGET_COLORS[widget.id] }]}>
                        {widget.name} Preview
                      </Text>
                    </View>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Card style={styles.noteCard}>
          <View style={styles.noteIcon}>
            <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.noteText}>
            Widgets require a production build of the app installed from the App Store or Play Store. 
            They won't appear in development or Expo Go builds.
          </Text>
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
  },
  helpButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '10',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  warningText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  howToCard: {
    padding: SPACING.lg,
  },
  howToStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  stepNumberText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  stepText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  widgetCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  widgetCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  widgetInfo: {
    flex: 1,
  },
  widgetName: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  sizeIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  sizeIndicator: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 2,
  },
  sizeSmall: {
    width: 16,
    height: 8,
  },
  sizeMedium: {
    width: 28,
    height: 8,
  },
  sizeLarge: {
    width: 28,
    height: 16,
  },
  widgetDetails: {
    marginTop: SPACING.md,
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  widgetDescription: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  widgetMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  metaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textTertiary,
  },
  widgetPreview: {
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: SPACING.sm,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: SPACING.md,
    backgroundColor: COLORS.primary + '08',
    gap: SPACING.sm,
  },
  noteIcon: {
    marginTop: 2,
  },
  noteText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
