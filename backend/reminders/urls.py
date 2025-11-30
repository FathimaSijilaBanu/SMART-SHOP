from django.urls import path
from .views import (
    ReminderListCreateView, ReminderDetailView,
    send_reminder, send_bulk_reminders
)

urlpatterns = [
    path('', ReminderListCreateView.as_view(), name='reminder_list_create'),
    path('<int:pk>/', ReminderDetailView.as_view(), name='reminder_detail'),
    path('<int:pk>/send/', send_reminder, name='send_reminder'),
    path('bulk-send/', send_bulk_reminders, name='send_bulk_reminders'),
]
