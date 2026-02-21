// =============================================
// Simple PIN-based auth for Admin/Mechanic roles
// Will be replaced with Cognito in production
// =============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, UserRole } from '../types';

const AUTH_KEY = 'workshop_auth';
const DEFAULT_ADMIN_PIN = '1234';

export async function getAuthState(): Promise<AuthState> {
  try {
    const data = await AsyncStorage.getItem(AUTH_KEY);
    if (data) return JSON.parse(data);
  } catch {
    // ignore
  }
  return { isAuthenticated: false, role: 'mechanic', pin: '' };
}

export async function loginAsAdmin(pin: string): Promise<boolean> {
  // In production, validate against Cognito
  const savedPin = await getAdminPin();
  if (pin === savedPin) {
    const state: AuthState = { isAuthenticated: true, role: 'admin', pin };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
    return true;
  }
  return false;
}

export async function loginAsMechanic(): Promise<void> {
  const state: AuthState = {
    isAuthenticated: true,
    role: 'mechanic',
    pin: '',
  };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(state));
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}

export async function getAdminPin(): Promise<string> {
  try {
    const pin = await AsyncStorage.getItem('admin_pin');
    return pin || DEFAULT_ADMIN_PIN;
  } catch {
    return DEFAULT_ADMIN_PIN;
  }
}

export async function setAdminPin(pin: string): Promise<void> {
  await AsyncStorage.setItem('admin_pin', pin);
}

export async function isAdmin(): Promise<boolean> {
  const state = await getAuthState();
  return state.role === 'admin';
}
