#!/usr/bin/env python
"""
Проверка и применение миграций
Запуск: python check_migrations.py
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
    from django.core.management import execute_from_command_line
    django.setup()

    print("🔧 Проверка миграций Django")
    print("=" * 50)

    # Проверяем статус миграций для orders
    from django.core.management import call_command
    from io import StringIO

    print("📋 Статус миграций orders:")
    output = StringIO()
    call_command('showmigrations', 'orders', stdout=output)
    migrations_output = output.getvalue()
    print(migrations_output)

    # Проверяем, есть ли непримененные миграции
    if '[ ]' in migrations_output:
        print("⚠️ Есть непримененные миграции!")
        print("🔄 Применяем миграции...")

        try:
            call_command('migrate', 'orders', verbosity=2)
            print("✅ Миграции применены успешно!")
        except Exception as e:
            print(f"❌ Ошибка при применении миграций: {e}")
    else:
        print("✅ Все миграции применены")

    # Проверяем структуру таблицы Order
    from orders.models import Order
    from django.db import connection

    print("
📊 Структура таблицы Order:"    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'orders_order'
            ORDER BY ordinal_position;
        """)
        columns = cursor.fetchall()

        for column in columns:
            nullable = "NULL" if column[2] == "YES" else "NOT NULL"
            print(f"   {column[0]}: {column[1]} {nullable}")

    # Проверяем, что поле stripe_session_id существует
    field_names = [f.name for f in Order._meta.fields]
    if 'stripe_session_id' in field_names:
        print("✅ Поле stripe_session_id существует в модели")
    else:
        print("❌ Поле stripe_session_id НЕ найдено в модели")

    print("
🎯 Проверка завершена"except ImportError as e:
    print(f"❌ Ошибка импорта Django: {e}")
except Exception as e:
    print(f"❌ Ошибка: {e}")
    import traceback
    traceback.print_exc()
