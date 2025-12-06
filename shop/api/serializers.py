from rest_framework import serializers
from decimal import Decimal
from main.models import Category, Product
from users.models import User
from orders.models import Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели Category"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Product"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    price = serializers.SerializerMethodField()
    sell_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'name', 'slug', 
            'image', 'description', 'price', 'available', 
            'created', 'updated', 'discount', 'sell_price'
        ]
        read_only_fields = ['created', 'updated']
    
    def get_price(self, obj):
        """Конвертирует Decimal в float для JSON сериализации"""
        return float(obj.price) if isinstance(obj.price, Decimal) else obj.price
    
    def get_sell_price(self, obj):
        """Вычисляет цену со скидкой"""
        if obj.discount:
            result = round(obj.price - obj.price * obj.discount / 100, 2)
            # Конвертируем Decimal в float для JSON сериализации
            return float(result) if isinstance(result, Decimal) else result
        # Конвертируем Decimal в float
        return float(obj.price) if isinstance(obj.price, Decimal) else obj.price


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для модели User"""
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'image', 'date_joined', 'is_staff', 'is_active'
        ]
        read_only_fields = ['id', 'date_joined', 'is_staff', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }


class OrderItemSerializer(serializers.ModelSerializer):
    """Сериализатор для модели OrderItem"""
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(),
        source='product',
        write_only=True
    )
    cost = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_id', 'price', 
            'quantity', 'cost'
        ]
    
    def get_cost(self, obj):
        """Вычисляет общую стоимость позиции"""
        return obj.get_cost()


class OrderSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Order"""
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False,
        allow_null=True
    )
    items = OrderItemSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_id', 'first_name', 'last_name',
            'email', 'city', 'address', 'postal_code', 'created',
            'updated', 'paid', 'items', 'total_cost'
        ]
        read_only_fields = ['created', 'updated']
    
    def get_total_cost(self, obj):
        """Вычисляет общую стоимость заказа"""
        return obj.get_total_cost()


class CartItemSerializer(serializers.Serializer):
    """Сериализатор для позиции корзины (работает со словарями из сессионной корзины)"""
    # Используем ProductSerializer, но с кастомным to_representation для image
    product = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_slug = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    quantity = serializers.IntegerField(min_value=1, max_value=10)
    total_price = serializers.SerializerMethodField()
    
    def get_product(self, obj):
        """Сериализуем product через ProductSerializer, но без бинарных данных image"""
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        if product:
            # Используем ProductSerializer, но с кастомной обработкой
            serializer = ProductSerializer(product)
            data = serializer.data
            # Убеждаемся что image это строка (URL), а не бинарные данные
            if 'image' in data and data['image']:
                # Если image это не строка, конвертируем в URL
                if not isinstance(data['image'], str):
                    try:
                        if hasattr(product.image, 'url'):
                            data['image'] = product.image.url
                        elif hasattr(product.image, 'name'):
                            data['image'] = product.image.name
                        else:
                            data['image'] = str(product.image) if product.image else None
                    except:
                        data['image'] = None
            return data
        return None
    
    def get_product_id(self, obj):
        """Получаем ID продукта"""
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        if product:
            return product.id if hasattr(product, 'id') else None
        return None
    
    def get_product_name(self, obj):
        """Получаем название продукта"""
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        if product:
            return product.name if hasattr(product, 'name') else None
        return None
    
    def get_product_slug(self, obj):
        """Получаем slug продукта"""
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        if product:
            return product.slug if hasattr(product, 'slug') else None
        return None
    
    def get_product_price(self, obj):
        """Получаем цену продукта"""
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        if product and hasattr(product, 'price'):
            price = product.price
            return float(price) if isinstance(price, Decimal) else price
        # Если нет product, используем price из словаря
        price = obj.get('price') if isinstance(obj, dict) else getattr(obj, 'price', None)
        if price:
            return float(price) if isinstance(price, Decimal) else price
        return 0.0
    
    def get_product_image(self, obj):
        """Возвращаем только URL или имя файла изображения, не бинарные данные"""
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        if product and hasattr(product, 'image') and product.image:
            # Возвращаем строку - URL или имя файла, не объект ImageField
            try:
                # Пытаемся получить URL изображения
                if hasattr(product.image, 'url'):
                    return product.image.url
                # Если нет URL, возвращаем имя файла
                elif hasattr(product.image, 'name'):
                    return product.image.name
                # В крайнем случае - строковое представление
                else:
                    return str(product.image) if product.image else None
            except (ValueError, AttributeError):
                # Если ошибка при получении URL, возвращаем None
                return None
        return None
    
    def get_total_price(self, obj):
        """Вычисляем общую стоимость позиции"""
        # Используем total_price из словаря, если он есть
        if isinstance(obj, dict) and 'total_price' in obj:
            total = obj['total_price']
            # Всегда конвертируем Decimal в float
            if isinstance(total, Decimal):
                return float(total)
            elif isinstance(total, (int, float)):
                return float(total)
            else:
                try:
                    return float(total)
                except (ValueError, TypeError):
                    return 0.0
        
        # Альтернативный расчет
        product = obj.get('product') if isinstance(obj, dict) else getattr(obj, 'product', None)
        quantity = obj.get('quantity') if isinstance(obj, dict) else getattr(obj, 'quantity', 0)
        
        if product and hasattr(product, 'price'):
            price = product.price
            if product.discount:
                sell_price = product.sell_price()
                if isinstance(sell_price, Decimal):
                    sell_price = float(sell_price)
                total = sell_price * quantity
            else:
                if isinstance(price, Decimal):
                    price = float(price)
                total = price * quantity
            return float(total) if isinstance(total, Decimal) else total
        
        return 0.0


class CartSerializer(serializers.Serializer):
    """Сериализатор для корзины (работает со списком словарей из сессионной корзины)"""
    items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    total_quantity = serializers.SerializerMethodField()
    
    def get_items(self, obj):
        """Сериализует элементы корзины"""
        # obj - это список словарей из корзины
        item_serializer = CartItemSerializer(obj, many=True)
        return item_serializer.data
    
    def get_total_price(self, obj):
        """Вычисляет общую стоимость корзины"""
        # obj - это список словарей из корзины
        # Используем float с самого начала, чтобы избежать проблем с Decimal
        total = 0.0
        
        for item in obj:
            if isinstance(item, dict):
                # Преобразуем price сразу в float
                price_str = item.get('price', '0')
                try:
                    # Если price уже Decimal, конвертируем в float
                    if isinstance(price_str, Decimal):
                        price = float(price_str)
                    else:
                        price = float(price_str)
                except (ValueError, TypeError):
                    price = 0.0
                
                quantity = item.get('quantity', 0)
                product = item.get('product')
                
                if product and hasattr(product, 'discount') and product.discount:
                    sell_price = product.sell_price()
                    # Убеждаемся что sell_price это число (float)
                    if isinstance(sell_price, Decimal):
                        sell_price = float(sell_price)
                    elif not isinstance(sell_price, (int, float)):
                        sell_price = float(sell_price)
                    total += sell_price * quantity
                else:
                    total += price * quantity
        
        # Возвращаем float (уже float, но для уверенности)
        return float(total) if total else 0.0
    
    def get_total_quantity(self, obj):
        """Вычисляет общее количество товаров в корзине"""
        # obj - это список словарей из корзины
        return sum(item.get('quantity', 0) if isinstance(item, dict) else getattr(item, 'quantity', 0) for item in obj)


