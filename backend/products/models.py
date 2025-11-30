from django.db import models
from django.conf import settings


class Product(models.Model):
    """Product model for inventory management."""
    
    CATEGORY_CHOICES = (
        ('groceries', 'Groceries'),
        ('dairy', 'Dairy'),
        ('bakery', 'Bakery'),
        ('vegetables', 'Vegetables'),
        ('fruits', 'Fruits'),
        ('beverages', 'Beverages'),
        ('snacks', 'Snacks'),
        ('other', 'Other'),
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    stock = models.IntegerField(default=0)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    shopkeeper = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='products',
        limit_choices_to={'user_type': 'shopkeeper'}
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['shopkeeper']),
        ]
    
    def __str__(self):
        return f"{self.name} - ₹{self.price}"
    
    @property
    def in_stock(self):
        """Check if product is in stock."""
        return self.stock > 0
