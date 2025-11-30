from rest_framework import serializers
from .models import CreditRecord, Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model."""
    
    class Meta:
        model = Payment
        fields = [
            'id', 'credit_record', 'amount', 'payment_method',
            'notes', 'payment_date', 'created_at'
        ]
        read_only_fields = ['id', 'payment_date', 'created_at']
    
    def validate_amount(self, value):
        """Validate that payment amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments."""
    
    class Meta:
        model = Payment
        fields = ['amount', 'payment_method', 'notes']
    
    def validate_amount(self, value):
        """Validate that payment amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value


class CreditRecordSerializer(serializers.ModelSerializer):
    """Serializer for CreditRecord model."""
    
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    shopkeeper_name = serializers.CharField(source='shopkeeper.name', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    
    class Meta:
        model = CreditRecord
        fields = [
            'id', 'customer', 'customer_name', 'shopkeeper', 'shopkeeper_name',
            'total_amount', 'paid_amount', 'remaining_amount', 'due_date',
            'status', 'payments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'paid_amount', 'remaining_amount', 'status', 'created_at', 'updated_at']


class CreditRecordCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating credit records."""
    
    class Meta:
        model = CreditRecord
        fields = ['customer', 'total_amount', 'due_date']
    
    def validate_total_amount(self, value):
        """Validate that total amount is positive."""
        if value <= 0:
            raise serializers.ValidationError("Total amount must be positive.")
        return value
