#!/usr/bin/env python
"""
Тест редиректа Stripe - проверка URLs
"""

# Имитируем создание URLs как в Django коде
def test_redirect_urls():
    order_id = 18

    # Старые URLs (Django)
    old_success_url = f"http://localhost:8000/orders/{order_id}?paid=true"
    old_cancel_url = f"http://localhost:8000/orders/{order_id}?canceled=true"

    # Новые URLs (React)
    new_success_url = f"http://localhost:3000/orders/{order_id}?paid=true"
    new_cancel_url = f"http://localhost:3000/orders/{order_id}?canceled=true"

    print("🔄 Тест редиректа Stripe")
    print("=" * 50)
    print(f"Order ID: {order_id}")
    print()
    print("❌ Старые URLs (Django):")
    print(f"   Success: {old_success_url}")
    print(f"   Cancel:  {old_cancel_url}")
    print()
    print("✅ Новые URLs (React):")
    print(f"   Success: {new_success_url}")
    print(f"   Cancel:  {new_cancel_url}")
    print()
    print("📋 Что изменено:")
    print("   localhost:8000 → localhost:3000")
    print("   Теперь Stripe будет перенаправлять на React приложение")
    print()
    print("🎯 Ожидаемый результат:")
    print("   После оплаты → React страница с сообщением 'Payment successful'")
    print("   При отмене → React страница с сообщением 'Payment canceled'")

if __name__ == "__main__":
    test_redirect_urls()
