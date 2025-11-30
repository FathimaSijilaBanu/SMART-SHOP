# SmartShop Backend Integration Guide

## 🎉 Overview

The SmartShop React Native app has been successfully integrated with the Django backend! The app now uses real API calls instead of mock data, with full JWT authentication and secure token management.

## 🚀 What's Been Implemented

### 1. **Core Services**

#### **API Configuration** (`services/api.config.ts`)
- Centralized API endpoint configuration
- Base URL configuration for different environments:
  - Android Emulator: `http://10.0.2.2:8000/api`
  - iOS Simulator: `http://localhost:8000/api`
  - Physical Device: Use your computer's IP address

#### **AuthService** (`services/AuthService.ts`)
- JWT token management with secure storage using AsyncStorage
- Automatic token refresh on 401 errors
- User authentication (login/register)
- Profile management
- Session handling

#### **ApiService** (`services/ApiService.ts`)
- Centralized API calls using native `fetch`
- Automatic authentication header injection
- Token refresh on expired tokens
- Error handling with user-friendly messages
- Full CRUD operations for:
  - Products
  - Orders
  - Credit Records
  - Payments
  - Reminders

### 2. **Updated Screens**

#### **LoginScreen** ✅
- Integrated with Django backend authentication
- JWT token storage
- User type validation (customer/shopkeeper)
- Loading states with ActivityIndicator
- Enhanced error handling

#### **RegisterScreen** ✅
- Backend user registration
- Password confirmation validation
- Automatic login after registration
- Direct navigation to appropriate dashboard

#### **ProductCatalog** ✅
- Fetches products from Django API
- Real-time product filtering and search
- Category-based filtering
- Shopping cart functionality
- Product images from backend
- Price formatting for Indian Rupees (₹)

### 3. **Key Features**

✅ **JWT Authentication**
- Secure token storage
- Automatic token refresh
- Session management

✅ **Real-time Data**
- All data fetched from Django backend
- No more mock data

✅ **Error Handling**
- User-friendly error messages
- Network error handling
- Validation feedback

✅ **Loading States**
- Activity indicators during API calls
- Pull-to-refresh functionality
- Disabled buttons during loading

## 📋 Setup Instructions

### 1. **Install Dependencies**

```bash
npm install @react-native-async-storage/async-storage react-native-image-picker
```

### 2. **Start Django Backend**

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python manage.py runserver
```

The backend should be running on `http://localhost:8000`

### 3. **Configure API URL**

Edit `services/api.config.ts` based on your environment:

**For Android Emulator:**
```typescript
BASE_URL: 'http://10.0.2.2:8000/api'
```

**For iOS Simulator:**
```typescript
BASE_URL: 'http://localhost:8000/api'
```

**For Physical Device:**
```typescript
BASE_URL: 'http://YOUR_COMPUTER_IP:8000/api'  // e.g., 'http://192.168.1.100:8000/api'
```

### 4. **Run the App**

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

## 🔐 Test Credentials

Use these credentials to test the app (as documented in your backend):

**Customer Account:**
- Email: `customer@test.com`
- Password: `password123`

**Shopkeeper Account:**
- Email: `shop@test.com`
- Password: `password123`

## 📱 App Flow

### Customer Flow:
1. **Register/Login** → Customer Dashboard
2. **Browse Products** → Add to cart
3. **Create Order** → Select payment method
4. **View Credit Records** → Make payments
5. **View Reminders** → Payment due dates

### Shopkeeper Flow:
1. **Register/Login** → Shopkeeper Dashboard
2. **Manage Products** → Add/Edit/Delete products
3. **View Orders** → Confirm/Cancel orders
4. **Manage Credits** → Create credit records
5. **Send Reminders** → Notify customers

## 🎨 UI/UX Enhancements

### Modern Design Elements:
- ✅ Clean, modern color scheme
- ✅ Smooth loading states
- ✅ Activity indicators
- ✅ Pull-to-refresh functionality
- ✅ User-friendly error messages
- ✅ Responsive layouts
- ✅ Shadow effects and elevation

### Color Palette:
- Primary: `#3498db` (Blue)
- Success: `#27ae60` (Green)
- Warning: `#f39c12` (Orange)
- Danger: `#e74c3c` (Red)
- Text: `#2c3e50` (Dark Gray)
- Background: `#f8f9fa` (Light Gray)

## 🔄 API Integration Details

### Authentication Flow:
1. User logs in → Receives JWT tokens (access + refresh)
2. Tokens stored securely in AsyncStorage
3. Access token included in all API requests
4. On 401 error → Automatically refresh token
5. If refresh fails → Redirect to login

### Data Flow:
1. Screen loads → Call API via ApiService
2. ApiService checks for valid token
3. Makes authenticated request to Django
4. Handles response/errors
5. Updates UI with data

## 🛠️ Remaining Tasks

### Screens to Update:
- [ ] CustomerDashboard - Integrate with backend
- [ ] ShopkeeperDashboard - Integrate with backend
- [ ] CreateOrder - Use ApiService for order creation
- [ ] CreditRecords - Fetch from backend
- [ ] Reminders - Integrate reminder system

### Features to Add:
- [ ] Product image upload for shopkeepers
- [ ] Credit approval workflow
- [ ] Push notifications for reminders
- [ ] Order status tracking
- [ ] Payment history
- [ ] Analytics dashboard

### UI Improvements:
- [ ] Add skeleton loaders
- [ ] Implement better animations
- [ ] Add empty state illustrations
- [ ] Improve form validation feedback
- [ ] Add confirmation dialogs

## 🐛 Troubleshooting

### Common Issues:

**1. Cannot connect to backend**
- Ensure Django server is running
- Check API_CONFIG.BASE_URL is correct
- For Android emulator, use `10.0.2.2` instead of `localhost`
- For physical device, ensure phone and computer are on same network

**2. 401 Unauthorized errors**
- Check if tokens are stored correctly
- Try logging out and logging in again
- Verify backend JWT settings

**3. Network request failed**
- Check internet connection
- Verify backend is accessible
- Check firewall settings

**4. Image upload not working**
- Ensure react-native-image-picker is properly linked
- Check Android/iOS permissions

## 📚 API Documentation

Full API documentation is available in:
- `backend/API_DOCUMENTATION.md`

## 🎯 Next Steps

1. **Test all authentication flows**
2. **Update remaining screens** (Dashboards, Orders, Credits, Reminders)
3. **Add product image upload** functionality
4. **Implement credit approval** workflow
5. **Add push notifications**
6. **Test on physical devices**
7. **Performance optimization**
8. **Add error boundaries**

## 💡 Tips

- Always check Django backend logs for API errors
- Use React Native Debugger for frontend debugging
- Test with both user types (customer & shopkeeper)
- Verify token refresh works correctly
- Test offline scenarios

## 📞 Support

If you encounter any issues:
1. Check backend logs: `python manage.py runserver`
2. Check React Native logs: `npx react-native log-android` or `npx react-native log-ios`
3. Verify API endpoints in API_DOCUMENTATION.md
4. Check network connectivity

---

**Status:** ✅ Core integration complete, remaining screens in progress
**Last Updated:** 2025-11-30
