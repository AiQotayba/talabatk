export const API_BASE_URL = __DEV__
  // ? 'http://10.199.48.207:4000/api'
  ? 'http://192.168.1.7:4000/api'
  : 'https://api.delivery-app.com/api';

// Socket URL should match API host and port (without /api)
export const SOCKET_URL = __DEV__
  ? 'http://192.168.1.7:4000'
  : 'https://api.delivery-app.com';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

export const ROUTES = {
  // Onboarding
  ONBOARDING: '/onboarding',
  
  // Auth
  LOGIN: '/login',
  SIGNUP: '/signup',
  FORGOT_PASSWORD: '/forgot-password',
  
  // Client
  CLIENT_HOME: '/(client)/(tabs)',
  CLIENT_ORDERS: '/(client)/(tabs)/orders',
  CLIENT_PROFILE: '/(client)/(tabs)/profile',
  CLIENT_ORDER_DETAIL: '/(client)/orders/[id]',
  
  // Driver
  DRIVER_HOME: '/(driver)/(tabs)',
  DRIVER_ORDERS: '/(driver)/(tabs)/orders',
  DRIVER_PROFILE: '/(driver)/(tabs)/profile',
  DRIVER_ORDER_DETAIL: '/(driver)/orders/[id]',
  
  // Admin
  ADMIN_HOME: '/(admin)/(tabs)',
  ADMIN_ORDERS: '/(admin)/(tabs)/orders',
  ADMIN_USERS: '/(admin)/(tabs)/users',
  ADMIN_ORDER_DETAIL: '/(admin)/orders/[id]',
} as const;


