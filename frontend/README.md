# WebShop Frontend

React-приложение для интернет-магазина, созданное с помощью Vite.

## Технологии

- React 18
- Vite 5
- Axios для HTTP-запросов

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## Сборка для продакшена

```bash
npm run build
```

## Настройка

### Проксирование API

Все запросы к `/api` автоматически проксируются на `http://localhost:8000` (Django бэкенд).
Настройка находится в `vite.config.js`.

### API клиент

Базовый API клиент находится в `src/api.js` и использует axios для взаимодействия с Django REST Framework API.

## Структура проекта

```
frontend/
├── src/
│   ├── api.js          # API клиент с методами для работы с бэкендом
│   ├── App.jsx         # Главный компонент приложения
│   ├── App.css         # Стили приложения
│   ├── main.jsx        # Точка входа
│   └── index.css       # Глобальные стили
├── index.html          # HTML шаблон
├── vite.config.js      # Конфигурация Vite
└── package.json        # Зависимости проекта
```



