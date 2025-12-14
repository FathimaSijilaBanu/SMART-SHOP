# SmartShop Database Schema

## Database Tables Overview

### 1. Users Table
**Table Name:** `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email (username) |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(255) | NOT NULL | User's full name |
| phone | VARCHAR(20) | NULL | Contact number |
| user_type | VARCHAR(20) | NOT NULL | 'customer' or 'shopkeeper' |
| is_active | Boolean | DEFAULT TRUE | Account status |
| created_at | DateTime | AUTO_NOW_ADD | Account creation timestamp |

**Indexes:** email, user_type

---

### 2. Products Table
**Table Name:** `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| name | VARCHAR(255) | NOT NULL | Product name |
| description | Text | NULL | Product description |
| price | Decimal(10,2) | NOT NULL | Product price |
| category | VARCHAR(50) | NOT NULL | Product category |
| stock | Integer | DEFAULT 0 | Available quantity |
| image | ImageField | NULL | Product image |
| shopkeeper_id | Integer | FOREIGN KEY → users.id | Product owner |
| is_active | Boolean | DEFAULT TRUE | Product availability |
| created_at | DateTime | AUTO_NOW_ADD | Creation timestamp |
| updated_at | DateTime | AUTO_NOW | Last update timestamp |

**Categories:** groceries, dairy, bakery, vegetables, fruits, beverages, snacks, other

**Indexes:** category, shopkeeper_id

---

### 3. Orders Table
**Table Name:** `orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique order identifier |
| customer_id | Integer | FOREIGN KEY → users.id | Customer who placed order |
| shopkeeper_id | Integer | FOREIGN KEY → users.id | Shopkeeper receiving order |
| total_amount | Decimal(10,2) | NOT NULL | Total order value |
| status | VARCHAR(20) | DEFAULT 'pending' | Order status |
| payment_status | VARCHAR(20) | DEFAULT 'unpaid' | Payment status |
| notes | Text | NULL | Additional notes |
| order_date | DateTime | AUTO_NOW_ADD | Order placement time |
| delivery_date | DateTime | NULL | Delivery timestamp |
| created_at | DateTime | AUTO_NOW_ADD | Creation timestamp |
| updated_at | DateTime | AUTO_NOW | Last update timestamp |

**Status Options:** pending, confirmed, delivered, cancelled

**Payment Status Options:** unpaid, partial, paid

**Indexes:** customer_id, shopkeeper_id, status

---

### 4. Order Items Table
**Table Name:** `order_items`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique item identifier |
| order_id | Integer | FOREIGN KEY → orders.id | Parent order |
| product_id | Integer | FOREIGN KEY → products.id | Product reference |
| product_name | VARCHAR(255) | NOT NULL | Product name snapshot |
| quantity | Integer | DEFAULT 1 | Quantity ordered |
| price | Decimal(10,2) | NOT NULL | Unit price |
| total_price | Decimal(10,2) | NOT NULL | Line total (price × quantity) |
| created_at | DateTime | AUTO_NOW_ADD | Creation timestamp |

**Indexes:** order_id

---

### 5. Credit Records Table
**Table Name:** `credit_records`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique credit record identifier |
| customer_id | Integer | FOREIGN KEY → users.id | Customer with credit |
| shopkeeper_id | Integer | FOREIGN KEY → users.id | Shopkeeper providing credit |
| total_amount | Decimal(10,2) | NOT NULL | Total credit amount |
| paid_amount | Decimal(10,2) | DEFAULT 0 | Amount paid so far |
| remaining_amount | Decimal(10,2) | NOT NULL | Outstanding balance |
| due_date | Date | NOT NULL | Payment due date |
| status | VARCHAR(20) | DEFAULT 'pending' | Credit status |
| created_at | DateTime | AUTO_NOW_ADD | Creation timestamp |
| updated_at | DateTime | AUTO_NOW | Last update timestamp |

**Status Options:** pending, overdue, paid

**Indexes:** customer_id, shopkeeper_id, status, due_date

---

### 6. Payments Table
**Table Name:** `payments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique payment identifier |
| credit_record_id | Integer | FOREIGN KEY → credit_records.id | Associated credit record |
| amount | Decimal(10,2) | NOT NULL | Payment amount |
| payment_method | VARCHAR(20) | DEFAULT 'cash' | Payment method used |
| notes | Text | NULL | Payment notes |
| payment_date | DateTime | AUTO_NOW_ADD | Payment timestamp |
| created_at | DateTime | AUTO_NOW_ADD | Creation timestamp |

**Payment Methods:** cash, card, upi, other

**Indexes:** credit_record_id

---

### 7. Reminders Table
**Table Name:** `reminders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | Integer | PRIMARY KEY, AUTO_INCREMENT | Unique reminder identifier |
| credit_record_id | Integer | FOREIGN KEY → credit_records.id | Associated credit record |
| customer_id | Integer | FOREIGN KEY → users.id | Customer to remind |
| message | Text | NOT NULL | Reminder message |
| scheduled_date | DateTime | NOT NULL | When to send reminder |
| sent | Boolean | DEFAULT FALSE | Reminder sent status |
| sent_date | DateTime | NULL | When reminder was sent |
| created_at | DateTime | AUTO_NOW_ADD | Creation timestamp |
| updated_at | DateTime | AUTO_NOW | Last update timestamp |

**Indexes:** customer_id, credit_record_id, sent

---

## Entity Relationships

```
users (1) ──< (N) products
  │
  ├─ (1) ──< (N) orders (as customer)
  │
  ├─ (1) ──< (N) orders (as shopkeeper)
  │
  ├─ (1) ──< (N) credit_records (as customer)
  │
  └─ (1) ──< (N) credit_records (as shopkeeper)

orders (1) ──< (N) order_items

products (1) ──< (N) order_items

credit_records (1) ──< (N) payments

credit_records (1) ──< (N) reminders
```

---

## Key Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (customer/shopkeeper)
- Email-based login with case-insensitive handling

### Business Logic
- **Products:** Shopkeepers manage their inventory
- **Orders:** Customers place orders with shopkeepers
- **Credits:** Automatic credit record creation for unpaid/partial orders
- **Payments:** Track partial payments against credit records
- **Reminders:** Automated payment reminders for overdue credits

### Data Integrity
- Foreign key constraints ensure referential integrity
- Cascading deletes for dependent records
- Automatic timestamp tracking (created_at, updated_at)
- Status auto-calculation based on business rules

---

## Database Technology
- **Backend:** Django ORM with PostgreSQL
- **Deployment:** Render.com (Free Tier)
- **API:** RESTful API with Django REST Framework
- **Authentication:** JWT tokens (access + refresh)
