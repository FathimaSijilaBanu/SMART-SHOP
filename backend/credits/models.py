from django.db import models
from django.conf import settings
from django.utils import timezone


class CreditRecord(models.Model):
    """Credit record model for tracking customer credit and payments."""
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('overdue', 'Overdue'),
        ('paid', 'Paid'),
    )
    
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='credit_records',
        limit_choices_to={'user_type': 'customer'}
    )
    shopkeeper = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='shop_credit_records',
        limit_choices_to={'user_type': 'shopkeeper'}
    )
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'credit_records'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['shopkeeper']),
            models.Index(fields=['status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"Credit #{self.id} - {self.customer.name} - ₹{self.remaining_amount}"
    
    def save(self, *args, **kwargs):
        """Update remaining amount and status before saving."""
        self.remaining_amount = self.total_amount - self.paid_amount
        
        # Update status based on payment and due date
        if self.remaining_amount <= 0:
            self.status = 'paid'
        elif self.due_date < timezone.now().date():
            self.status = 'overdue'
        else:
            self.status = 'pending'
        
        super().save(*args, **kwargs)


class Payment(models.Model):
    """Payment model for recording credit payments."""
    
    PAYMENT_METHOD_CHOICES = (
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('upi', 'UPI'),
        ('other', 'Other'),
    )
    
    credit_record = models.ForeignKey(
        CreditRecord,
        on_delete=models.CASCADE,
        related_name='payments'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    notes = models.TextField(blank=True)
    payment_date = models.DateTimeField(auto_now_add=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payments'
        ordering = ['-payment_date']
    
    def __str__(self):
        return f"Payment #{self.id} - ₹{self.amount} - {self.payment_method}"
    
    def save(self, *args, **kwargs):
        """Update credit record when payment is saved."""
        super().save(*args, **kwargs)
        
        # Update the credit record's paid amount
        credit = self.credit_record
        credit.paid_amount = sum(p.amount for p in credit.payments.all())
        credit.save()
