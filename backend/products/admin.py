from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    """Admin configuration for Product model."""
    
    list_display = ['name', 'category', 'price', 'stock', 'shopkeeper', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'shopkeeper']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Product Information', {'fields': ('name', 'description', 'category', 'image')}),
        ('Pricing & Stock', {'fields': ('price', 'stock')}),
        ('Ownership', {'fields': ('shopkeeper', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']
