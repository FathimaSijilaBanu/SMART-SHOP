from django.urls import path
from .views import (
    CreditRecordListCreateView, CreditRecordDetailView,
    PaymentListView, make_payment, overdue_credits
)

urlpatterns = [
    path('', CreditRecordListCreateView.as_view(), name='credit_record_list_create'),
    path('<int:pk>/', CreditRecordDetailView.as_view(), name='credit_record_detail'),
    path('<int:credit_record_id>/pay/', make_payment, name='make_payment'),
    path('overdue/', overdue_credits, name='overdue_credits'),
    path('payments/', PaymentListView.as_view(), name='payment_list'),
]
