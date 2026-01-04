from django.conf import settings
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Кастомный класс аутентификации для отключения CSRF проверки в API endpoints.
    Используется для API endpoints, где CSRF токен не требуется (например, платежи).
    """
    def enforce_csrf(self, request):
        return  # Отключить CSRF проверку
from rest_framework.viewsets import ViewSet
from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from decimal import Decimal
from main.models import Category, Product
from users.models import User
from orders.models import Order, OrderItem
from cart.cart import Cart
import stripe
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    UserSerializer,
    OrderSerializer,
    OrderItemSerializer,
    CartSerializer,
    CartItemSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    SearchProductSerializer # Добавляем новый сериализатор
)

from django.db.models import Q # Добавляем Q для сложных запросов


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
    ordering_fields = ['created', 'paid']
    ordering = ['-created']
    
    def get_permissions(self):
        """Разрешает создание заказов анонимным пользователям, но требует аутентификацию для просмотра"""
        if self.action == 'create':
            return [AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        """Возвращает заказы текущего пользователя или все заказы для staff"""
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        if user.is_staff:
            return Order.objects.all()

        # Получаем заказы пользователя
        orders = Order.objects.filter(user=user)

        # Если у пользователя нет привязанных заказов, но есть заказы с его email,
        # автоматически привязываем их
        if not orders.exists():
            email_orders = Order.objects.filter(
                user__isnull=True,
                email=user.email
            )
            if email_orders.exists():
                # Привязываем заказы к пользователю
                email_orders.update(user=user)
                orders = Order.objects.filter(user=user)

        return orders

    def perform_create(self, serializer):
        """Привязываем пользователя к заказу при создании"""
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()
    
    def create(self, request, *args, **kwargs):
        """
        Создает заказ из корзины пользователя.
        Принимает данные заказа (first_name, last_name, email, city, address, postal_code),
        создает Order и OrderItem для каждого товара в корзине, затем очищает корзину.
        """
        cart = Cart(request)
        
        # Проверяем что корзина не пуста
        if len(cart) == 0:
            return Response(
                {'error': 'Cart is empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Сериализуем данные заказа
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Создаем заказ
        user = request.user if request.user.is_authenticated else None
        order = serializer.save(user=user)
        
        # Создаем OrderItem для каждого товара в корзине
        for item in cart:
            product = item['product']
            quantity = item['quantity']
            
            # Используем цену со скидкой, если она есть
            if product.discount:
                price = product.sell_price()
            else:
                price = product.price
            
            # Создаем OrderItem
            OrderItem.objects.create(
                order=order,
                product=product,
                price=price,
                quantity=quantity
            )
        
        # Очищаем корзину после создания заказа
        cart.clear()
        
        # Возвращаем созданный заказ с полной информацией
        headers = self.get_success_headers(serializer.data)
        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Ручное обновление статуса заказа как оплаченного"""
        order = self.get_object()

        # Проверяем, что заказ принадлежит пользователю
        if order.user != request.user:
            return Response(
                {'error': 'Not authorized to modify this order'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Обновляем статус
        order.paid = True
        order.save()

        return Response({
            'status': 'success',
            'message': f'Order {order.id} marked as paid',
            'order': OrderSerializer(order).data
        })


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
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Очистить корзину"""
        cart = Cart(request)
        cart.clear()
        return Response({'message': 'Cart cleared'}, status=status.HTTP_200_OK)


class SearchViewSet(viewsets.ViewSet):
    """
    ViewSet для поиска продуктов.
    Предоставляет эндпоинты: search (полный поиск) и autocomplete (быстрые подсказки).
    """
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Базовый queryset для продуктов, который может быть расширен фильтрами"""
        return Product.objects.filter(available=True)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Полный поиск продуктов с фильтрами по имени, описанию, категории, цене и доступности."""
        queryset = self.get_queryset()
        query = request.query_params.get('q', None)
        category_slug = request.query_params.get('category', None)
        min_price = request.query_params.get('min_price', None)
        max_price = request.query_params.get('max_price', None)
        available = request.query_params.get('available', None)

        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(category__name__icontains=query)
            )

        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        if min_price:
            try:
                min_price = float(min_price)
                queryset = queryset.filter(price__gte=min_price)
            except ValueError:
                return Response({'error': 'min_price must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

        if max_price:
            try:
                max_price = float(max_price)
                queryset = queryset.filter(price__lte=max_price)
            except ValueError:
                return Response({'error': 'max_price must be a valid number'}, status=status.HTTP_400_BAD_REQUEST)

        if available is not None:
            available_bool = available.lower() == 'true'
            queryset = queryset.filter(available=available_bool)
        
        # Применяем пагинацию, если она нужна
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ProductSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = ProductSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def autocomplete(self, request):
        """Возвращает id, name, slug для быстрого автодополнения поиска по имени продукта."""
        query = request.query_params.get('q', None)
        if query:
            queryset = Product.objects.filter(name__icontains=query, available=True)[:10] # Ограничиваем до 10 подсказок
            serializer = SearchProductSerializer(queryset, many=True)
            return Response(serializer.data)
        return Response([])


class AuthViewSet(ViewSet):
    """
    ViewSet для аутентификации пользователей.
    Предоставляет эндпоинты: register, login, logout, profile, password_change.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    
    def get_permissions(self):
        """Разрешает регистрацию и вход без аутентификации, остальное требует авторизации"""
        if self.action in ['register', 'login']:
            return [AllowAny()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        """Регистрация нового пользователя"""
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Автоматический вход после регистрации
            login(request, user)
            # Возвращаем данные пользователя
            user_serializer = UserSerializer(user)
            return Response(user_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """Вход пользователя"""
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                if user.is_active:
                    login(request, user)
                    # Корзина автоматически сохраняется в сессии, merge не требуется
                    user_serializer = UserSerializer(user)
                    return Response(user_serializer.data, status=status.HTTP_200_OK)
                else:
                    return Response(
                        {'error': 'User account is disabled'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            else:
                return Response(
                    {'error': 'Invalid username or password'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def logout(self, request):
        """Выход пользователя"""
        if request.user.is_authenticated:
            logout(request)
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)
        return Response(
            {'error': 'User is not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    @action(detail=False, methods=['get', 'put'])
    def profile(self, request):
        """Получение и обновление профиля пользователя"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        
        elif request.method == 'PUT':
            serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # Возвращаем полные данные пользователя
                user_serializer = UserSerializer(request.user)
                return Response(user_serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def password_change(self, request):
        """Смена пароля пользователя"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        serializer = PasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data['old_password']
            new_password = serializer.validated_data['new_password']
            
            # Проверяем старый пароль
            if not user.check_password(old_password):
                return Response(
                    {'old_password': ['Wrong password']},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Валидируем новый пароль
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response(
                    {'new_password': e.messages},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Устанавливаем новый пароль
            user.set_password(new_password)
            user.save()

            return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentViewSet(viewsets.ViewSet):
    """ViewSet для обработки платежей через Stripe"""
    authentication_classes = (CsrfExemptSessionAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def create_checkout_session(self, request, order_id=None):
        """Создание Stripe Checkout Session для оплаты заказа"""
        print(f"🔍 DEBUG: create_checkout_session called with order_id={order_id}")

        # Проверяем аутентификацию
        if not request.user.is_authenticated:
            print("❌ DEBUG: User not authenticated")
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        print(f"✅ DEBUG: User authenticated: {request.user.username}")

        # Проверяем заказ
        try:
            order = Order.objects.get(id=order_id, user=request.user)
            print(f"✅ DEBUG: Order found: {order.id}, paid={order.paid}")
        except Order.DoesNotExist:
            print(f"❌ DEBUG: Order {order_id} not found for user {request.user.username}")
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        if order.paid:
            print("❌ DEBUG: Order already paid")
            return Response(
                {'error': 'Order already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Создаем success и cancel URLs - редирект на React (localhost:3000)
        success_url = f'http://localhost:3000/orders/{order.id}?paid=true'
        cancel_url = f'http://localhost:3000/orders/{order.id}?canceled=true'
        print(f"🔗 DEBUG: Success URL: {success_url}")
        print(f"🔗 DEBUG: Cancel URL: {cancel_url}")

        # Проверяем Stripe ключи
        stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', None)
        print(f"🔑 DEBUG: STRIPE_SECRET_KEY loaded: {bool(stripe_secret)}")
        if not stripe_secret or stripe_secret == 'sk_test_YOUR_SECRET_KEY_HERE':
            print("❌ DEBUG: Stripe secret key not configured or is placeholder")
            return Response(
                {'error': 'Stripe not configured. Please check STRIPE_SECRET_KEY in .env'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            # Создаем Stripe Checkout Session
            print("🛠️  DEBUG: Creating Stripe checkout session...")
            session_data = {
                'mode': 'payment',
                'client_reference_id': str(order.id),
                'success_url': success_url,
                'cancel_url': cancel_url,
                'line_items': []
            }

            print(f"📦 DEBUG: Order has {order.items.count()} items")
            for item in order.items.all():
                discounted_price = item.product.sell_price()
                print(f"   - {item.product.name}: ${discounted_price} x {item.quantity}")
                session_data['line_items'].append({
                    'price_data': {
                        'unit_amount': int(discounted_price * Decimal('100')),
                        'currency': 'usd',
                        'product_data': {
                            'name': item.product.name,
                        },
                    },
                    'quantity': item.quantity,
                })

            session = stripe.checkout.Session.create(**session_data)
            print(f"✅ DEBUG: Stripe session created: {session.id}")

            # Сохранить session.id в заказе для webhook
            print(f"💾 DEBUG: Before save - order.stripe_session_id: {order.stripe_session_id}")
            order.stripe_session_id = session.id
            print(f"💾 DEBUG: Setting stripe_session_id to: {session.id}")
            order.save()
            print(f"💾 DEBUG: After save - order.stripe_session_id: {order.stripe_session_id}")
            print(f"✅ DEBUG: Session ID saved to order {order.id}")

            return Response({
                'session_id': session.id,
                'url': session.url
            }, status=status.HTTP_200_OK)

        except stripe.error.StripeError as e:
            print(f"❌ DEBUG: Stripe API error: {e}")
            return Response(
                {'error': f'Stripe error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            print(f"❌ DEBUG: Unexpected error: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Payment session creation failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Ручное обновление статуса заказа как оплаченного"""
        try:
            order = Order.objects.get(id=pk, user=request.user)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        order.paid = True
        order.save()

        return Response({
            'message': 'Order marked as paid',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_200_OK)

