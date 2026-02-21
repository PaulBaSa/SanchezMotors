// =============================================
// Offline-first local storage for Work Orders
// Uses AsyncStorage as local persistence
// Ready for Amplify DataStore sync later
// =============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkOrder, WorkTask } from '../types';
import { v4 as uuidv4 } from 'uuid';

const ORDERS_KEY = 'workshop_orders';

export async function getAllOrders(): Promise<WorkOrder[]> {
  try {
    const data = await AsyncStorage.getItem(ORDERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function getOrderById(id: string): Promise<WorkOrder | null> {
  const orders = await getAllOrders();
  return orders.find((o) => o.id === id) || null;
}

export async function saveOrder(order: WorkOrder): Promise<void> {
  const orders = await getAllOrders();
  const index = orders.findIndex((o) => o.id === order.id);

  if (index >= 0) {
    orders[index] = { ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.push(order);
  }

  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export async function deleteOrder(id: string): Promise<void> {
  const orders = await getAllOrders();
  const filtered = orders.filter((o) => o.id !== id);
  await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(filtered));
}

export function createEmptyOrder(otId: string): WorkOrder {
  const now = new Date().toISOString();
  return {
    id: otId,
    pk: `OT#${otId}`,
    sk: 'METADATA',
    createdAt: now,
    updatedAt: now,
    status: 'reception',
    vehicle: {
      vin: '',
      plates: '',
      brand: '',
      model: '',
      year: '',
      color: '',
      engine: '',
      odometer: '',
    },
    clientName: '',
    clientPhone: '',
    reasonForVisit: '',
    photos: [],
    tasks: [],
  };
}

export function createEmptyTask(orderId: string): WorkTask {
  const taskId = uuidv4();
  const now = new Date().toISOString();
  return {
    id: taskId,
    pk: `OT#${orderId}`,
    sk: `TASK#${taskId}`,
    description: '',
    status: 'pending',
    mechanicName: '',
    hoursWorked: 0,
    saleCost: 0,
    realCost: 0,
    laborSaleCost: 0,
    laborRealCost: 0,
    evidencePhotos: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

// Export data for USB/OTG backup
export async function exportDailyData(): Promise<string> {
  const orders = await getAllOrders();
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));

  return JSON.stringify(
    {
      exportDate: today,
      totalOrders: todayOrders.length,
      orders: todayOrders,
    },
    null,
    2
  );
}
