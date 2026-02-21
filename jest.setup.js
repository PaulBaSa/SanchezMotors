// Jest setup file for React Native testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => null),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => null),
  getAllKeys: jest.fn(async () => []),
  clear: jest.fn(async () => null),
  multiSet: jest.fn(async () => null),
  multiGet: jest.fn(async () => []),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn(),
  usePathname: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Suppress console warnings during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Non-serializable values'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
