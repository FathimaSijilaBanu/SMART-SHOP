from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """Inline admin for OrderItem."""
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """Admin configuration for Order model."""
    
    list_display = ['id', 'customer', 'shopkeeper', 'total_amount', 'status', 'payment_status', 'order_date']
    list_filter = ['status', 'payment_status', 'order_date']
    search_fields = ['customer__name', 'customer__email', 'shopkeeper__name']
    ordering = ['-order_date']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Order Information', {'fields': ('customer', 'shopkeeper', 'total_amount')}),
        ('Status', {'fields': ('status', 'payment_status')}),
        ('Dates', {'fields': ('order_date', 'delivery_date')}),
        ('Additional Info', {'fields': ('notes',)}),
    )
    
    readonly_fields = ['order_date']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """Admin configuration for OrderItem model."""
    
    list_display = ['order', 'product_name', 'quantity', 'price', 'total_price']
    search_fields = ['product_name', 'order__id']
    readonly_fields = ['total_price']
