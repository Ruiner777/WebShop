from rest_framework import serializers
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
    sell_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'name', 'slug', 
            'image', 'description', 'price', 'available', 
            'created', 'updated', 'discount', 'sell_price'
        ]
        read_only_fields = ['created', 'updated']
    
    def get_sell_price(self, obj):
        """Вычисляет цену со скидкой"""
        if obj.discount:
            return round(obj.price - obj.price * obj.discount / 100, 2)
        return obj.price


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


