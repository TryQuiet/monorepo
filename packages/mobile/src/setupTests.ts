/* eslint-disable */

jest.mock('pkijs/src/CryptoEngine', () => ({
  CryptoEngine: jest.fn(),
}));

jest.mock('pkijs/src/common', () => ({
  setEngine: jest.fn(),
}));

jest.mock('react-native-config', () => ({
  NODE_ENV: 'staging',
}));

jest.mock('nodejs-mobile-react-native', () => ({
  nodejs: jest.fn(),
}));

jest.mock('react-native-push-notification', () => ({
  PushNotification: jest.fn(),
}));

jest.mock('react-native-find-free-port', () => ({
  getFirstStartingFrom: jest.fn()
}))
