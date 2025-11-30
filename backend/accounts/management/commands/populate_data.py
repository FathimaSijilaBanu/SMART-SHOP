from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from products.models import Product
from orders.models import Order, OrderItem
from credits.models import CreditRecord, Payment


class Command(BaseCommand):
    help = 'Populate database with initial test data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Populating database with test data...')
        
        # Create users
        self.stdout.write('Creating users...')
        customer = User.objects.create_user(
            email='customer@test.com',
            password='password123',
            name='John Customer',
            phone='+91-9876543210',
            user_type='customer'
        )
        
        shopkeeper = User.objects.create_user(
            email='shop@test.com',
            password='password123',
            name='Shop Owner',
            phone='+91-9876543211',
            user_type='shopkeeper'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created users: {customer.email}, {shopkeeper.email}'))
        
        # Create products
        self.stdout.write('Creating products...')
        products_data = [
            {
                'name': 'Rice (1kg)',
                'description': 'Premium Basmati Rice',
                'price': 80,
                'category': 'groceries',
                'stock': 50,
            },
            {
                'name': 'Milk (1L)',
                'description': 'Fresh Dairy Milk',
                'price': 60,
                'category': 'dairy',
                'stock': 20,
            },
            {
                'name': 'Bread',
                'description': 'Whole Wheat Bread',
                'price': 25,
                'category': 'bakery',
                'stock': 15,
            },
            {
                'name': 'Tomatoes (500g)',
                'description': 'Fresh Red Tomatoes',
                'price': 40,
                'category': 'vegetables',
                'stock': 30,
            },
            {
                'name': 'Bananas (1kg)',
                'description': 'Fresh Ripe Bananas',
                'price': 50,
                'category': 'fruits',
                'stock': 25,
            },
            {
                'name': 'Eggs (12 pcs)',
                'description': 'Farm Fresh Eggs',
                'price': 70,
                'category': 'dairy',
                'stock': 40,
            },
            {
                'name': 'Cooking Oil (1L)',
                'description': 'Refined Sunflower Oil',
                'price': 120,
                'category': 'groceries',
                'stock': 18,
            },
            {
                'name': 'Onions (1kg)',
                'description': 'Fresh Red Onions',
                'price': 35,
                'category': 'vegetables',
                'stock': 45,
            },
        ]
        
        products = []
        for product_data in products_data:
            product = Product.objects.create(
                shopkeeper=shopkeeper,
                **product_data
            )
            products.append(product)
        
        self.stdout.write(self.style.SUCCESS(f'Created {len(products)} products'))
        
        # Create orders
        self.stdout.write('Creating orders...')
        order1 = Order.objects.create(
            customer=customer,
            shopkeeper=shopkeeper,
            total_amount=210,
            status='pending',
            payment_status='unpaid',
            notes='Please deliver in the morning'
        )
        
        OrderItem.objects.create(
            order=order1,
            product=products[0],
            product_name=products[0].name,
            quantity=2,
            price=products[0].price,
            total_price=products[0].price * 2
        )
        
        OrderItem.objects.create(
            order=order1,
            product=products[1],
            product_name=products[1].name,
            quantity=1,
            price=products[1].price,
            total_price=products[1].price * 1
        )
        
        OrderItem.objects.create(
            order=order1,
            product=products[4],
            product_name=products[4].name,
            quantity=1,
            price=products[4].price,
            total_price=products[4].price * 1
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created order #{order1.id}'))
        
        # Create credit records
        self.stdout.write('Creating credit records...')
        
        # Pending credit
        credit1 = CreditRecord.objects.create(
            customer=customer,
            shopkeeper=shopkeeper,
            total_amount=500,
            paid_amount=200,
            remaining_amount=300,
            due_date=timezone.now().date() + timedelta(days=7)
        )
        
        Payment.objects.create(
            credit_record=credit1,
            amount=200,
            payment_method='cash',
            notes='Partial payment'
        )
        
        # Overdue credit
        credit2 = CreditRecord.objects.create(
            customer=customer,
            shopkeeper=shopkeeper,
            total_amount=300,
            paid_amount=0,
            remaining_amount=300,
            due_date=timezone.now().date() - timedelta(days=5)
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created {CreditRecord.objects.count()} credit records'))
        
        self.stdout.write(self.style.SUCCESS('Database populated successfully!'))
        self.stdout.write(self.style.SUCCESS('Test credentials:'))
        self.stdout.write(f'  Customer: customer@test.com / password123')
        self.stdout.write(f'  Shopkeeper: shop@test.com / password123')
