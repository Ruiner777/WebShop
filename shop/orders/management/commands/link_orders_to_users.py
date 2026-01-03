from django.core.management.base import BaseCommand
from django.db.models import Q
from orders.models import Order
from users.models import User


class Command(BaseCommand):
    help = 'Привязывает заказы к пользователям по email адресу'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Показать что будет сделано без выполнения',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']

        # Находим заказы без пользователей
        orders_without_user = Order.objects.filter(user__isnull=True)

        if not orders_without_user.exists():
            self.stdout.write(
                self.style.SUCCESS('Все заказы уже привязаны к пользователям!')
            )
            return

        self.stdout.write(f'Найдено {orders_without_user.count()} заказов без пользователей')

        linked_count = 0

        for order in orders_without_user:
            # Ищем пользователя с таким же email
            try:
                user = User.objects.get(email=order.email)
                if dry_run:
                    self.stdout.write(
                        f'Будет привязан заказ {order.id} к пользователю {user.username} (email: {user.email})'
                    )
                else:
                    order.user = user
                    order.save()
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Привязан заказ {order.id} к пользователю {user.username}'
                        )
                    )
                linked_count += 1
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(
                        f'Не найден пользователь с email {order.email} для заказа {order.id}'
                    )
                )
            except User.MultipleObjectsReturned:
                self.stdout.write(
                    self.style.WARNING(
                        f'Найдено несколько пользователей с email {order.email} для заказа {order.id}'
                    )
                )

        if dry_run:
            self.stdout.write(f'Будет привязано {linked_count} заказов')
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Привязано {linked_count} заказов к пользователям')
            )
