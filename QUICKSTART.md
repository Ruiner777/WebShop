# Быстрый старт

## Шаг 1: Установка зависимостей бэкенда

```bash
cd shop
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

## Шаг 2: Настройка базы данных

1. Создайте файл `.env` в папке `shop/`:
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

2. Примените миграции:
```bash
cd shop
python manage.py migrate
python manage.py createsuperuser
```

## Шаг 3: Запуск бэкенда

```bash
cd shop
python manage.py runserver
```

Бэкенд запустится на `http://localhost:8000`

## Шаг 4: Установка зависимостей фронтенда

Откройте новый терминал:

```bash
cd frontend
npm install
```

## Шаг 5: Запуск фронтенда

```bash
cd frontend
npm run dev
```

Фронтенд запустится на `http://localhost:3000`

## Готово! 🎉

Откройте `http://localhost:3000` в браузере. Если вы видите список категорий и продуктов - всё работает!

## Проверка API

- API Root: http://localhost:8000/api/v1/
- Категории: http://localhost:8000/api/v1/categories/
- Продукты: http://localhost:8000/api/v1/products/
- Админ-панель: http://localhost:8000/admin/



