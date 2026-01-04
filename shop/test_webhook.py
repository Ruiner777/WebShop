#!/usr/bin/env python
"""
Тест Stripe webhook
Запуск: python test_webhook.py
"""

import os
import sys
import json
from pathlib import Path

# Настраиваем Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

try:
    import django
    django.setup()

    from django.test import RequestFactory
    from django.http import HttpResponse
    from payment.webhooks import stripe_webhook
    from orders.models import Order
    import stripe
    from django.conf import settings

    print("🔧 Тест Stripe webhook")
    print("=" * 50)

    # Проверяем настройки Stripe
    stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', None)
    stripe_webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', None)

    print(f"Stripe Secret Key: {'✅' if stripe_secret else '❌'}")
    print(f"Stripe Webhook Secret: {'✅' if stripe_webhook_secret else '❌'}")

    if not stripe_secret or stripe_secret == 'sk_test_YOUR_SECRET_KEY_HERE':
        print("❌ Stripe ключи не настроены")
        print("Создайте .env файл с реальными ключами")
        exit(1)

    # Создаем тестовый webhook payload
    test_payload = {
        "id": "evt_test_webhook",
        "object": "event",
        "api_version": "2020-08-27",
        "created": 1326853478,
        "data": {
            "object": {
                "id": "cs_test_1234567890",
                "object": "checkout.session",
                "client_reference_id": "1",  # ID заказа
                "mode": "payment",
                "payment_status": "paid",
                "payment_intent": "pi_test_1234567890"
            }
        },
        "livemode": False,
        "pending_webhooks": 1,
        "request": {
            "id": "req_test",
            "idempotency_key": None
        },
        "type": "checkout.session.completed"
    }

    # Имитируем webhook запрос
    factory = RequestFactory()
    request = factory.post(
        '/payment/webhook/',
        data=json.dumps(test_payload),
        content_type='application/json'
    )

    # Добавляем необходимые headers
    import hmac
    import hashlib
    import base64

    # Создаем подпись (упрощенная версия для теста)
    payload_bytes = json.dumps(test_payload, separators=(',', ':')).encode('utf-8')
    secret_bytes = stripe_webhook_secret.encode('utf-8')

    signature = hmac.new(secret_bytes, payload_bytes, hashlib.sha256)
    signature_b64 = base64.b64encode(signature.digest()).decode('utf-8')

    request.META['HTTP_STRIPE_SIGNATURE'] = f't={1326853478},v1={signature_b64}'
    request._body = payload_bytes

    print("🧪 Тестирование webhook...")
        try:
        response = stripe_webhook(request)
        print(f"✅ Webhook вернул статус: {response.status_code}")

        # Проверить, обновился ли заказ
        try:
            order = Order.objects.get(id=1)
            print(f"✅ Заказ найден: ID={order.id}, paid={order.paid}")
            if order.stripe_id:
                print(f"✅ Stripe ID сохранен: {order.stripe_id}")
        except Order.DoesNotExist:
            print("⚠️  Заказ с ID=1 не найден (это нормально для теста)")

    except Exception as e:
        print(f"❌ Ошибка webhook: {e}")
        import traceback
        traceback.print_exc()

    print("📋 Настройка webhook для продакшена:")
    print("1. В Stripe Dashboard → Developers → Webhooks")
    print("2. Add endpoint: https://your-domain.com/payment/webhook/")
    print("3. Select events: checkout.session.completed")
    print("4. Copy webhook secret в STRIPE_WEBHOOK_SECRET")
    print()
    print("Для локальной разработки:")
    print("stripe listen --forward-to localhost:8000/payment/webhook/")
    print("Или используйте ngrok: ngrok http 8000")

except ImportError as e:
    print(f"❌ Ошибка импорта: {e}")
except Exception as e:
    print(f"❌ Неожиданная ошибка: {e}")
    import traceback
    traceback.print_exc()
