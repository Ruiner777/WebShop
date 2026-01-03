#!/usr/bin/env python
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')
django.setup()

from orders.models import Order
from users.models import User

print(f'Всего заказов: {Order.objects.count()}')
print(f'Заказов с пользователем: {Order.objects.filter(user__isnull=False).count()}')
print(f'Заказов без пользователя: {Order.objects.filter(user__isnull=True).count()}')

print('\nПоследние 5 заказов:')
for order in Order.objects.all()[:5]:
    print(f'ID: {order.id}, User: {order.user}, Created: {order.created}, Email: {order.email}')

print('Пользователи с заказами:')
users_with_orders = User.objects.filter(order__isnull=False).distinct()
for user in users_with_orders:
    print(f'{user.username}: {user.order_set.count()} заказов')

print('\nЗаказы без пользователей:')
for order in Order.objects.filter(user__isnull=True):
    print(f'ID: {order.id}, Email: {order.email}, Created: {order.created}')