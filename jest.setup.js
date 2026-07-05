// Mock AsyncStorage so the persisted Zustand store works in tests.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

// Mock Sentry — its native module isn't available under Jest.
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (c) => c,
  captureException: jest.fn(),
  addBreadcrumb: jest.fn(),
}))
