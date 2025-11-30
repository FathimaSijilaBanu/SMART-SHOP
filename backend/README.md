# SmartShop Backend

Django REST API backend for the SmartShop mobile application.

## Features

- **Dual User Authentication**: Separate authentication for customers and shopkeepers
- **Product Management**: CRUD operations for products with categories and stock tracking
- **Order Management**: Create, track, and manage orders with multiple items
- **Credit System**: Track customer credit, payments, and due dates
- **Reminder System**: Automated payment reminders for overdue credits
- **JWT Authentication**: Secure token-based authentication
- **RESTful API**: Clean and well-documented API endpoints

## Tech Stack

- **Django 4.2.7**: Web framework
- **Django REST Framework 3.14.0**: API framework
- **Simple JWT 5.3.0**: JWT authentication
- **PostgreSQL/SQLite**: Database (SQLite for development)
- **Django CORS Headers**: CORS support for React Native app

## Project Structure

```
backend/
├── smartshop_backend/      # Main project settings
│   ├── settings.py         # Django settings
│   └── urls.py            # Main URL configuration
├── accounts/              # User authentication app
│   ├── models.py          # Custom User model
│   ├── serializers.py     # User serializers
│   ├── views.py           # Auth views (login, register)
│   └── urls.py            # Auth endpoints
├── products/              # Product management app
│   ├── models.py          # Product model
│   ├── serializers.py     # Product serializers
│   ├── views.py           # Product CRUD views
│   └── urls.py            # Product endpoints
├── orders/                # Order management app
│   ├── models.py          # Order and OrderItem models
│   ├── serializers.py     # Order serializers
│   ├── views.py           # Order views
│   └── urls.py            # Order endpoints
├── credits/               # Credit management app
│   ├── models.py          # CreditRecord and Payment models
│   ├── serializers.py     # Credit serializers
│   ├── views.py           # Credit and payment views
│   └── urls.py            # Credit endpoints
├── reminders/             # Reminder system app
│   ├── models.py          # Reminder model
│   ├── serializers.py     # Reminder serializers
│   ├── views.py           # Reminder views
│   └── urls.py            # Reminder endpoints
├── manage.py              # Django management script
└── requirements.txt       # Python dependencies
```

## Installation

### Prerequisites

- Python 3.10+
- pip
- virtualenv (recommended)

### Setup Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Populate test data**
   ```bash
   python manage.py populate_data
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Products
- `GET /api/products/` - List all products
- `POST /api/products/` - Create product (shopkeeper only)
- `GET /api/products/{id}/` - Get product details
- `PUT /api/products/{id}/` - Update product (shopkeeper only)
- `DELETE /api/products/{id}/` - Delete product (shopkeeper only)

### Orders
- `GET /api/orders/` - List orders
- `POST /api/orders/` - Create order (customer only)
- `GET /api/orders/{id}/` - Get order details
- `PUT /api/orders/{id}/` - Update order status (shopkeeper only)
- `POST /api/orders/{id}/confirm/` - Confirm order (shopkeeper only)
- `POST /api/orders/{id}/cancel/` - Cancel order

### Credits
- `GET /api/credits/` - List credit records
- `POST /api/credits/` - Create credit record (shopkeeper only)
- `GET /api/credits/{id}/` - Get credit record details
- `POST /api/credits/{id}/pay/` - Make payment
- `GET /api/credits/overdue/` - Get overdue credits
- `GET /api/credits/payments/` - List payments

### Reminders
- `GET /api/reminders/` - List reminders
- `POST /api/reminders/` - Create reminder (shopkeeper only)
- `GET /api/reminders/{id}/` - Get reminder details
- `PUT /api/reminders/{id}/` - Update reminder
- `POST /api/reminders/{id}/send/` - Send reminder (shopkeeper only)
- `POST /api/reminders/bulk-send/` - Send bulk reminders (shopkeeper only)

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## Test Credentials

After running `populate_data` command, use these credentials:

**Customer Account:**
- Email: `customer@test.com`
- Password: `password123`

**Shopkeeper Account:**
- Email: `shop@test.com`
- Password: `password123`

## Database Models

### User
- Custom user model with email authentication
- User types: customer, shopkeeper
- Fields: email, name, phone, user_type

### Product
- Product catalog with categories
- Fields: name, description, price, category, stock, image, shopkeeper

### Order & OrderItem
- Order management with multiple items
- Status tracking: pending, confirmed, delivered, cancelled
- Payment status: unpaid, partial, paid

### CreditRecord & Payment
- Credit tracking with automatic status updates
- Status: pending, overdue, paid
- Payment history with multiple payment methods

### Reminder
- Payment reminder system
- Scheduled and sent reminders
- Linked to credit records

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/`

Create a superuser to access:
```bash
python manage.py createsuperuser
```

## Development

### Running Tests
```bash
pytest
```

### Code Style
The project follows PEP 8 style guidelines.

### Making Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

## Configuration

### Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
```

### CORS Configuration

Update `CORS_ALLOWED_ORIGINS` in `settings.py` to match your React Native app's development server.

## Production Deployment

1. Set `DEBUG = False` in settings.py
2. Configure proper database (PostgreSQL recommended)
3. Set up static file serving
4. Configure proper SECRET_KEY
5. Set ALLOWED_HOSTS
6. Use gunicorn or uwsgi as WSGI server
7. Set up nginx as reverse proxy
8. Enable HTTPS

## Troubleshooting

### Database Issues
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
python manage.py populate_data
```

### Port Already in Use
```bash
# Run on different port
python manage.py runserver 8001
```

### Migration Conflicts
```bash
# Reset migrations (development only)
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

This project is part of the SmartShop application.

## Support

For issues and questions, please create an issue in the repository.
