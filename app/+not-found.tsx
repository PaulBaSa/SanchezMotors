import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
      }}
    >
      <Ionicons
        name="help-circle"
        size={80}
        color={COLORS.textLight}
        style={{ marginBottom: SPACING.lg }}
      />
      <Text
        style={{
          fontSize: FONT_SIZES.xxl,
          fontWeight: '800',
          color: COLORS.textPrimary,
          marginBottom: SPACING.md,
          textAlign: 'center',
        }}
      >
        Página no encontrada
      </Text>
      <Text
        style={{
          fontSize: FONT_SIZES.md,
          color: COLORS.textSecondary,
          marginBottom: SPACING.xl,
          textAlign: 'center',
        }}
      >
        La ruta "{pathname}" no existe
      </Text>

      <TouchableOpacity
        onPress={() => router.replace('/(tabs)/reception')}
        style={{
          backgroundColor: COLORS.primary,
          paddingVertical: SPACING.md,
          paddingHorizontal: SPACING.lg,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: COLORS.white,
            fontSize: FONT_SIZES.md,
            fontWeight: '700',
          }}
        >
          Volver al inicio
        </Text>
      </TouchableOpacity>
    </View>
  );
}
