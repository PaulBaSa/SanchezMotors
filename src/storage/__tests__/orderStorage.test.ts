import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllOrders,
  getOrderById,
  saveOrder,
  deleteOrder,
  createEmptyOrder,
  createEmptyTask,
  exportDailyData,
} from '../orderStorage';
import { WorkOrder } from '../../types';

jest.mock('@react-native-async-storage/async-storage');

describe('orderStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllOrders', () => {
    it('should return empty array when no orders exist', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);

      const result = await getAllOrders();

      expect(result).toEqual([]);
    });

    it('should return parsed orders from storage', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const mockOrders = [
        { id: 'OT-001', clientName: 'John Doe' },
        { id: 'OT-002', clientName: 'Jane Smith' },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockOrders));

      const result = await getAllOrders();

      expect(result).toEqual(mockOrders);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('workshop_orders');
    });

    it('should return empty array on storage error', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getAllOrders();

      expect(result).toEqual([]);
    });

    it('should handle invalid JSON gracefully', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('invalid json {');

      const result = await getAllOrders();

      expect(result).toEqual([]);
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const mockOrder: Partial<WorkOrder> = {
        id: '250221-01',
        clientName: 'John Doe',
      };
      const mockOrders = [mockOrder, { id: '250221-02', clientName: 'Jane' }];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockOrders));

      const result = await getOrderById('250221-01');

      expect(result).toEqual(mockOrder);
    });

    it('should return null when order not found', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const mockOrders = [{ id: '250221-01', clientName: 'John' }];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockOrders));

      const result = await getOrderById('999999-99');

      expect(result).toBeNull();
    });

    it('should return null when no orders exist', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      const result = await getOrderById('250221-01');

      expect(result).toBeNull();
    });
  });

  describe('saveOrder', () => {
    it('should add new order to storage', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      const newOrder: Partial<WorkOrder> = {
        id: '250221-01',
        clientName: 'John Doe',
      };

      await saveOrder(newOrder as WorkOrder);

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toEqual(expect.objectContaining(newOrder));
    });

    it('should update existing order', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const existingOrder = { id: '250221-01', clientName: 'Old Name' };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingOrder]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      const updatedOrder = { ...existingOrder, clientName: 'New Name' } as any;

      await saveOrder(updatedOrder);

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData).toHaveLength(1);
      expect(savedData[0].clientName).toBe('New Name');
    });

    it('should update timestamp when saving existing order', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const existingOrder = {
        id: '250221-01',
        updatedAt: '2025-02-21T10:00:00Z',
      };
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([existingOrder]));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T15:30:00Z'));

      await saveOrder(existingOrder as any);

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData[0].updatedAt).toBe('2025-02-21T15:30:00.000Z');

      jest.useRealTimers();
    });

    it('should preserve other orders when updating one', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const orders = [
        { id: '250221-01', clientName: 'First' },
        { id: '250221-02', clientName: 'Second' },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(orders));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      const updatedOrder = { ...orders[0], clientName: 'Updated' } as any;
      await saveOrder(updatedOrder);

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData).toHaveLength(2);
      expect(savedData[1].clientName).toBe('Second');
    });
  });

  describe('deleteOrder', () => {
    it('should remove order from storage', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const orders = [
        { id: '250221-01', clientName: 'First' },
        { id: '250221-02', clientName: 'Second' },
      ];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(orders));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await deleteOrder('250221-01');

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('250221-02');
    });

    it('should handle deleting non-existent order gracefully', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const orders = [{ id: '250221-01', clientName: 'First' }];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(orders));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await deleteOrder('999999-99');

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData).toHaveLength(1);
    });

    it('should delete all orders when empty result', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const orders = [{ id: '250221-01', clientName: 'Only' }];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(orders));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await deleteOrder('250221-01');

      const setCall = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setCall[1]);

      expect(savedData).toHaveLength(0);
    });
  });

  describe('createEmptyOrder', () => {
    it('should create order with provided ID', () => {
      const order = createEmptyOrder('250221-01');

      expect(order.id).toBe('250221-01');
    });

    it('should create order with DynamoDB-ready pk and sk', () => {
      const order = createEmptyOrder('250221-01');

      expect(order.pk).toBe('OT#250221-01');
      expect(order.sk).toBe('METADATA');
    });

    it('should set initial status to reception', () => {
      const order = createEmptyOrder('250221-01');

      expect(order.status).toBe('reception');
    });

    it('should initialize empty vehicle info', () => {
      const order = createEmptyOrder('250221-01');

      expect(order.vehicle).toEqual({
        vin: '',
        plates: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        engine: '',
        odometer: '',
      });
    });

    it('should initialize empty arrays', () => {
      const order = createEmptyOrder('250221-01');

      expect(order.photos).toEqual([]);
      expect(order.tasks).toEqual([]);
    });

    it('should set createdAt and updatedAt to current time', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T10:30:00Z'));

      const order = createEmptyOrder('250221-01');

      expect(order.createdAt).toBe('2025-02-21T10:30:00.000Z');
      expect(order.updatedAt).toBe('2025-02-21T10:30:00.000Z');

      jest.useRealTimers();
    });

    it('should have empty client and visit info', () => {
      const order = createEmptyOrder('250221-01');

      expect(order.clientName).toBe('');
      expect(order.clientPhone).toBe('');
      expect(order.reasonForVisit).toBe('');
    });
  });

  describe('createEmptyTask', () => {
    it('should create task with generated UUID', () => {
      const task = createEmptyTask('250221-01');

      expect(task.id).toBeDefined();
      expect(typeof task.id).toBe('string');
      expect(task.id.length).toBeGreaterThan(0);
    });

    it('should set DynamoDB-ready pk', () => {
      const task = createEmptyTask('250221-01');

      expect(task.pk).toBe('OT#250221-01');
    });

    it('should set sk with TASK# prefix and task ID', () => {
      const task = createEmptyTask('250221-01');

      expect(task.sk).toMatch(/^TASK#/);
      expect(task.sk).toContain(task.id);
    });

    it('should set initial status to pending', () => {
      const task = createEmptyTask('250221-01');

      expect(task.status).toBe('pending');
    });

    it('should initialize with zero costs and hours', () => {
      const task = createEmptyTask('250221-01');

      expect(task.hoursWorked).toBe(0);
      expect(task.saleCost).toBe(0);
      expect(task.realCost).toBe(0);
      expect(task.laborSaleCost).toBe(0);
      expect(task.laborRealCost).toBe(0);
    });

    it('should initialize empty evidence photos and notes', () => {
      const task = createEmptyTask('250221-01');

      expect(task.evidencePhotos).toEqual([]);
      expect(task.notes).toBe('');
    });

    it('should set createdAt and updatedAt timestamps', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T14:15:00Z'));

      const task = createEmptyTask('250221-01');

      expect(task.createdAt).toBe('2025-02-21T14:15:00.000Z');
      expect(task.updatedAt).toBe('2025-02-21T14:15:00.000Z');

      jest.useRealTimers();
    });

    it('should have empty mechanic name and description', () => {
      const task = createEmptyTask('250221-01');

      expect(task.mechanicName).toBe('');
      expect(task.description).toBe('');
    });

    it('should generate unique IDs for consecutive calls', () => {
      const task1 = createEmptyTask('250221-01');
      const task2 = createEmptyTask('250221-01');

      expect(task1.id).not.toBe(task2.id);
    });
  });

  describe('exportDailyData', () => {
    it('should export only today orders', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T10:00:00Z'));

      const todayOrder = { id: '250221-01', createdAt: '2025-02-21T08:30:00Z' };
      const oldOrder = { id: '250220-05', createdAt: '2025-02-20T15:00:00Z' };

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify([todayOrder, oldOrder])
      );

      const result = await exportDailyData();
      const parsed = JSON.parse(result);

      expect(parsed.exportDate).toBe('2025-02-21');
      expect(parsed.orders).toHaveLength(1);
      expect(parsed.orders[0].id).toBe('250221-01');

      jest.useRealTimers();
    });

    it('should include export metadata', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const orders = [{ id: '250221-01', createdAt: '2025-02-21T08:00:00Z' }];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(orders));

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T12:00:00Z'));

      const result = await exportDailyData();
      const parsed = JSON.parse(result);

      expect(parsed).toHaveProperty('exportDate');
      expect(parsed).toHaveProperty('totalOrders');
      expect(parsed).toHaveProperty('orders');

      jest.useRealTimers();
    });

    it('should return valid JSON string', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T10:00:00Z'));

      const result = await exportDailyData();

      expect(() => JSON.parse(result)).not.toThrow();

      jest.useRealTimers();
    });

    it('should format JSON with proper indentation', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T10:00:00Z'));

      const result = await exportDailyData();

      expect(result).toContain('\n');
      expect(result).toMatch(/^\s*\{/);

      jest.useRealTimers();
    });

    it('should handle empty orders', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify([]));

      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-02-21T10:00:00Z'));

      const result = await exportDailyData();
      const parsed = JSON.parse(result);

      expect(parsed.totalOrders).toBe(0);
      expect(parsed.orders).toEqual([]);

      jest.useRealTimers();
    });
  });
});
