import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, TOUCH_TARGET } from '../constants/theme';

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  icon,
}: ActionButtonProps) {
  const bgColors = {
    primary: COLORS.accent,
    secondary: COLORS.white,
    danger: COLORS.danger,
    success: COLORS.success,
  };

  const textColors = {
    primary: COLORS.white,
    secondary: COLORS.accent,
    danger: COLORS.white,
    success: COLORS.white,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: bgColors[variant] },
        variant === 'secondary' && styles.secondaryBorder,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, { color: textColors[variant] }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: TOUCH_TARGET.minHeight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  secondaryBorder: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
  },
});
