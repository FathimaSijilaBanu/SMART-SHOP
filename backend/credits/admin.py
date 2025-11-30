from django.contrib import admin
from .models import CreditRecord, Payment


class PaymentInline(admin.TabularInline):
    """Inline admin for Payment."""
    model = Payment
    extra = 0
    readonly_fields = ['payment_date']


@admin.register(CreditRecord)
class CreditRecordAdmin(admin.ModelAdmin):
    """Admin configuration for CreditRecord model."""
    
    list_display = ['id', 'customer', 'shopkeeper', 'total_amount', 'paid_amount', 'remaining_amount', 'status', 'due_date']
    list_filter = ['status', 'due_date']
    search_fields = ['customer__name', 'customer__email', 'shopkeeper__name']
    ordering = ['-created_at']
    inlines = [PaymentInline]
    
    fieldsets = (
        ('Credit Information', {'fields': ('customer', 'shopkeeper')}),
        ('Amounts', {'fields': ('total_amount', 'paid_amount', 'remaining_amount')}),
        ('Status & Dates', {'fields': ('status', 'due_date')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['paid_amount', 'remaining_amount', 'status', 'created_at', 'updated_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Admin configuration for Payment model."""
    
    list_display = ['id', 'credit_record', 'amount', 'payment_method', 'payment_date']
    list_filter = ['payment_method', 'payment_date']
    search_fields = ['credit_record__customer__name']
    ordering = ['-payment_date']
    readonly_fields = ['payment_date']
