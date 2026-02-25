// 🎨 Theme System with Dark Mode Support
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from './constants';

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    accent: string;
    accentDark: string;
    accentLight: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
  spacing: typeof SPACING;
  borderRadius: typeof BORDER_RADIUS;
  fontSize: typeof FONT_SIZE;
  fontWeight: typeof FONT_WEIGHT;
}

export const lightTheme: Theme = {
  colors: {
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight,
    accent: COLORS.accent,
    accentDark: COLORS.accentDark,
    accentLight: COLORS.accentLight,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info,
    background: COLORS.background,
    surface: COLORS.surface,
    surfaceAlt: COLORS.surfaceAlt,
    border: COLORS.border,
    textPrimary: COLORS.textPrimary,
    textSecondary: COLORS.textSecondary,
    textTertiary: COLORS.textTertiary,
  },
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  fontWeight: FONT_WEIGHT,
};

export const darkTheme: Theme = {
  colors: {
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight,
    accent: COLORS.accent,
    accentDark: COLORS.accentDark,
    accentLight: COLORS.accentLight,
    success: COLORS.success,
    warning: COLORS.warning,
    danger: COLORS.danger,
    info: COLORS.info,
    background: COLORS.backgroundDark,
    surface: COLORS.surfaceDark,
    surfaceAlt: COLORS.surfaceAltDark,
    border: COLORS.borderDark,
    textPrimary: COLORS.textPrimaryDark,
    textSecondary: COLORS.textSecondaryDark,
    textTertiary: COLORS.textTertiaryDark,
  },
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  fontSize: FONT_SIZE,
  fontWeight: FONT_WEIGHT,
};

export const getTheme = (colorScheme: ColorScheme): Theme => {
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};
