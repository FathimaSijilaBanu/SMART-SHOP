from django.db import models
from django.conf import settings
from credits.models import CreditRecord


class Reminder(models.Model):
    """Reminder model for payment reminders."""
    
    credit_record = models.ForeignKey(
        CreditRecord,
        on_delete=models.CASCADE,
        related_name='reminders'
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reminders',
        limit_choices_to={'user_type': 'customer'}
    )
    
    message = models.TextField()
    scheduled_date = models.DateTimeField()
    sent = models.BooleanField(default=False)
    sent_date = models.DateTimeField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reminders'
        ordering = ['-scheduled_date']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['credit_record']),
            models.Index(fields=['sent']),
        ]
    
    def __str__(self):
        return f"Reminder #{self.id} - {self.customer.name} - {'Sent' if self.sent else 'Pending'}"
