import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateOTId } from '../otGenerator';

jest.mock('@react-native-async-storage/async-storage');

describe('otGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('generateOTId', () => {
    it('should generate OT ID with correct format YYMMDD-##', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      // Set fixed date: 2025-06-15
      jest.setSystemTime(new Date('2025-06-15T10:30:00Z'));

      const result = await generateOTId();

      expect(result).toMatch(/^250615-\d{2}$/);
    });

    it('should start counter at 01 for first OT of the day', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.setSystemTime(new Date('2025-02-21T08:00:00Z'));

      const result = await generateOTId();

      expect(result).toBe('250221-01');
    });

    it('should increment counter for same day', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const mockCounter = { date: '250221', count: 5 };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCounter));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.setSystemTime(new Date('2025-02-21T10:00:00Z'));

      const result = await generateOTId();

      expect(result).toBe('250221-06');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'ot_counter',
        JSON.stringify({ date: '250221', count: 6 })
      );
    });

    it('should reset counter to 01 on new day', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const mockCounter = { date: '250220', count: 10 };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockCounter));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.setSystemTime(new Date('2025-02-21T08:00:00Z'));

      const result = await generateOTId();

      expect(result).toBe('250221-01');
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'ot_counter',
        JSON.stringify({ date: '250221', count: 1 })
      );
    });

    it('should pad counter with zeros to 2 digits', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.setSystemTime(new Date('2025-12-31T23:59:59Z'));

      const result = await generateOTId();

      expect(result).toMatch(/-\d{2}$/);
      expect(result).toBe('251231-01');
    });

    it('should handle year boundary correctly', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      // Test year 2024
      jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
      const result2024 = await generateOTId();
      expect(result2024).toMatch(/^240101-/);

      // Test year 2025
      jest.setSystemTime(new Date('2025-12-31T23:59:59Z'));
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      const result2025 = await generateOTId();
      expect(result2025).toMatch(/^251231-/);
    });

    it('should persist counter to AsyncStorage', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.setSystemTime(new Date('2025-06-15T10:00:00Z'));

      await generateOTId();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'ot_counter',
        expect.stringContaining('"date":"250615"')
      );
    });

    it('should generate fallback ID if AsyncStorage fails on read', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      jest.setSystemTime(new Date('2025-03-10T12:00:00Z'));

      const result = await generateOTId();

      expect(result).toMatch(/^250310-\d{2}$/);
      const parts = result.split('-');
      const sequence = parseInt(parts[1], 10);
      expect(sequence).toBeGreaterThanOrEqual(1);
      expect(sequence).toBeLessThanOrEqual(99);
    });

    it('should handle consecutive calls correctly', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

      jest.setSystemTime(new Date('2025-02-21T08:00:00Z'));

      // First call
      mockAsyncStorage.getItem.mockResolvedValueOnce(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined as any);
      const result1 = await generateOTId();
      expect(result1).toBe('250221-01');

      // Second call - update mock to return the stored counter
      mockAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify({ date: '250221', count: 1 })
      );
      mockAsyncStorage.setItem.mockResolvedValueOnce(undefined as any);
      const result2 = await generateOTId();
      expect(result2).toBe('250221-02');
    });

    it('should handle December edge case correctly', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      // December 15, 2025
      jest.setSystemTime(new Date('2025-12-15T10:00:00Z'));

      const result = await generateOTId();

      expect(result).toBe('251215-01');
      expect(result.startsWith('251215')).toBe(true);
    });
  });
});
