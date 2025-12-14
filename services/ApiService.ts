// API Service for making authenticated requests to Django backend
import AuthService from './AuthService';
import { API_CONFIG, API_ENDPOINTS } from './api.config';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  stock: number;
  image: string | null;
  shopkeeper: number;
  shopkeeper_name: string;
  in_stock: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: number;
  product: number;
  product_name: string;
  quantity: number;
  price: string;
  total_price: string;
}

export interface Order {
  id?: number;
  customer: number;
  customer_name: string;
  shopkeeper: number;
  shopkeeper_name: string;
  items: OrderItem[];
  total_amount: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'delivered';
  payment_status: 'unpaid' | 'paid' | 'partial';
  order_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: number;
  credit_record: number;
  amount: string;
  payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer';
  notes: string;
  payment_date: string;
  created_at: string;
}

export interface CreditRecord {
  id: number;
  customer: number;
  customer_name: string;
  shopkeeper: number;
  shopkeeper_name: string;
  total_amount: string;
  paid_amount: string;
  remaining_amount: string;
  due_date: string;
  status: 'pending' | 'overdue' | 'paid';
  payments: Payment[];
  created_at: string;
  updated_at: string;
}

export interface Reminder {
  id: number;
  credit_record: number;
  credit_record_amount: string;
  customer: number;
  customer_name: string;
  message: string;
  scheduled_date: string;
  sent: boolean;
  sent_date: string | null;
  created_at: string;
  updated_at: string;
}

class ApiService {
  // Make authenticated request with automatic token refresh
  private async makeRequest(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<any> {
    try {
      const token = await AuthService.getAccessToken();
      
      if (!token) {
        throw new Error('No access token available. Please login.');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...API_CONFIG.HEADERS,
          ...options.headers,
          'Authorization': `Bearer ${token}`,
        },
      });

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryCount === 0) {
        try {
          await AuthService.refreshAccessToken();
          return this.makeRequest(endpoint, options, retryCount + 1);
        } catch (refreshError) {
          await AuthService.clearAuth();
          throw new Error('Session expired. Please login again.');
        }
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(this.formatErrorMessage(responseData, response.status));
      }

      return responseData;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // ==================== PRODUCT ENDPOINTS ====================

  async getProducts(params?: {
    category?: string;
    shopkeeper?: number;
    search?: string;
    ordering?: string;
  }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.shopkeeper) queryParams.append('shopkeeper', params.shopkeeper.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const query = queryParams.toString();
    const endpoint = query ? `${API_ENDPOINTS.PRODUCTS}?${query}` : API_ENDPOINTS.PRODUCTS;

    const response = await this.makeRequest(endpoint, { method: 'GET' });
    return response.results || [];
  }

  async getProduct(id: number): Promise<Product> {
    return this.makeRequest(API_ENDPOINTS.PRODUCT_DETAIL(id.toString()), {
      method: 'GET',
    });
  }

