// =============================================
// Root Layout - Workshop Manager
// Wraps entire app with AppProvider context
// =============================================

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../src/storage/AppContext';
import { COLORS } from '../src/constants/theme';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AppProvider>
  );
}
