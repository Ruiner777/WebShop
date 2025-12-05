from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from main.models import Category, Product
from users.models import User
from orders.models import Order, OrderItem
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    UserSerializer,
    OrderSerializer,
    OrderItemSerializer
)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet для модели Category.
    Предоставляет стандартные операции: list, create, retrieve, update, destroy.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'


class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet для модели Product.
    Предоставляет стандартные операции: list, create, retrieve, update, destroy.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created']
    ordering = ['name']
    
    def get_queryset(self):
        """Фильтрация по доступности продуктов"""
        queryset = Product.objects.all()
        available = self.request.query_params.get('available', None)
        if available is not None:
            available_bool = available.lower() == 'true'
            queryset = queryset.filter(available=available_bool)
        return queryset
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Дополнительный endpoint для получения только доступных продуктов"""
        available_products = self.queryset.filter(available=True)
        serializer = self.get_serializer(available_products, many=True)
        return Response(serializer.data)


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet для модели User.
    Предоставляет стандартные операции: list, create, retrieve, update, destroy.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['username', 'email', 'first_name', 'last_name']
    ordering_fields = ['username', 'date_joined']
    ordering = ['username']
    
    def get_permissions(self):
        """
        Разрешает создание пользователей без аутентификации (регистрация),
        но требует аутентификацию для просмотра и изменения.
        """
        if self.action == 'create':
            return [AllowAny()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Endpoint для получения информации о текущем пользователе"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet для модели Order.
    Предоставляет стандартные операции: list, create, retrieve, update, destroy.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['created', 'paid']
    ordering = ['-created']
    
    def get_queryset(self):
        """Возвращает заказы текущего пользователя или все заказы для staff"""
        user = self.request.user
        if user.is_staff:
            return Order.objects.all()
        return Order.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Автоматически устанавливает пользователя при создании заказа"""
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class OrderItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet для модели OrderItem.
    Предоставляет стандартные операции: list, create, retrieve, update, destroy.
    """
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    ordering_fields = ['quantity', 'price']
    ordering = ['id']

