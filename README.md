# WebShop - Интернет-магазин

Полнофункциональный интернет-магазин с Django REST Framework бэкендом и React фронтендом.

## Структура проекта

```
WebShop/
├── shop/              # Django бэкенд
│   ├── api/          # REST API endpoints
│   ├── main/         # Основное приложение (продукты, категории)
│   ├── cart/         # Корзина покупок
│   ├── users/        # Пользователи и аутентификация
│   ├── orders/       # Заказы
│   └── payment/      # Платежи (Stripe)
└── frontend/         # React фронтенд (Vite)
```

## Технологии

### Бэкенд
- Django 5.2
- Django REST Framework
- PostgreSQL
- django-cors-headers
- Stripe (для платежей)

### Фронтенд
- React 18
- Vite 5
- Axios

## Требования

- Python 3.8+
- Node.js 16+
- PostgreSQL
- npm или yarn

## Установка и запуск

### 1. Настройка бэкенда

#### Установка зависимостей

```bash
cd shop
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

**Примечание:** Если файл `requirements.txt` отсутствует, установите зависимости вручную:

```bash
pip install django djangorestframework django-cors-headers psycopg2-binary python-dotenv pillow stripe
```

#### Настройка базы данных

1. Создайте базу данных PostgreSQL:
```sql
CREATE DATABASE shop;
CREATE USER shop WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE shop TO shop;
```

2. Создайте файл `.env` в папке `shop/`:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=shop
DB_USER=shop
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

#### Применение миграций

```bash
cd shop
python manage.py migrate
python manage.py createsuperuser
```

#### Запуск сервера разработки

```bash
cd shop
python manage.py runserver
```

Бэкенд будет доступен по адресу: `http://localhost:8000`

### 2. Настройка фронтенда

#### Установка зависимостей

```bash
cd frontend
npm install
```

#### Запуск в режиме разработки

```bash
cd frontend
npm run dev
```

Фронтенд будет доступен по адресу: `http://localhost:3000`

## Проверка работы

### Проверка бэкенда

1. Откройте в браузере: `http://localhost:8000/admin/` - админ-панель Django
2. Откройте: `http://localhost:8000/api/v1/` - список доступных API endpoints
3. Откройте: `http://localhost:8000/api/v1/products/` - список продуктов (JSON)

### Проверка фронтенда

1. Откройте: `http://localhost:3000`
2. Приложение автоматически загрузит данные с бэкенда
3. Если данные загрузились успешно, вы увидите список категорий и продуктов

### Проверка связи между фронтендом и бэкендом

Фронтенд автоматически делает запросы к `/api/v1/categories/` и `/api/v1/products/` при загрузке.
Если вы видите данные на странице - связь работает корректно!

## API Endpoints

### Категории
- `GET /api/v1/categories/` - список категорий
- `GET /api/v1/categories/{slug}/` - детали категории
- `POST /api/v1/categories/` - создание категории (требует аутентификации)
- `PUT /api/v1/categories/{slug}/` - обновление категории
- `DELETE /api/v1/categories/{slug}/` - удаление категории

### Продукты
- `GET /api/v1/products/` - список продуктов
- `GET /api/v1/products/{slug}/` - детали продукта
- `GET /api/v1/products/available/` - только доступные продукты
- `POST /api/v1/products/` - создание продукта (требует аутентификации)
- `PUT /api/v1/products/{slug}/` - обновление продукта
- `DELETE /api/v1/products/{slug}/` - удаление продукта

### Пользователи
- `GET /api/v1/users/` - список пользователей (требует аутентификации)
- `GET /api/v1/users/me/` - информация о текущем пользователе
- `POST /api/v1/users/` - регистрация (без аутентификации)

### Заказы
- `GET /api/v1/orders/` - список заказов (только свои, или все для staff)
- `POST /api/v1/orders/` - создание заказа (требует аутентификации)

### Аутентификация
- `POST /api/v1/auth-token/` - получение токена аутентификации
  ```json
  {
    "username": "your_username",
    "password": "your_password"
  }
  ```

## Настройка CORS

CORS уже настроен в `shop/shop/settings.py` для работы с фронтендом на `localhost:3000` и `localhost:5173`.

Если нужно добавить другие домены, отредактируйте `CORS_ALLOWED_ORIGINS` в настройках.

## Проксирование в Vite

Все запросы к `/api` автоматически проксируются на `http://localhost:8000` через настройку в `frontend/vite.config.js`.

Это позволяет избежать проблем с CORS во время разработки.

## Разработка

### Бэкенд
- Django сервер автоматически перезагружается при изменении файлов
- API доступно через Django REST Framework
- Админ-панель: `http://localhost:8000/admin/`

### Фронтенд
- Vite обеспечивает горячую перезагрузку (HMR)
- Изменения в коде применяются мгновенно
- API клиент находится в `frontend/src/api.js`

## Сборка для продакшена

### Фронтенд

```bash
cd frontend
npm run build
```

Собранные файлы будут в папке `frontend/dist/`

### Бэкенд

Для продакшена используйте:
- Gunicorn или uWSGI для WSGI сервера
- Nginx для статических файлов и проксирования
- Настройте `DEBUG=False` в `.env`
- Настройте `ALLOWED_HOSTS` для вашего домена

## Устранение неполадок

### Фронтенд не может подключиться к бэкенду

1. Убедитесь, что Django сервер запущен на `localhost:8000`
2. Проверьте настройки CORS в `shop/shop/settings.py`
3. Проверьте проксирование в `frontend/vite.config.js`

### Ошибки CORS

Убедитесь, что `django-cors-headers` установлен и добавлен в `INSTALLED_APPS` и `MIDDLEWARE`.

### Проблемы с базой данных

1. Проверьте настройки в `.env`
2. Убедитесь, что PostgreSQL запущен
3. Проверьте права доступа пользователя базы данных

## Лицензия

MIT



