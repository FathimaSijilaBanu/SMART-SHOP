# SmartShop Data Flow Diagram

## Overview
This document presents the data flow architecture for the SmartShop React Native application, illustrating how data moves between different components, screens, and the data service layer.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SmartShop Mobile App                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐    ┌─────────────┐ │
│  │ SplashScreen│    │ LoginScreen  │    │ RegisterScreen  │    │ Navigation  │ │
│  │             │───▶│              │◄──▶│                 │◄──▶│ Stack       │ │
│  └─────────────┘    └──────┬───────┘    └─────────────────┘    └─────────────┘ │
│                             │                                                   │
│                             ▼                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┤
│  │                    User Authentication Flow                                 │
│  │                                                                             │
│  │  ┌─────────────────┐                    ┌─────────────────┐                │
│  │  │ Customer        │                    │ Shopkeeper      │                │
│  │  │ Dashboard       │                    │ Dashboard       │                │
│  │  │                 │                    │                 │                │
│  │  │ • View Orders   │                    │ • Manage Orders │                │
│  │  │ • Browse Products│                   │ • View Products │                │
│  │  │ • Credit Records│                    │ • Credit Records│                │
│  │  │ • Reminders     │                    │ • Reminders     │                │
│  │  └─────────────────┘                    └─────────────────┘                │
│  │           │                                       │                        │
│  │           ▼                                       ▼                        │
│  └───────────┼───────────────────────────────────────┼────────────────────────┘
│              │                                       │                         
│              ▼                                       ▼                         
│  ┌─────────────────────────────────────────────────────────────────────────────┤
│  │                        Feature Screens                                     │
│  │                                                                             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │  │Product      │  │Create       │  │Credit       │  │Reminders            ││
│  │  │Catalog      │  │Order        │  │Records      │  │                     ││
│  │  │             │  │             │  │             │  │                     ││
│  │  │• Browse     │  │• Add Items  │  │• View Credits│ │• Overdue Payments   ││
│  │  │• Search     │  │• Calculate  │  │• Make Payments│ │• Payment Reminders  ││
│  │  │• Filter     │  │• Submit     │  │• Update Status│ │• Notification System││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
│  └─────────────────────────────────────────────────────────────────────────────┤
└──────────────────────────────┼──────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Data Service Layer                                   │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┤
│  │                        DataService.ts                                      │
│  │                                                                             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │  │User         │  │Product      │  │Order        │  │Credit & Payment     ││
│  │  │Management   │  │Management   │  │Management   │  │Management           ││
│  │  │             │  │             │  │             │  │                     ││
│  │  │• Auth       │  │• CRUD Ops   │  │• Create     │  │• Credit Records     ││
│  │  │• Register   │  │• Search     │  │• Update     │  │• Payment Tracking   ││
│  │  │• Validation │  │• Filter     │  │• Status     │  │• Overdue Detection  ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
│  └─────────────────────────────────────────────────────────────────────────────┤
└──────────────────────────────┼──────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Data Storage                                       │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┤
│  │                        Mock Data Arrays                                    │
│  │                                                                             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐│
│  │  │mockUsers[]  │  │mockProducts[]│ │mockOrders[] │  │mockCreditRecords[]  ││
│  │  │             │  │             │  │             │  │                     ││
│  │  │• Customer   │  │• Name       │  │• Items      │  │• Amount Tracking    ││
│  │  │• Shopkeeper │  │• Price      │  │• Status     │  │• Due Dates          ││
│  │  │• Profile    │  │• Stock      │  │• Payment    │  │• Payment History    ││
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘│
│  └─────────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Detailed Data Flow Patterns

### 1. User Authentication Flow
```
User Input (Login/Register)
    ↓
LoginScreen/RegisterScreen
    ↓
DataService.authenticateUser() / DataService.registerUser()
    ↓
mockUsers[] validation/creation
    ↓
Navigation to Dashboard (Customer/Shopkeeper)
    ↓
User Session State Management
```

### 2. Product Management Flow
```
Product Browsing Request
    ↓
ProductCatalog Screen
    ↓
DataService.getProducts() / getProductsByCategory() / searchProducts()
    ↓
mockProducts[] filtering/searching
    ↓
Product List Display
    ↓
User Selection → Add to Order
```

### 3. Order Creation Flow
```
Product Selection
    ↓
CreateOrder Screen
    ↓
Order Item Calculation
    ↓
DataService.createOrder()
    ↓
mockOrders[] addition
    ↓
Credit Record Creation (if unpaid)
    ↓
DataService.createCreditRecord()
    ↓
mockCreditRecords[] update
```

### 4. Credit Management Flow
```
Credit Records Request
    ↓
CreditRecords Screen
    ↓
DataService.getCreditRecords()
    ↓
mockCreditRecords[] filtering by user
    ↓
Payment Processing
    ↓
DataService.updateCreditRecord()
    ↓
Amount calculations & status updates
```

### 5. Reminder System Flow
```
Scheduled Check
    ↓
Reminders Screen
    ↓
DataService.getOverdueCreditRecords()
    ↓
Date comparison with mockCreditRecords[]
    ↓
Overdue Record Identification
    ↓
Reminder Generation & Display
```

## Data Entity Relationships

### Core Entities
- **User**: Base entity for customers and shopkeepers
- **Product**: Items managed by shopkeepers, browsed by customers
- **Order**: Transaction records linking customers, shopkeepers, and products
- **CreditRecord**: Financial tracking for unpaid orders
- **Payment**: Payment transactions against credit records
- **Reminder**: Automated notifications for overdue payments

### Relationship Mapping
```
User (Customer) ──┐
                  ├── Order ──── OrderItem ──── Product
User (Shopkeeper) ┘                              │
                                                 │
User (Customer) ──── CreditRecord ──── Payment   │
                          │                     │
User (Shopkeeper) ────────┘                     │
                                                 │
CreditRecord ──── Reminder                       │
                                                 │
User (Shopkeeper) ────────────────────────────────┘
```

## Data Flow Characteristics

### 1. **Synchronous Operations**
- All data operations are currently synchronous mock operations
- Immediate response for UI updates
- No network latency considerations

### 2. **In-Memory Storage**
- Data persists only during app session
- Mock arrays serve as temporary database
- No persistent storage implementation

### 3. **Role-Based Data Access**
- Customer users: View own orders, credits, browse all products
- Shopkeeper users: Manage own products, view customer orders/credits
- Data filtering based on user type and ID

### 4. **Calculated Fields**
- Order totals calculated from item quantities and prices
- Credit remaining amounts derived from total minus paid amounts
- Overdue status determined by comparing due dates with current date

## Future Considerations

### 1. **Persistent Storage Integration**
- Replace mock arrays with database (SQLite, AsyncStorage, or remote DB)
- Implement data synchronization mechanisms
- Add offline capability with data caching

### 2. **Real-time Updates**
- WebSocket integration for live order updates
- Push notifications for payment reminders
- Real-time inventory updates

### 3. **Enhanced Security**
- JWT token-based authentication
- Encrypted data transmission
- Secure payment processing integration

### 4. **Scalability Improvements**
- Pagination for large datasets
- Lazy loading for product catalogs
- Optimized search and filtering algorithms
