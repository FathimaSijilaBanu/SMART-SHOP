from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from .models import Reminder
from credits.models import CreditRecord
from .serializers import ReminderSerializer, ReminderCreateSerializer


class ReminderListCreateView(generics.ListCreateAPIView):
    """API view for listing and creating reminders."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter reminders based on user type."""
        user = self.request.user
        if user.user_type == 'customer':
            return Reminder.objects.filter(customer=user)
        elif user.user_type == 'shopkeeper':
            return Reminder.objects.filter(credit_record__shopkeeper=user)
        return Reminder.objects.none()
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReminderCreateSerializer
        return ReminderSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new reminder (shopkeeper only)."""
        if request.user.user_type != 'shopkeeper':
            return Response(
                {'error': 'Only shopkeepers can create reminders.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Verify credit record belongs to shopkeeper
        credit_record = serializer.validated_data['credit_record']
        if credit_record.shopkeeper != request.user:
            return Response(
                {'error': 'You can only create reminders for your own credit records.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reminder = serializer.save(customer=credit_record.customer)
        
        return Response(
            ReminderSerializer(reminder).data,
            status=status.HTTP_201_CREATED
        )


class ReminderDetailView(generics.RetrieveUpdateAPIView):
    """API view for retrieving and updating a reminder."""
    
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter reminders based on user type."""
        user = self.request.user
        if user.user_type == 'customer':
            return Reminder.objects.filter(customer=user)
        elif user.user_type == 'shopkeeper':
            return Reminder.objects.filter(credit_record__shopkeeper=user)
        return Reminder.objects.none()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_reminder(request, pk):
    """Mark a reminder as sent (shopkeeper only)."""
    if request.user.user_type != 'shopkeeper':
        return Response(
            {'error': 'Only shopkeepers can send reminders.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        reminder = Reminder.objects.get(pk=pk, credit_record__shopkeeper=request.user)
        reminder.sent = True
        reminder.sent_date = timezone.now()
        reminder.save()
        return Response(ReminderSerializer(reminder).data)
    except Reminder.DoesNotExist:
        return Response(
            {'error': 'Reminder not found.'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_bulk_reminders(request):
    """Send reminders to all customers with overdue payments (shopkeeper only)."""
    if request.user.user_type != 'shopkeeper':
        return Response(
            {'error': 'Only shopkeepers can send bulk reminders.'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get all overdue credit records for this shopkeeper
    overdue_credits = CreditRecord.objects.filter(
        shopkeeper=request.user,
        status='overdue'
    )
    
    reminders_created = []
    for credit in overdue_credits:
        # Create reminder if one doesn't exist for this credit record
        message = f"Payment reminder: ₹{credit.remaining_amount} is overdue for payment. Due date was {credit.due_date}."
        reminder = Reminder.objects.create(
            credit_record=credit,
            customer=credit.customer,
            message=message,
            scheduled_date=timezone.now(),
            sent=True,
            sent_date=timezone.now()
        )
        reminders_created.append(reminder)
    
    return Response({
        'message': f'Sent {len(reminders_created)} reminders',
        'reminders': ReminderSerializer(reminders_created, many=True).data
    })
