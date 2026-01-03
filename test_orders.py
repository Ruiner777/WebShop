#!/usr/bin/env python
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')
sys.path.append('shop')
django.setup()

from users.models import User
from orders.models import Order
from api.views import OrderViewSet
from rest_framework.test import APIRequestFactory

# Создаем фабрику запросов
factory = APIRequestFactory()

# Получаем тестового пользователя
user = User.objects.get(username='testuser')
print(f'Тестируем пользователя: {user.username}, email: {user.email}')

# Создаем запрос
request = factory.get('/api/v1/orders/')
request.user = user

# Создаем viewset и устанавливаем request
viewset = OrderViewSet()
viewset.request = request

# Вызываем get_queryset
print('Вызываем get_queryset...')
queryset = viewset.get_queryset()

print(f'Результат: {list(queryset.values_list("id", flat=True))}')

# Проверяем, привязались ли заказы
user.refresh_from_db()
print(f'Заказы пользователя после запроса: {[order.id for order in user.order_set.all()]}')
