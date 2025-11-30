from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model."""
    
    shopkeeper_name = serializers.CharField(source='shopkeeper.name', read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'stock',
            'image', 'shopkeeper', 'shopkeeper_name', 'in_stock',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_price(self, value):
        """Validate that price is positive."""
        if value < 0:
            raise serializers.ValidationError("Price must be positive.")
        return value
    
    def validate_stock(self, value):
        """Validate that stock is non-negative."""
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating products."""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'category', 'stock',
            'image', 'is_active'
        ]
    
    def validate_price(self, value):
        """Validate that price is positive."""
        if value < 0:
            raise serializers.ValidationError("Price must be positive.")
        return value
    
    def validate_stock(self, value):
        """Validate that stock is non-negative."""
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value
