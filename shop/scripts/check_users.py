#!/usr/bin/env python
import os
import sys
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shop.settings')
django.setup()

from users.models import User

print('Пользователи в системе:')
for user in User.objects.all():
    print(f'{user.username}: {user.email}')