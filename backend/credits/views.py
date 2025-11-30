from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from .models import CreditRecord, Payment
from .serializers import (
    CreditRecordSerializer, CreditRecordCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer
)


class CreditRecordListCreateView(generics.ListCreateAPIView):
    """API view for listing and creating credit records."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter credit records based on user type."""
        user = self.request.user
        queryset = CreditRecord.objects.all()
        
        if user.user_type == 'customer':
            queryset = queryset.filter(customer=user)
        elif user.user_type == 'shopkeeper':
            queryset = queryset.filter(shopkeeper=user)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CreditRecordCreateSerializer
        return CreditRecordSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new credit record (shopkeeper only)."""
        if request.user.user_type != 'shopkeeper':
            return Response(
                {'error': 'Only shopkeepers can create credit records.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        credit_record = serializer.save(shopkeeper=request.user)
        
        return Response(
            CreditRecordSerializer(credit_record).data,
            status=status.HTTP_201_CREATED
        )


class CreditRecordDetailView(generics.RetrieveAPIView):
    """API view for retrieving a credit record."""
    
    serializer_class = CreditRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter credit records based on user type."""
        user = self.request.user
        if user.user_type == 'customer':
            return CreditRecord.objects.filter(customer=user)
        elif user.user_type == 'shopkeeper':
            return CreditRecord.objects.filter(shopkeeper=user)
        return CreditRecord.objects.none()


class PaymentListView(generics.ListAPIView):
    """API view for listing payments."""
    
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter payments based on credit record access."""
        user = self.request.user
        if user.user_type == 'customer':
            return Payment.objects.filter(credit_record__customer=user)
        elif user.user_type == 'shopkeeper':
            return Payment.objects.filter(credit_record__shopkeeper=user)
        return Payment.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def make_payment(request, credit_record_id):
    """Make a payment on a credit record."""
    credit_record = get_object_or_404(CreditRecord, id=credit_record_id)
    
    # Check permissions
    if request.user.user_type == 'customer' and credit_record.customer != request.user:
        return Response(
            {'error': 'You do not have permission to make payments on this credit record.'},
            status=status.HTTP_403_FORBIDDEN
        )
    elif request.user.user_type == 'shopkeeper' and credit_record.shopkeeper != request.user:
        return Response(
            {'error': 'You do not have permission to make payments on this credit record.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = PaymentCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    # Validate payment amount doesn't exceed remaining amount
    amount = serializer.validated_data['amount']
    if amount > credit_record.remaining_amount:
        return Response(
            {'error': f'Payment amount exceeds remaining amount of ₹{credit_record.remaining_amount}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create payment
    payment = serializer.save(credit_record=credit_record)
    
    # Return updated credit record
    return Response(
        CreditRecordSerializer(credit_record).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def overdue_credits(request):
    """Get all overdue credit records."""
    user = request.user
    
    if user.user_type == 'shopkeeper':
        credits = CreditRecord.objects.filter(shopkeeper=user, status='overdue')
    elif user.user_type == 'customer':
        credits = CreditRecord.objects.filter(customer=user, status='overdue')
    else:
        credits = CreditRecord.objects.none()
    
    serializer = CreditRecordSerializer(credits, many=True)
    return Response(serializer.data)
