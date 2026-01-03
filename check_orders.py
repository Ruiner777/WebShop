#!/usr/bin/env python
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')
sys.path.append('shop')
django.setup()

from orders.models import Order

print(f'Всего заказов: {Order.objects.count()}')
print(f'Заказов с пользователем: {Order.objects.filter(user__isnull=False).count()}')
print(f'Заказов без пользователя: {Order.objects.filter(user__isnull=True).count()}')

print('\nПоследние 5 заказов:')
for order in Order.objects.all()[:5]:
    print(f'ID: {order.id}, User: {order.user}, Created: {order.created}, Email: {order.email}')
