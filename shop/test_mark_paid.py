#!/usr/bin/env python
"""
Тест API endpoint markPaid
Запуск: python test_mark_paid.py [order_id]
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
    from orders.models import Order

    User = get_user_model()

    # Получаем ID заказа
    if len(sys.argv) > 1:
        order_id = int(sys.argv[1])
    else:
        # Берем последний заказ авторизованного пользователя
        try:
            user = User.objects.filter(is_active=True).first()
            if user:
                order = Order.objects.filter(user=user).last()
                if order:
                    order_id = order.id
                else:
                    print("❌ У пользователя нет заказов")
                    exit(1)
            else:
                print("❌ Нет активных пользователей")
                exit(1)
        except:
            print("❌ Не удалось найти заказ")
            exit(1)

    print(f"🧪 Тест markPaid API для заказа {order_id}")
    print("=" * 50)

    # Проверяем заказ до API вызова
    try:
        order = Order.objects.get(id=order_id)
        print(f"📦 Статус до вызова: paid={order.paid}")
    except Order.DoesNotExist:
        print(f"❌ Заказ {order_id} не найден")
        exit(1)

    # Находим пользователя заказа
    user = order.user
    if not user:
        print("❌ Заказ не привязан к пользователю")
        exit(1)

    # Создаем тестовый клиент
    client = Client()

    # Авторизуемся как пользователь заказа
    from django.contrib.sessions.middleware import SessionMiddleware
    from django.contrib.auth.middleware import AuthenticationMiddleware

    # Имитируем авторизацию
    client.force_login(user)
    print(f"✅ Авторизованы как: {user.username}")

    # Вызываем API
    api_url = f'/api/v1/orders/{order_id}/mark_paid/'
    print(f"🔄 Вызов API: {api_url}")

    try:
        response = client.post(api_url, {}, content_type='application/json')
        print(f"📥 HTTP статус: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            print(f"✅ API ответ: {data}")

            # Проверяем статус после вызова
            order.refresh_from_db()
            print(f"📦 Статус после вызова: paid={order.paid}")

            if order.paid:
                print("🎉 Успех! Заказ отмечен как оплаченный")
            else:
                print("⚠️ Предупреждение: Статус не изменился")
        else:
            print(f"❌ Ошибка API: {response.status_code}")
            print(f"📄 Ответ: {response.content.decode()}")

    except Exception as e:
        print(f"❌ Ошибка при вызове API: {e}")
        import traceback
        traceback.print_exc()

except ImportError as e:
    print(f"❌ Ошибка импорта Django: {e}")
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
