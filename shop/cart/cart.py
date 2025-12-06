from decimal import Decimal
from django.conf import settings
from main.models import Product


class Cart:
    def __init__(self, request):
        self.session = request.session
        cart = self.session.get(settings.CART_SESSION_ID)
        if not cart:
            cart = self.session[settings.CART_SESSION_ID] = {}
        self.cart = cart


    def add(self, product, quantity=1, override_quantity=False):
        product_id = str(product.id)
        if product_id not in self.cart:
            self.cart[product_id] = {'quantity': 0,
                                     'price': str(product.price)}
        if override_quantity:
            self.cart[product_id]['quantity'] = quantity
        else:
            self.cart[product_id]['quantity'] += quantity
        self.save()


    def save(self):
        self.session.modified = True


    def remove(self, product):
        product_id = str(product.id)
        if product_id in self.cart:
            del self.cart[product_id]
            self.save()


    def __iter__(self):
        product_ids = self.cart.keys()
        products = Product.objects.filter(id__in=product_ids, available=True)
        product_dict = {str(product.id): product for product in products}
        
        for product_id, item in self.cart.items():
            item = item.copy()
            product = product_dict.get(product_id)
            
            if product:
                item['product'] = product
                # Оставляем price как строку (как в сессии) для сериализации
                # Конвертируем только для вычисления total_price
                price_str = item.get('price', '0')
                price_decimal = Decimal(price_str)
                # Оставляем price как строку, чтобы избежать проблем с Decimal в сериализации
                item['price'] = price_str  # Строка для сериализации
                item['total_price'] = float(price_decimal * item['quantity'])  # float для сериализации
                yield item

        
    def __len__(self):
        return sum(item['quantity'] for item in self.cart.values())
    

    def clear(self):
        del self.session[settings.CART_SESSION_ID]


    def get_total_price(self):
        total = sum((Decimal(item['price']) - (Decimal(item['price']) \
                    *  Decimal(item['product'].discount / 100))) * item['quantity']
                        for item in self.cart.values())
        return format(total, '.2f')