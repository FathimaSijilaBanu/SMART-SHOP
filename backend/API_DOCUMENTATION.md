# SmartShop Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register/`

Register a new user (customer or shopkeeper).

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "user_type": "customer",
  "password": "securepassword123",
  "password2": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "user_type": "customer",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Login
**POST** `/auth/login/`

Authenticate and receive JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91-9876543210",
    "user_type": "customer",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Refresh Token
**POST** `/auth/token/refresh/`

Get a new access token using refresh token.

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:** `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Get User Profile
**GET** `/auth/profile/`

Get current user's profile (requires authentication).
e
**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "user_type": "customer",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile
**PUT/PATCH** `/auth/profile/`

Update current user's profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+91-9999999999"
}
```

---

## Product Endpoints

### List Products
**GET** `/products/`

Get list of all active products. Supports filtering, searching, and ordering.

**Query Parameters:**
- `category` - Filter by category (groceries, dairy, bakery, vegetables, fruits, beverages, snacks, other)
- `shopkeeper` - Filter by shopkeeper ID
- `search` - Search in name and description
- `ordering` - Order by field (price, created_at, stock, -price, -created_at, -stock)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Rice (1kg)",
    "description": "Premium Basmati Rice",
    "price": "80.00",
    "category": "groceries",
    "stock": 50,
    "image": null,
    "shopkeeper": 2,
    "shopkeeper_name": "Shop Owner",
    "in_stock": true,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Product
**POST** `/products/`

Create a new product (shopkeeper only).

**Request Body:**
```json
{
  "name": "Sugar (1kg)",
  "description": "White Sugar",
  "price": 45.00,
  "category": "groceries",
  "stock": 100,
  "is_active": true
}
```

**Response:** `201 Created`

### Get Product Details
**GET** `/products/{id}/`

Get details of a specific product.

**Response:** `200 OK`

### Update Product
**PUT/PATCH** `/products/{id}/`

Update a product (shopkeeper only, own products).

**Request Body:**
```json
{
  "price": 50.00,
  "stock": 80
}
```

**Response:** `200 OK`

### Delete Product
**DELETE** `/products/{id}/`

Soft delete a product (shopkeeper only, own products).

**Response:** `204 No Content`

---

## Order Endpoints

### List Orders
**GET** `/orders/`

Get list of orders (filtered by user type - customers see their orders, shopkeepers see orders placed with them).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customer": 1,
    "customer_name": "John Customer",
    "shopkeeper": 2,
    "shopkeeper_name": "Shop Owner",
    "items": [
      {
        "id": 1,
        "product": 1,
        "product_name": "Rice (1kg)",
        "quantity": 2,
        "price": "80.00",
        "total_price": "160.00"
      }
    ],
    "total_amount": "210.00",
    "status": "pending",
    "payment_status": "unpaid",
    "notes": "Please deliver in the morning",
    "order_date": "2024-01-01T00:00:00Z",
    "delivery_date": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Order
**POST** `/orders/`

Create a new order (customer only).

**Request Body:**
```json
{
  "shopkeeper_id": 2,
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    },
    {
      "product_id": 2,
      "quantity": 1
    }
  ],
  "notes": "Please deliver in the morning"
}
```

**Response:** `201 Created`

### Get Order Details
**GET** `/orders/{id}/`

Get details of a specific order.

**Response:** `200 OK`

### Update Order Status
**PUT/PATCH** `/orders/{id}/`

Update order status (shopkeeper only).

**Request Body:**
```json
{
  "status": "confirmed",
  "payment_status": "paid"
}
```

**Response:** `200 OK`

### Confirm Order
**POST** `/orders/{id}/confirm/`

Confirm an order (shopkeeper only).

**Response:** `200 OK`

### Cancel Order
**POST** `/orders/{id}/cancel/`

Cancel an order (customer or shopkeeper).

**Response:** `200 OK`

---

## Credit Record Endpoints

### List Credit Records
**GET** `/credits/`

Get list of credit records (filtered by user type).

**Query Parameters:**
- `status` - Filter by status (pending, overdue, paid)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customer": 1,
    "customer_name": "John Customer",
    "shopkeeper": 2,
    "shopkeeper_name": "Shop Owner",
    "total_amount": "500.00",
    "paid_amount": "200.00",
    "remaining_amount": "300.00",
    "due_date": "2024-01-15",
    "status": "pending",
    "payments": [
      {
        "id": 1,
        "credit_record": 1,
        "amount": "200.00",
        "payment_method": "cash",
        "notes": "Partial payment",
        "payment_date": "2024-01-01T00:00:00Z",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Credit Record
**POST** `/credits/`

Create a new credit record (shopkeeper only).

**Request Body:**
```json
{
  "customer": 1,
  "total_amount": 500.00,
  "due_date": "2024-01-15"
}
```

**Response:** `201 Created`

### Get Credit Record Details
**GET** `/credits/{id}/`

Get details of a specific credit record.

**Response:** `200 OK`

### Make Payment
**POST** `/credits/{credit_record_id}/pay/`

Make a payment on a credit record.

**Request Body:**
```json
{
  "amount": 150.00,
  "payment_method": "upi",
  "notes": "Payment via UPI"
}
```

**Response:** `201 Created`

### Get Overdue Credits
**GET** `/credits/overdue/`

Get all overdue credit records for the current user.

**Response:** `200 OK`

### List Payments
**GET** `/credits/payments/`

Get list of all payments (filtered by user type).

**Response:** `200 OK`

---

## Reminder Endpoints

### List Reminders
**GET** `/reminders/`

Get list of reminders (filtered by user type).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "credit_record": 1,
    "credit_record_amount": "300.00",
    "customer": 1,
    "customer_name": "John Customer",
    "message": "Payment reminder: ₹300.00 is overdue for payment.",
    "scheduled_date": "2024-01-01T00:00:00Z",
    "sent": true,
    "sent_date": "2024-01-01T00:00:00Z",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### Create Reminder
**POST** `/reminders/`

Create a new reminder (shopkeeper only).

**Request Body:**
```json
{
  "credit_record": 1,
  "message": "Please pay your pending amount",
  "scheduled_date": "2024-01-05T10:00:00Z"
}
```

**Response:** `201 Created`

### Get Reminder Details
**GET** `/reminders/{id}/`

Get details of a specific reminder.

**Response:** `200 OK`

### Update Reminder
**PUT/PATCH** `/reminders/{id}/`

Update a reminder (shopkeeper only).

**Response:** `200 OK`

### Send Reminder
**POST** `/reminders/{id}/send/`

Mark a reminder as sent (shopkeeper only).

**Response:** `200 OK`

### Send Bulk Reminders
**POST** `/reminders/bulk-send/`

Send reminders to all customers with overdue payments (shopkeeper only).

**Response:** `200 OK`
```json
{
  "message": "Sent 5 reminders",
  "reminders": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

---

## Test Credentials

For testing purposes, use the following credentials:

**Customer:**
- Email: `customer@test.com`
- Password: `password123`

**Shopkeeper:**
- Email: `shop@test.com`
- Password: `password123`
