#!/usr/bin/env python
"""
Тест создания нового заказа и проверки сохранения stripe_session_id
Запуск: python test_new_order_payment.py
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

    from django.test import Client
    from django.contrib.auth import get_user_model
    from orders.models import Order, OrderItem
    from main.models import Product
    from cart.cart import Cart
    import json

    User = get_user_model()

    print("🧪 Тест создания заказа с оплатой")
    print("=" * 50)

    # Находим тестового пользователя
    user = User.objects.filter(is_active=True).first()
    if not user:
        print("❌ Нет активных пользователей")
        exit(1)

    print(f"👤 Тестовый пользователь: {user.username}")

    # Создаем заказ через API
    client = Client()
    client.force_login(user)

    # Получаем товары для заказа
    products = Product.objects.filter(available=True)[:2]  # Берем 2 товара
    if not products:
        print("❌ Нет доступных товаров")
        exit(1)

    print(f"🛒 Товары для заказа: {', '.join([p.name for p in products])}")

    # Создаем заказ через API
    order_data = {
        'first_name': 'Test',
        'last_name': 'User',
        'email': user.email,
        'address': 'Test Address',
        'postal_code': '12345',
        'city': 'Test City'
    }

    # Добавляем товары в корзину (имитируем)
    cart_data = {}
    for i, product in enumerate(products):
        cart_data[f'product_{i}'] = {
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'quantity': 1
        }

    # Создаем заказ через API
    print("📦 Создание заказа...")
    response = client.post('/api/v1/orders/', json.dumps(order_data),
                          content_type='application/json')

    if response.status_code != 201:
        print(f"❌ Ошибка создания заказа: {response.status_code}")
        print(f"Ответ: {response.content.decode()}")
        exit(1)

    order_data_response = response.json()
    order_id = order_data_response['id']
    print(f"✅ Заказ создан: ID {order_id}")

    # Проверяем заказ в БД
    order = Order.objects.get(id=order_id)
    print(f"📊 Статус заказа: paid={order.paid}")
    print(f"📊 Stripe Session ID: {order.stripe_session_id or 'Не установлен'}")

    # Создаем платеж через API
    print("💳 Создание платежа...")
    payment_response = client.post(f'/api/v1/payment/create-checkout-session/{order_id}/',
                                  content_type='application/json')

    print(f"📥 HTTP статус платежа: {payment_response.status_code}")

    if payment_response.status_code == 200:
        payment_data = payment_response.json()
        print(f"✅ Платеж создан: {payment_data['session_id']}")

        # Проверяем заказ после создания платежа
        order.refresh_from_db()
        print(f"📊 После создания платежа:")
        print(f"   Stripe Session ID: {order.stripe_session_id or 'Не установлен'}")
        print(f"   Paid: {order.paid}")

        if order.stripe_session_id:
            print("🎉 УСПЕХ! stripe_session_id сохранен")
        else:
            print("❌ ПРОБЛЕМА! stripe_session_id не сохранен")

    else:
        print(f"❌ Ошибка создания платежа: {payment_response.status_code}")
        print(f"Ответ: {payment_response.content.decode()}")

    print("🎯 Результат теста:")    
    print("Если stripe_session_id сохранен - создание платежа работает")
    print("Если нет - проблема в коде сохранения")

except ImportError as e:
    print(f"❌ Ошибка импорта Django: {e}")
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
