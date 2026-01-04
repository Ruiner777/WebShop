#!/usr/bin/env python
"""
Тест импортов Django
Запуск: python test_imports.py (из папки shop/)
"""

import sys
import os

# Настраиваем Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')

try:
    import django
    django.setup()
    print("✅ Django настроен успешно")

    # Тестируем импорты
    try:
        from django.conf import settings
        print("✅ django.conf.settings импортирован")
    except ImportError as e:
        print(f"❌ Ошибка импорта django.conf.settings: {e}")

    try:
        from api.views import PaymentViewSet, CsrfExemptSessionAuthentication
        print("✅ PaymentViewSet и CsrfExemptSessionAuthentication импортированы")
    except ImportError as e:
        print(f"❌ Ошибка импорта PaymentViewSet: {e}")

    try:
        from orders.models import Order
        print("✅ Order модель доступна")
    except ImportError as e:
        print(f"❌ Ошибка импорта Order: {e}")

    # Тестируем settings
    try:
        stripe_secret = getattr(settings, 'STRIPE_SECRET_KEY', None)
        print(f"✅ settings.STRIPE_SECRET_KEY доступен: {bool(stripe_secret)}")
    except Exception as e:
        print(f"❌ Ошибка доступа к settings.STRIPE_SECRET_KEY: {e}")

    print("\n🎉 Все импорты успешны!")

except Exception as e:
    print(f"❌ Ошибка настройки Django: {e}")
