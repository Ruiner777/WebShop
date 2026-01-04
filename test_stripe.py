#!/usr/bin/env python
"""
Тест для проверки Stripe интеграции
Запуск: python test_stripe.py
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Добавляем путь к Django проекту
BASE_DIR = Path(__file__).resolve().parent / 'shop'
sys.path.append(str(BASE_DIR))

# Загружаем .env файл
env_paths = [
    BASE_DIR / '.env',
    BASE_DIR.parent / '.env',
    Path('.env'),
]

for env_path in env_paths:
    if env_path.exists():
        print(f"📄 Найден .env файл: {env_path}")
        load_dotenv(env_path)
        break
else:
    print("❌ .env файл не найден в возможных расположениях:")
    for path in env_paths:
        print(f"   - {path}")

# Проверяем переменные окружения
print("\n🔍 Проверка переменных окружения:")
stripe_publishable = os.getenv('STRIPE_PUBLISHABLE_KEY')
stripe_secret = os.getenv('STRIPE_SECRET_KEY')
stripe_webhook = os.getenv('STRIPE_WEBHOOK_SECRET')

print(f"STRIPE_PUBLISHABLE_KEY: {'✅ Загружена' if stripe_publishable else '❌ Отсутствует'}")
print(f"STRIPE_SECRET_KEY: {'✅ Загружена' if stripe_secret else '❌ Отсутствует'}")
print(f"STRIPE_WEBHOOK_SECRET: {'✅ Загружена' if stripe_webhook else '❌ Отсутствует'}")

if stripe_publishable and stripe_secret:
    print("
🔑 Ключи Stripe:"    print(f"Publishable: {stripe_publishable[:20]}...")
    print(f"Secret: {stripe_secret[:20]}...")

    # Тестируем подключение к Stripe
    try:
        import stripe
        stripe.api_key = stripe_secret
        stripe.api_version = '2022-08-01'

        print("
🧪 Тестирование Stripe API..."        # Простой тест - получаем список клиентов (должен работать даже без клиентов)
        customers = stripe.Customer.list(limit=1)
        print("✅ Stripe API работает корректно!")

        # Тест создания checkout session (без реальных данных)
        print("
🧪 Тест создания checkout session..."        # Это должно провалиться, но показать что API доступен
        try:
            session = stripe.checkout.Session.create(
                mode='payment',
                success_url='http://localhost:3000/success',
                cancel_url='http://localhost:3000/cancel',
                line_items=[{
                    'price_data': {
                        'unit_amount': 1000,  # $10.00
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Test Product',
                        },
                    },
                    'quantity': 1,
                }]
            )
            print("✅ Создание checkout session работает!")
        except stripe.error.InvalidRequestError as e:
            if "testmode" in str(e):
                print("⚠️  Stripe в test mode - это нормально для разработки")
            else:
                print(f"❌ Ошибка создания session: {e}")
        except Exception as e:
            print(f"❌ Ошибка при создании checkout session: {e}")

    except ImportError:
        print("❌ Stripe не установлен. Установите: pip install stripe")
    except Exception as e:
        print(f"❌ Ошибка подключения к Stripe: {e}")
        if "testmode" in str(e):
            print("💡 Возможно ключи для live mode, а нужно test mode")
else:
    print("
❌ Ключи Stripe не загружены. Создайте .env файл с ключами:"    print("STRIPE_PUBLISHABLE_KEY=pk_test_...")
    print("STRIPE_SECRET_KEY=sk_test_...")
    print("STRIPE_WEBHOOK_SECRET=whsec_...")

print("
📝 Инструкции:"print("1. Создайте .env файл в корне проекта или в shop/")
print("2. Добавьте реальные Stripe ключи из https://dashboard.stripe.com/test/apikeys")
print("3. Запустите тест снова: python test_stripe.py")
