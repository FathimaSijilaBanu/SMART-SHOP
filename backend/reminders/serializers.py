from rest_framework import serializers
from .models import Reminder


class ReminderSerializer(serializers.ModelSerializer):
    """Serializer for Reminder model."""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    credit_record_amount = serializers.DecimalField(
        source='credit_record.remaining_amount',
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    
    class Meta:
        model = Reminder
        fields = [
            'id', 'credit_record', 'credit_record_amount', 'customer',
            'customer_name', 'message', 'scheduled_date', 'sent',
            'sent_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'sent_date', 'created_at', 'updated_at']


class ReminderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reminders."""
    
    class Meta:
        model = Reminder
        fields = ['credit_record', 'message', 'scheduled_date']