  async createProduct(data: FormData): Promise<Product> {
    const token = await AuthService.getAccessToken();
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCTS}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: data,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(this.formatErrorMessage(responseData, response.status));
    }

    return responseData;
  }

  async updateProduct(id: number, data: FormData): Promise<Product> {
    const token = await AuthService.getAccessToken();
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.PRODUCT_DETAIL(id.toString())}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(this.formatErrorMessage(responseData, response.status));
    }

    return responseData;
  }

  async deleteProduct(id: number): Promise<void> {
    await this.makeRequest(API_ENDPOINTS.PRODUCT_DETAIL(id.toString()), {
      method: 'DELETE',
    });
  }

  // ==================== ORDER ENDPOINTS ====================

  async getOrders(): Promise<Order[]> {
    const response = await this.makeRequest(API_ENDPOINTS.ORDERS, { method: 'GET' });
    // Handle paginated response like products
    return response.results || response || [];
  }

  async getOrder(id: number): Promise<Order> {
    return this.makeRequest(API_ENDPOINTS.ORDER_DETAIL(id.toString()), {
      method: 'GET',
    });
  }

  async createOrder(data: {
    shopkeeper_id: number;
    items: Array<{ product_id: number; quantity: number }>;
    payment_status: 'unpaid' | 'paid' | 'partial';
  }): Promise<Order> {
    return this.makeRequest(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order> {
    return this.makeRequest(API_ENDPOINTS.ORDER_DETAIL(id.toString()), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async confirmOrder(id: number): Promise<Order> {
    return this.makeRequest(API_ENDPOINTS.ORDER_CONFIRM(id.toString()), {
      method: 'POST',
    });
  }

  async cancelOrder(id: number): Promise<Order> {
    return this.makeRequest(API_ENDPOINTS.ORDER_CANCEL(id.toString()), {
      method: 'POST',
    });
  }

  // ==================== CREDIT ENDPOINTS ====================

  async getCreditRecords(params?: { status?: string }): Promise<CreditRecord[]> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const endpoint = query ? `${API_ENDPOINTS.CREDITS}?${query}` : API_ENDPOINTS.CREDITS;

    const response = await this.makeRequest(endpoint, { method: 'GET' });
    // Handle paginated response like products and orders
    return response.results || response || [];
  }

  async getCreditRecord(id: number): Promise<CreditRecord> {
    return this.makeRequest(API_ENDPOINTS.CREDIT_DETAIL(id.toString()), {
      method: 'GET',
    });
  }

  async createCreditRecord(data: {
    customer: number;
    total_amount: number;
    due_date: string;
  }): Promise<CreditRecord> {
    return this.makeRequest(API_ENDPOINTS.CREDITS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async makePayment(creditRecordId: number, data: {
    amount: number;
    payment_method: 'cash' | 'upi' | 'card' | 'bank_transfer';
    notes?: string;
  }): Promise<Payment> {
    return this.makeRequest(API_ENDPOINTS.CREDIT_PAY(creditRecordId.toString()), {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOverdueCredits(): Promise<CreditRecord[]> {
    return this.makeRequest(API_ENDPOINTS.CREDITS_OVERDUE, { method: 'GET' });
  }

  async getPayments(): Promise<Payment[]> {
    return this.makeRequest(API_ENDPOINTS.CREDIT_PAYMENTS, { method: 'GET' });
  }

  // ==================== REMINDER ENDPOINTS ====================

  async getReminders(): Promise<Reminder[]> {
    return this.makeRequest(API_ENDPOINTS.REMINDERS, { method: 'GET' });
  }

  async getReminder(id: number): Promise<Reminder> {
    return this.makeRequest(API_ENDPOINTS.REMINDER_DETAIL(id.toString()), {
      method: 'GET',
    });
  }

  async createReminder(data: {
    credit_record: number;
    message: string;
    scheduled_date: string;
  }): Promise<Reminder> {
    return this.makeRequest(API_ENDPOINTS.REMINDERS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder> {
    return this.makeRequest(API_ENDPOINTS.REMINDER_DETAIL(id.toString()), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async sendReminder(id: number): Promise<Reminder> {
    return this.makeRequest(API_ENDPOINTS.REMINDER_SEND(id.toString()), {
      method: 'POST',
    });
  }

  async sendBulkReminders(): Promise<{ message: string; reminders: Reminder[] }> {
    return this.makeRequest(API_ENDPOINTS.REMINDERS_BULK_SEND, {
      method: 'POST',
    });
  }

  // ==================== HELPER METHODS ====================

  private formatErrorMessage(errorData: any, statusCode: number): string {
    if (typeof errorData === 'string') {
      return errorData;
    }
    
    if (errorData.detail) {
      return errorData.detail;
    }
    
    if (errorData.error) {
      return errorData.error;
    }
    
    // Handle field-specific errors
    const errors: string[] = [];
    Object.keys(errorData).forEach(key => {
      if (Array.isArray(errorData[key])) {
        errors.push(`${key}: ${errorData[key].join(', ')}`);
      } else if (typeof errorData[key] === 'object') {
        errors.push(`${key}: ${JSON.stringify(errorData[key])}`);
      } else {
        errors.push(`${key}: ${errorData[key]}`);
      }
    });
    
    if (errors.length > 0) {
      return errors.join('\n');
    }
    
    // Default error messages based on status code
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

export default new ApiService();
