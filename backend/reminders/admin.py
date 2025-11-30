from django.contrib import admin
from .models import Reminder


@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    """Admin configuration for Reminder model."""
    
    list_display = ['id', 'customer', 'credit_record', 'scheduled_date', 'sent', 'sent_date']
    list_filter = ['sent', 'scheduled_date']
    search_fields = ['customer__name', 'customer__email', 'message']
    ordering = ['-scheduled_date']
    
    fieldsets = (
        ('Reminder Information', {'fields': ('credit_record', 'customer', 'message')}),
        ('Schedule', {'fields': ('scheduled_date', 'sent', 'sent_date')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    
    readonly_fields = ['created_at', 'updated_at']
