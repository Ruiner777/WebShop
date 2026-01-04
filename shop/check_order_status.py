#!/usr/bin/env python
"""
Проверка статуса заказа в базе данных
Запуск: python check_order_status.py [order_id]
"""

import os
import sys
from pathlib import Path

# Настраиваем Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

try:
    import django
    django.setup()

    from orders.models import Order

    # Получаем ID заказа из аргументов командной строки
    if len(sys.argv) > 1:
        order_id = int(sys.argv[1])
    else:
        # Если ID не указан, берем последний заказ
        last_order = Order.objects.last()
        if last_order:
            order_id = last_order.id
        else:
            print("❌ Нет заказов в базе данных")
            exit(1)

    try:
        order = Order.objects.get(id=order_id)
        print("📦 Статус заказа:")        
        print(f"   ID: {order.id}")
        print(f"   Пользователь: {order.user.username if order.user else 'Anonymous'}")
        print(f"   Оплачен: {'✅ Да' if order.paid else '❌ Нет'}")
        print(f"   Stripe ID: {order.stripe_id or 'Не установлен'}")
        print(f"   Stripe Session ID: {order.stripe_session_id or 'Не установлен'}")
        print(f"   Дата создания: {order.created}")
        print(f"   Сумма: ${order.get_total_cost()}")

        print(" 🛒 Товары в заказе:")        
        for item in order.items.all():
            print(f"   - {item.product.name}: {item.quantity} шт. x ${item.price} = ${item.get_cost()}")

        print("💡 Советы:")        
        if not order.paid:
            print("   - Заказ не оплачен. Проверьте webhook логи")
            if order.stripe_session_id:
                print(f"   - Stripe Session ID установлен: {order.stripe_session_id}")
                print("   - Проверьте статус оплаты в Stripe Dashboard")
            else:
                print("   - Stripe Session ID не установлен - проблема при создании платежа")

    except Order.DoesNotExist:
        print(f"❌ Заказ с ID {order_id} не найден")
        print("📋 Доступные заказы:")        
        for order in Order.objects.all()[:5]:
            print(f"   ID {order.id}: {order.user.username if order.user else 'Anonymous'} - {'Оплачен' if order.paid else 'Не оплачен'}")

except ImportError as e:
    print(f"❌ Ошибка импорта Django: {e}")
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
