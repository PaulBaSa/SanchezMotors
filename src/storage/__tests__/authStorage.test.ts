import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuthState,
  loginAsAdmin,
  loginAsMechanic,
  logout,
  getAdminPin,
  setAdminPin,
  isAdmin,
} from '../authStorage';

jest.mock('@react-native-async-storage/async-storage');

describe('authStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthState', () => {
    it('should return stored auth state if available', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      const storedState = {
        isAuthenticated: true,
        role: 'admin' as const,
        pin: '1234',
      };

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedState));

      const result = await getAuthState();

      expect(result).toEqual(storedState);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('workshop_auth');
    });

    it('should return default mechanic state if no auth data found', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);

      const result = await getAuthState();

      expect(result).toEqual({
        isAuthenticated: false,
        role: 'mechanic',
        pin: '',
      });
    });

    it('should return default state on storage error', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getAuthState();

      expect(result).toEqual({
        isAuthenticated: false,
        role: 'mechanic',
        pin: '',
      });
    });

    it('should handle invalid JSON gracefully', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockRejectedValue(new SyntaxError('Invalid JSON'));

      const result = await getAuthState();

      expect(result).toEqual({
        isAuthenticated: false,
        role: 'mechanic',
        pin: '',
      });
    });
  });

  describe('loginAsAdmin', () => {
    it('should return true and save admin auth state when PIN matches', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('1234'); // default PIN
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      const result = await loginAsAdmin('1234');

      expect(result).toBe(true);
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'workshop_auth',
        expect.stringContaining('"role":"admin"')
      );
    });

    it('should return false when PIN does not match', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('1234');
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      const result = await loginAsAdmin('wrong_pin');

      expect(result).toBe(false);
      expect(mockAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should match against custom admin PIN', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('5678');
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      const result = await loginAsAdmin('5678');

      expect(result).toBe(true);
    });

    it('should store isAuthenticated as true for admin login', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('1234');
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await loginAsAdmin('1234');

      const callArgs = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedState = JSON.parse(callArgs[1]);
      expect(storedState.isAuthenticated).toBe(true);
    });

    it('should store PIN in auth state', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('1234');
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await loginAsAdmin('1234');

      const callArgs = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedState = JSON.parse(callArgs[1]);
      expect(storedState.pin).toBe('1234');
    });
  });

  describe('loginAsMechanic', () => {
    it('should set mechanic role and isAuthenticated true', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await loginAsMechanic();

      const callArgs = (mockAsyncStorage.setItem as jest.Mock).mock.calls[0];
      const storedState = JSON.parse(callArgs[1]);

      expect(storedState.isAuthenticated).toBe(true);
      expect(storedState.role).toBe('mechanic');
      expect(storedState.pin).toBe('');
    });

    it('should call AsyncStorage.setItem with correct key', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await loginAsMechanic();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'workshop_auth',
        expect.any(String)
      );
    });
  });

  describe('logout', () => {
    it('should remove auth state from storage', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.removeItem.mockResolvedValue(undefined as any);

      await logout();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('workshop_auth');
    });

    it('should handle removal errors gracefully', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Storage error'));

      await expect(logout()).rejects.toThrow('Storage error');
    });
  });

  describe('getAdminPin', () => {
    it('should return stored admin PIN', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue('9876');

      const result = await getAdminPin();

      expect(result).toBe('9876');
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('admin_pin');
    });

    it('should return default PIN when none stored', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);

      const result = await getAdminPin();

      expect(result).toBe('1234');
    });

    it('should return default PIN on storage error', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await getAdminPin();

      expect(result).toBe('1234');
    });

    it('should not throw on error', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Access denied'));

      await expect(getAdminPin()).resolves.toBe('1234');
    });
  });

  describe('setAdminPin', () => {
    it('should save new admin PIN to storage', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await setAdminPin('5555');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('admin_pin', '5555');
    });

    it('should accept numeric PIN as string', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.setItem.mockResolvedValue(undefined as any);

      await setAdminPin('0000');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('admin_pin', '0000');
    });

    it('should propagate storage errors', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage full'));

      await expect(setAdminPin('1111')).rejects.toThrow('Storage full');
    });
  });

  describe('isAdmin', () => {
    it('should return true when user role is admin', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          isAuthenticated: true,
          role: 'admin',
          pin: '1234',
        })
      );

      const result = await isAdmin();

      expect(result).toBe(true);
    });

    it('should return false when user role is mechanic', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          isAuthenticated: true,
          role: 'mechanic',
          pin: '',
        })
      );

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(undefined as any);

      const result = await isAdmin();

      expect(result).toBe(false);
    });

    it('should call getAuthState internally', async () => {
      const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify({
          isAuthenticated: true,
          role: 'admin',
          pin: '1234',
        })
      );

      await isAdmin();

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('workshop_auth');
    });
  });
});
