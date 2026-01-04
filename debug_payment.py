#!/usr/bin/env python
"""
Отладка платежной интеграции Stripe
Запуск: python debug_payment.py
"""

import os
import sys
from pathlib import Path

# Настраиваем Django
BASE_DIR = Path(__file__).resolve().parent / 'shop'
sys.path.append(str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

try:
    import django
    django.setup()

    from django.conf import settings
    from dotenv import load_dotenv

    print("🔧 Django настроен успешно")

    # Проверяем загрузку переменных окружения
    print("
🔍 Переменные окружения:"    print(f"STRIPE_PUBLISHABLE_KEY: {bool(settings.STRIPE_PUBLISHABLE_KEY)}")
    print(f"STRIPE_SECRET_KEY: {bool(settings.STRIPE_SECRET_KEY)}")
    print(f"STRIPE_WEBHOOK_SECRET: {bool(settings.STRIPE_WEBHOOK_SECRET)}")
    print(f"DEBUG: {settings.DEBUG}")

    # Проверяем пути к .env
    env_paths = [
        BASE_DIR / '.env',
        BASE_DIR.parent / '.env',
        Path('.env'),
    ]

    print("📁 Проверенные пути .env:")
        for path in env_paths:
        exists = path.exists()
        print(f"   {'✅' if exists else '❌'} {path}")

    # Тестируем Stripe если ключи загружены
    if settings.STRIPE_SECRET_KEY and settings.STRIPE_SECRET_KEY != 'sk_test_YOUR_SECRET_KEY_HERE':
        print("🧪 Тестирование Stripe...")        try:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            stripe.api_version = settings.STRIPE_API_VERSION

            # Простой тест
            customers = stripe.Customer.list(limit=1)
            print("✅ Stripe API подключен успешно!")
        except Exception as e:
            print(f"❌ Ошибка Stripe: {e}")
    else:
        print("❌ Stripe ключи не настроены или имеют placeholder значения")
                print("Создайте .env файл с реальными Stripe ключами")

    # Проверяем импорты
    print("📦 Проверка импортов:")
        try:
        from api.views import PaymentViewSet
        print("✅ PaymentViewSet импортирован")
    except ImportError as e:
        print(f"❌ Ошибка импорта PaymentViewSet: {e}")

    try:
        from orders.models import Order
        print("✅ Order модель доступна")
    except ImportError as e:
        print(f"❌ Ошибка импорта Order: {e}")

except Exception as e:
    print(f"❌ Ошибка настройки Django: {e}")
    print("Возможно нужно активировать виртуальное окружение: shop/venv/Scripts/activate")
