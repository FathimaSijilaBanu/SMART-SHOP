from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Order
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderUpdateSerializer
)


class OrderListCreateView(generics.ListCreateAPIView):
    """API view for listing and creating orders."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter orders based on user type."""
        user = self.request.user
        if user.user_type == 'customer':
            return Order.objects.filter(customer=user)
        elif user.user_type == 'shopkeeper':
            return Order.objects.filter(shopkeeper=user)
        return Order.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new order."""
        if request.user.user_type != 'customer':
            return Response(
                {'error': 'Only customers can create orders.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )


class OrderDetailView(generics.RetrieveUpdateAPIView):
    """API view for retrieving and updating an order."""
    
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter orders based on user type."""
        user = self.request.user
        if user.user_type == 'customer':
            return Order.objects.filter(customer=user)
        elif user.user_type == 'shopkeeper':
            return Order.objects.filter(shopkeeper=user)
        return Order.objects.none()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return OrderUpdateSerializer
        return OrderSerializer
    
    def update(self, request, *args, **kwargs):
        """Update order status (shopkeeper only)."""
        if request.user.user_type != 'shopkeeper':
            return Response(
                {'error': 'Only shopkeepers can update order status.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_order(request, pk):
    """Confirm an order (shopkeeper only)."""
    if request.user.user_type != 'shopkeeper':
        return Response(
            {'error': 'Only shopkeepers can confirm orders.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        order = Order.objects.get(pk=pk, shopkeeper=request.user)
        order.status = 'confirmed'
        order.save()
        return Response(OrderSerializer(order).data)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, pk):
    """Cancel an order."""
    try:
        if request.user.user_type == 'customer':
            order = Order.objects.get(pk=pk, customer=request.user)
        else:
            order = Order.objects.get(pk=pk, shopkeeper=request.user)
        
        order.status = 'cancelled'
        order.save()
        return Response(OrderSerializer(order).data)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
