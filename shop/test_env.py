#!/usr/bin/env python
"""
Тест загрузки .env и работы Stripe
Запуск: python test_env.py (из папки shop/)
"""

import os
import sys
from pathlib import Path

print("🔧 Тест загрузки .env файла")
print("=" * 50)

# Проверяем текущую директорию
current_dir = Path.cwd()
print(f"📁 Текущая директория: {current_dir}")

# Проверяем файлы в директории
try:
    files = list(current_dir.iterdir())
    env_files = [f for f in files if f.name.startswith('.env') or f.name.endswith('.env')]
    print(f"📄 Файлы .env в текущей директории: {[f.name for f in env_files]}")
except Exception as e:
    print(f"❌ Ошибка чтения директории: {e}")

# Проверяем существование .env
env_path = current_dir / '.env'
if env_path.exists():
    print(f"✅ .env файл найден: {env_path}")
    try:
        with open(env_path, 'r') as f:
            content = f.read()
            lines = content.strip().split('\n')
            print(f"📄 Содержимое .env ({len(lines)} строк):")
            for line in lines[:5]:  # Показываем первые 5 строк
                if line.strip() and not line.startswith('#'):
                    key = line.split('=')[0] if '=' in line else line
                    print(f"   🔑 {key}")
            if len(lines) > 5:
                print(f"   ... и ещё {len(lines) - 5} строк")
    except Exception as e:
        print(f"❌ Ошибка чтения .env: {e}")
else:
    print(f"❌ .env файл НЕ найден в: {env_path}")
    print("💡 Создайте .env файл с содержимым из env-config.txt")

print("\n🔍 Тестирование загрузки переменных окружения")
print("-" * 50)

# Пробуем загрузить .env
try:
    from dotenv import load_dotenv
    print("✅ python-dotenv установлен")

    # Загружаем .env
    loaded = load_dotenv(env_path)
    print(f"📦 load_dotenv() результат: {loaded}")

except ImportError:
    print("❌ python-dotenv НЕ установлен. Установите: pip install python-dotenv")

# Проверяем переменные окружения
stripe_secret = os.getenv('STRIPE_SECRET_KEY')
stripe_publishable = os.getenv('STRIPE_PUBLISHABLE_KEY')
stripe_webhook = os.getenv('STRIPE_WEBHOOK_SECRET')
debug = os.getenv('DEBUG')

print("🔑 Переменные окружения:")
print(f"STRIPE_SECRET_KEY: {'✅ Загружена' if stripe_secret else '❌ Отсутствует'}")
print(f"STRIPE_PUBLISHABLE_KEY: {'✅ Загружена' if stripe_publishable else '❌ Отсутствует'}")
print(f"STRIPE_WEBHOOK_SECRET: {'✅ Загружена' if stripe_webhook else '❌ Отсутствует'}")
print(f"DEBUG: {debug}")

if stripe_secret and stripe_secret != 'sk_test_YOUR_SECRET_KEY_HERE':
    print("🧪 Тестирование Stripe API")    
    print("-" * 50)

    try:
        import stripe
        print("✅ Stripe SDK установлен")

        # Устанавливаем API key
        stripe.api_key = stripe_secret
        stripe.api_version = '2022-08-01'

        # Тестируем подключение
        print("🔌 Тестирование подключения к Stripe...")
        try:
            # Простой тест - получение аккаунта
            account = stripe.Account.retrieve()
            print("✅ Stripe API работает! Аккаунт подключен.")
            print(f"   📊 Режим: {'Test' if account.charges_enabled == False else 'Live'}")

        except stripe.error.AuthenticationError as e:
            print(f"❌ Ошибка аутентификации Stripe: {e}")
            print("💡 Проверьте правильность SECRET KEY в Stripe Dashboard")

        except stripe.error.StripeError as e:
            print(f"❌ Ошибка Stripe API: {e}")

        except Exception as e:
            print(f"❌ Неожиданная ошибка: {type(e).__name__}: {e}")

    except ImportError:
        print("❌ Stripe SDK НЕ установлен. Установите: pip install stripe")

else:
    print("❌ Stripe ключи не настроены")    
    print("💡 Отредактируйте .env файл и замените placeholder значения на реальные ключи из Stripe Dashboard")

print("📋 Следующие шаги:")
print("1. Создайте .env файл в папке shop/ (скопируйте из env-config.txt)")
print("2. Получите ключи из https://dashboard.stripe.com/test/apikeys")
print("3. Замените placeholder значения в .env")
print("4. Запустите тест снова: python test_env.py")
print("5. Если все работает - попробуйте оплату в приложении")
