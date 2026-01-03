from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import (
    CategoryViewSet,
    ProductViewSet,
    UserViewSet,
    OrderViewSet,
    OrderItemViewSet,
    CartViewSet,
    AuthViewSet,
    SearchViewSet # Добавляем SearchViewSet
)

# Создаем роутер и регистрируем ViewSets
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'users', UserViewSet, basename='user')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'order-items', OrderItemViewSet, basename='orderitem')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'search', SearchViewSet, basename='search')

urlpatterns = [
    path('auth-token/', obtain_auth_token, name='api_token_auth'),
    path('', include(router.urls)),
]

