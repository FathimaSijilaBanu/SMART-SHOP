from rest_framework import generics, permissions, filters
from .models import Product
from .serializers import ProductSerializer, ProductCreateUpdateSerializer


class IsShopkeeperOrReadOnly(permissions.BasePermission):
    """Custom permission to only allow shopkeepers to edit products."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.user_type == 'shopkeeper'
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.shopkeeper == request.user


class ProductListCreateView(generics.ListCreateAPIView):
    """API view for listing and creating products."""
    
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [IsShopkeeperOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'stock']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter products by category and shopkeeper if provided."""
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        shopkeeper = self.request.query_params.get('shopkeeper', None)
        
        if category:
            queryset = queryset.filter(category=category)
        if shopkeeper:
            queryset = queryset.filter(shopkeeper_id=shopkeeper)
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(shopkeeper=self.request.user)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """API view for retrieving, updating, and deleting a product."""
    
    queryset = Product.objects.all()
    permission_classes = [IsShopkeeperOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def perform_destroy(self, instance):
        """Soft delete by setting is_active to False."""
        instance.is_active = False
        instance.save()
