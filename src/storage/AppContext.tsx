// =============================================
// Global App Context for Workshop Manager
// Manages orders state and auth
// =============================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WorkOrder, WorkTask, UserRole } from '../types';
import { getAllOrders, saveOrder, deleteOrder as removeOrder } from './orderStorage';
import { getAuthState, loginAsAdmin, loginAsMechanic, logout as doLogout } from './authStorage';

interface AppContextType {
  // Orders
  orders: WorkOrder[];
  currentOrder: WorkOrder | null;
  setCurrentOrder: (order: WorkOrder | null) => void;
  loadOrders: () => Promise<void>;
  saveCurrentOrder: (order: WorkOrder) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  updateTask: (orderId: string, task: WorkTask) => Promise<void>;

  // Auth
  role: UserRole;
  isAdmin: boolean;
  login: (role: UserRole, pin?: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [currentOrder, setCurrentOrder] = useState<WorkOrder | null>(null);
  const [role, setRole] = useState<UserRole>('mechanic');

  const loadOrders = useCallback(async () => {
    const loaded = await getAllOrders();
    // Sort by creation date, newest first
    loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(loaded);
  }, []);

  useEffect(() => {
    loadOrders();
    getAuthState().then((state) => {
      if (state.isAuthenticated) {
        setRole(state.role);
      }
    });
  }, [loadOrders]);

  const saveCurrentOrder = useCallback(
    async (order: WorkOrder) => {
      await saveOrder(order);
      await loadOrders();
      setCurrentOrder(order);
    },
    [loadOrders]
  );

  const handleDeleteOrder = useCallback(
    async (id: string) => {
      await removeOrder(id);
      if (currentOrder?.id === id) {
        setCurrentOrder(null);
      }
      await loadOrders();
    },
    [currentOrder, loadOrders]
  );

  const updateTask = useCallback(
    async (orderId: string, task: WorkTask) => {
      const order = orders.find((o) => o.id === orderId);
      if (!order) return;

      const updatedTasks = order.tasks.map((t) => (t.id === task.id ? task : t));
      const hasTask = updatedTasks.some((t) => t.id === task.id);
      if (!hasTask) updatedTasks.push(task);

      const updatedOrder: WorkOrder = {
        ...order,
        tasks: updatedTasks,
        updatedAt: new Date().toISOString(),
      };
      await saveCurrentOrder(updatedOrder);
    },
    [orders, saveCurrentOrder]
  );

  const login = useCallback(async (loginRole: UserRole, pin?: string): Promise<boolean> => {
    if (loginRole === 'admin' && pin) {
      const success = await loginAsAdmin(pin);
      if (success) {
        setRole('admin');
        return true;
      }
      return false;
    }
    await loginAsMechanic();
    setRole('mechanic');
    return true;
  }, []);

  const handleLogout = useCallback(async () => {
    await doLogout();
    setRole('mechanic');
  }, []);

  return (
    <AppContext.Provider
      value={{
        orders,
        currentOrder,
        setCurrentOrder,
        loadOrders,
        saveCurrentOrder,
        deleteOrder: handleDeleteOrder,
        updateTask,
        role,
        isAdmin: role === 'admin',
        login,
        logout: handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
