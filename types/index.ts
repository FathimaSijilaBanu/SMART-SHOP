// Core type definitions for SmartShop

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'customer' | 'shopkeeper';
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl?: string;
  shopkeeperId: string;
}

export interface CreditRecord {
  id: string;
  customerId: string;
  customerName: string;
  shopkeeperId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: Date;
  status: 'pending' | 'overdue' | 'paid';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  shopkeeperId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  creditRecordId: string;
  amount: number;
  paymentDate: Date;
  method: 'cash' | 'card' | 'upi' | 'other';
  notes?: string;
}

export interface Reminder {
  id: string;
  creditRecordId: string;
  customerId: string;
  message: string;
  scheduledDate: Date;
  sent: boolean;
  sentDate?: Date;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  CustomerDashboard: { userId: string; userName: string };
  ShopkeeperDashboard: { userId: string; userName: string };
  ProductCatalog: { userType: 'customer' | 'shopkeeper'; userId: string };
  CreditRecords: { userId: string; userType: 'customer' | 'shopkeeper'; userName: string };
  CreateOrder: { userId: string; userName: string; prefilledItems?: OrderItem[]; totalAmount?: number };
  Reminders: { userId: string; userType: 'customer' | 'shopkeeper'; userName: string };
  OrderHistory: undefined;
  Profile: undefined;
};
