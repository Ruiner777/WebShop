from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from rest_framework.viewsets import ViewSet
from django.shortcuts import get_object_or_404
from main.models import Category, Product
from users.models import User
from orders.models import Order, OrderItem
from cart.cart import Cart
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    UserSerializer,
    OrderSerializer,
    OrderItemSerializer,
    CartSerializer,
    CartItemSerializer
)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Кастомный класс аутентификации для отключения CSRF проверки в REST API.
    Используется для API endpoints, где CSRF токен не требуется.
    """
    def enforce_csrf(self, request):
        return  # Отключить CSRF проверку


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


class CartViewSet(ViewSet):
    """
    ViewSet для работы с корзиной покупок.
    Корзина хранится в сессии Django (сессионная корзина, не модель БД).
    Работает со словарями из сессии, а не с моделями.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    
    def list(self, request):
        """Получить текущую корзину пользователя (GET /api/v1/cart/)"""
        cart = Cart(request)
        # Получаем список словарей из сессионной корзины
        cart_items = list(cart)
        # Передаем список словарей в сериализатор
        serializer = CartSerializer(cart_items)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        """Получить текущую корзину пользователя (GET /api/v1/cart/{pk}/)"""
        cart = Cart(request)
        # Получаем список словарей из сессионной корзины
        cart_items = list(cart)
        # Передаем список словарей в сериализатор
        serializer = CartSerializer(cart_items)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Добавить товар в корзину"""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        override_quantity = request.data.get('override_quantity', False)
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = get_object_or_404(Product, id=product_id, available=True)
        except:
            return Response(
                {'error': 'Product not found or not available'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart = Cart(request)
        cart.add(product=product, quantity=quantity, override_quantity=override_quantity)
        
        # Возвращаем обновленную корзину (список словарей из сессии)
        cart_items = list(cart)
        serializer = CartSerializer(cart_items)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        """Обновить количество товара в корзине"""
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity')
        
        if not product_id or quantity is None:
            return Response(
                {'error': 'product_id and quantity are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantity < 1 or quantity > 10:
            return Response(
                {'error': 'Quantity must be between 1 and 10'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = get_object_or_404(Product, id=product_id)
        except:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart = Cart(request)
        cart.add(product=product, quantity=quantity, override_quantity=True)
        
        # Возвращаем обновленную корзину (список словарей из сессии)
        cart_items = list(cart)
        serializer = CartSerializer(cart_items)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """Удалить товар из корзины"""
        product_id = request.data.get('product_id')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = get_object_or_404(Product, id=product_id)
        except:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        cart = Cart(request)
        cart.remove(product)
        
        # Возвращаем обновленную корзину (список словарей из сессии)
        cart_items = list(cart)
        serializer = CartSerializer(cart_items)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def get_quantity(self, request):
        """Получить общее количество товаров в корзине"""
        cart = Cart(request)
        return Response({'quantity': len(cart)})

