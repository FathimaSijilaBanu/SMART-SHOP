// API Configuration
// Production backend deployed on Render
export const API_CONFIG = {
  BASE_URL: 'https://smart-shop-1.onrender.com/api', // Production backend
  // BASE_URL: 'http://192.168.20.13:8000/api', // Local network (for development)
  // BASE_URL: 'http://10.0.2.2:8000/api', // Android emulator
  // BASE_URL: 'http://localhost:8000/api', // iOS simulator
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register/',
  LOGIN: '/auth/login/',
  REFRESH_TOKEN: '/auth/token/refresh/',
  PROFILE: '/auth/profile/',
  
  // Products
  PRODUCTS: '/products/',
  PRODUCT_DETAIL: (id: string) => `/products/${id}/`,
  
  // Orders
  ORDERS: '/orders/',
  ORDER_DETAIL: (id: string) => `/orders/${id}/`,
  ORDER_CONFIRM: (id: string) => `/orders/${id}/confirm/`,
  ORDER_CANCEL: (id: string) => `/orders/${id}/cancel/`,
  
  // Credits
  CREDITS: '/credits/',
  CREDIT_DETAIL: (id: string) => `/credits/${id}/`,
  CREDIT_PAY: (id: string) => `/credits/${id}/pay/`,
  CREDITS_OVERDUE: '/credits/overdue/',
  CREDIT_PAYMENTS: '/credits/payments/',
  
  // Reminders
  REMINDERS: '/reminders/',
  REMINDER_DETAIL: (id: string) => `/reminders/${id}/`,
  REMINDER_SEND: (id: string) => `/reminders/${id}/send/`,
  REMINDERS_BULK_SEND: '/reminders/bulk-send/',
};
