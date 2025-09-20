// Data service for managing local storage and mock data
import { User, Product, CreditRecord, Order, Payment, Reminder } from '../types';

class DataService {
  // Mock data for development
  private mockUsers: User[] = [
    {
      id: '1',
      name: 'John Customer',
      email: 'customer@test.com',
      phone: '+91-9876543210',
      type: 'customer',
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Shop Owner',
      email: 'shop@test.com',
      phone: '+91-9876543211',
      type: 'shopkeeper',
      createdAt: new Date(),
    },
  ];

  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Rice (1kg)',
      description: 'Premium Basmati Rice',
      price: 80,
      category: 'Groceries',
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '2',
      name: 'Milk (1L)',
      description: 'Fresh Dairy Milk',
      price: 60,
      category: 'Dairy',
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '3',
      name: 'Bread',
      description: 'Whole Wheat Bread',
      price: 25,
      category: 'Bakery',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '4',
      name: 'Tomatoes (500g)',
      description: 'Fresh Red Tomatoes',
      price: 40,
      category: 'Vegetables',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1546470427-e5d491d7cd04?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '5',
      name: 'Bananas (1kg)',
      description: 'Fresh Ripe Bananas',
      price: 50,
      category: 'Fruits',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '6',
      name: 'Eggs (12 pcs)',
      description: 'Farm Fresh Eggs',
      price: 70,
      category: 'Dairy',
      stock: 40,
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '7',
      name: 'Cooking Oil (1L)',
      description: 'Refined Sunflower Oil',
      price: 120,
      category: 'Groceries',
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
    {
      id: '8',
      name: 'Onions (1kg)',
      description: 'Fresh Red Onions',
      price: 35,
      category: 'Vegetables',
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop',
      shopkeeperId: '2',
    },
  ];

  private mockCreditRecords: CreditRecord[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'John Customer',
      shopkeeperId: '2',
      totalAmount: 500,
      paidAmount: 200,
      remainingAmount: 300,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date(),
    },
  ];

  private mockOrders: Order[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'John Customer',
      shopkeeperId: '2',
      items: [
        {
          productId: '1',
          productName: 'Rice (1kg)',
          quantity: 2,
          price: 80,
          totalPrice: 160,
        },
        {
          productId: '2',
          productName: 'Milk (1L)',
          quantity: 3,
          price: 60,
          totalPrice: 180,
        },
      ],
      totalAmount: 340,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  ];

  // User authentication
  async authenticateUser(email: string, password: string, userType: 'customer' | 'shopkeeper'): Promise<User | null> {
    // Mock authentication - in real app, this would call an API
    const user = this.mockUsers.find(u => u.email === email && u.type === userType);
    return user || null;
  }

  // User registration
  async registerUser(name: string, email: string, phone: string, password: string, userType: 'customer' | 'shopkeeper'): Promise<User | null> {
    // Check if user already exists
    const existingUser = this.mockUsers.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      name,
      email,
      phone,
      type: userType,
      createdAt: new Date(),
    };

    // Add to mock users array
    this.mockUsers.push(newUser);
    return newUser;
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<boolean> {
    const user = this.mockUsers.find(u => u.email === email);
    return !!user;
  }

  // Product management
  async getProducts(shopkeeperId?: string): Promise<Product[]> {
    if (shopkeeperId) {
      return this.mockProducts.filter(p => p.shopkeeperId === shopkeeperId);
    }
    return this.mockProducts;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.mockProducts.filter(p => p.category === category);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return this.mockProducts.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Credit record management
  async getCreditRecords(userId: string, userType: 'customer' | 'shopkeeper'): Promise<CreditRecord[]> {
    if (userType === 'customer') {
      return this.mockCreditRecords.filter(cr => cr.customerId === userId);
    } else {
      return this.mockCreditRecords.filter(cr => cr.shopkeeperId === userId);
    }
  }

  async createCreditRecord(record: Omit<CreditRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<CreditRecord> {
    const newRecord: CreditRecord = {
      ...record,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockCreditRecords.push(newRecord);
    return newRecord;
  }

  async updateCreditRecord(id: string, updates: Partial<CreditRecord>): Promise<CreditRecord | null> {
    const index = this.mockCreditRecords.findIndex(cr => cr.id === id);
    if (index !== -1) {
      this.mockCreditRecords[index] = {
        ...this.mockCreditRecords[index],
        ...updates,
        updatedAt: new Date(),
      };
      return this.mockCreditRecords[index];
    }
    return null;
  }

  // Order management
  async getOrders(userId: string, userType: 'customer' | 'shopkeeper'): Promise<Order[]> {
    if (userType === 'customer') {
      return this.mockOrders.filter(o => o.customerId === userId);
    } else {
      return this.mockOrders.filter(o => o.shopkeeperId === userId);
    }
  }

  async createOrder(order: Omit<Order, 'id' | 'orderDate'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      orderDate: new Date(),
    };
    this.mockOrders.push(newOrder);
    return newOrder;
  }

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const index = this.mockOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      this.mockOrders[index].status = status;
      return this.mockOrders[index];
    }
    return null;
  }

  // Get overdue credit records for reminders
  async getOverdueCreditRecords(): Promise<CreditRecord[]> {
    const now = new Date();
    return this.mockCreditRecords.filter(cr => 
      cr.status === 'pending' && 
      cr.dueDate < now &&
      cr.remainingAmount > 0
    );
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    const categories = [...new Set(this.mockProducts.map(p => p.category))];
    return categories;
  }
}

export default new DataService();
