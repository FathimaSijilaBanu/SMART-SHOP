from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model."""
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'total_price']
        read_only_fields = ['id', 'total_price']


class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating order items."""
    
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model."""
    
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    shopkeeper_name = serializers.CharField(source='shopkeeper.name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'customer', 'customer_name', 'shopkeeper', 'shopkeeper_name',
            'items', 'total_amount', 'status', 'payment_status', 'notes',
            'order_date', 'delivery_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_date', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    """Serializer for creating orders."""
    
    shopkeeper_id = serializers.IntegerField()
    items = OrderItemCreateSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_items(self, value):
        """Validate that items list is not empty."""
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value
    
    def validate(self, attrs):
        """Validate products exist and have sufficient stock."""
        items = attrs.get('items', [])
        
        for item in items:
            try:
                product = Product.objects.get(id=item['product_id'], is_active=True)
                if product.stock < item['quantity']:
                    raise serializers.ValidationError(
                        f"Insufficient stock for {product.name}. Available: {product.stock}"
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Product with id {item['product_id']} not found.")
        
        return attrs
    
    def create(self, validated_data):
        """Create order with items."""
        items_data = validated_data.pop('items')
        customer = self.context['request'].user
        shopkeeper_id = validated_data.pop('shopkeeper_id')
        
        # Calculate total amount
        total_amount = 0
        order_items = []
        
        for item_data in items_data:
            product = Product.objects.get(id=item_data['product_id'])
            quantity = item_data['quantity']
            price = product.price
            total_price = price * quantity
            total_amount += total_price
            
            order_items.append({
                'product': product,
                'product_name': product.name,
                'quantity': quantity,
                'price': price,
                'total_price': total_price
            })
        
        # Create order
        order = Order.objects.create(
            customer=customer,
            shopkeeper_id=shopkeeper_id,
            total_amount=total_amount,
            notes=validated_data.get('notes', '')
        )
        
        # Create order items
        for item_data in order_items:
            OrderItem.objects.create(order=order, **item_data)
        
        return order


class OrderUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating order status."""
    
    class Meta:
        model = Order
        fields = ['status', 'payment_status', 'delivery_date']
