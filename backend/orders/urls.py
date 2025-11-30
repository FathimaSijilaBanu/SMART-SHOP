from django.urls import path
from .views import (
    OrderListCreateView, OrderDetailView,
    confirm_order, cancel_order
)

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order_list_create'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order_detail'),
    path('<int:pk>/confirm/', confirm_order, name='confirm_order'),
    path('<int:pk>/cancel/', cancel_order, name='cancel_order'),
]
