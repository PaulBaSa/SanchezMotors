// =============================================
// Tab Navigation Layout
// 3 tabs: Reception, Tasks (Kanban), Budget
// High contrast with large icons for workshop use
// =============================================

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TOUCH_TARGET, FONT_SIZES } from '../../src/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.highlight,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.primary,
          borderTopWidth: 0,
          height: 80 + insets.bottom,
          paddingBottom: 12 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.sm,
          fontWeight: '700',
        },
        tabBarIconStyle: {
          marginBottom: -4,
        },
      }}
      initialRouteName="reception"
    >
      <Tabs.Screen
        name="reception"
        options={{
          title: 'Recepción',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" size={TOUCH_TARGET.iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tareas',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct" size={TOUCH_TARGET.iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calculator" size={TOUCH_TARGET.iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
