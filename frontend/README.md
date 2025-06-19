# 🚀 Запуск микросервисной экосистемы с React фронтендом

## 📋 Структура проекта после добавления фронтенда

```
sandbox/
├── frontend/                    # ← React приложение
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx/css
│   │   │   ├── ServiceOne.tsx/css
│   │   │   ├── ServiceTwo.tsx/css
│   │   │   ├── RedisDemo.tsx/css
│   │   │   └── KafkaDemo.tsx/css
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── App.css
│   ├── nginx.conf
│   ├── Dockerfile
│   ├── package.json
│   └── .dockerignore
├── api-gateway/
├── service-one/
├── service-two/
├── monitoring/
├── docker-compose.yml           # ← обновлён с фронтендом
├── Dockerfile                   # ← обновлён с мультистейдж
└── README.md
```

## 🎯 Быстрый старт

### 1. Создание React приложения (если ещё не создан)

```bash
# В корневой директории проекта
npx create-react-app frontend --template typescript
cd frontend

# Установка дополнительных зависимостей
npm install axios react-router-dom @types/react-router-dom
```

### 2. Замена файлов

Замени созданные файлы в папке `frontend/` на файлы из артефактов выше:
- `src/App.tsx`
- `src/App.css`
- `src/services/api.ts`
- `src/components/` (все компоненты и стили)
- `package.json`
- `.dockerignore`
- `nginx.conf`
- `Dockerfile`

### 3. Сборка и запуск

```bash
# В корневой директории проекта
export REBUILD_DATE=$(date +%Y%m%d%H%M%S)

# Сборка проекта
mvn clean package -DskipTests

# Запуск всей экосистемы
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 🌐 Доступные сервисы

| Сервис | URL | Описание |
|--------|-----|----------|
| **React Frontend** | http://localhost:3000 | Главный интерфейс |
| **API Gateway** | http://localhost:8000 | Единая точка входа для API |
| **Service One** | http://localhost:8080 | Основной бизнес-сервис |
| **Service Two** | http://localhost:8081 | Kafka consumer |
| **Grafana** | http://localhost:3001 | Мониторинг (admin/admin) |
| **Prometheus** | http://localhost:9090 | Метрики |
| **Kafka UI** | http://localhost:8090 | Управление Kafka |

## 🧪 Тестирование функциональности

### 1. Проверка фронтенда
```bash
# Открой браузер
open http://localhost:3000

# Проверь все разделы:
# - Дашборд (статус сервисов)
# - Service One (метрики, health)
# - Service Two (логи Kafka)
# - Redis (управление кешем)
# - Kafka (отправка сообщений)
```

### 2. Тестирование API через фронтенд

**Redis:**
- Добавь ключ-значение через интерфейс
- Попробуй операции инкремента/декремента
- Установи TTL для ключа

**Kafka:**
- Отправь сообщение через форму
- Посмотри обработку в Service Two
- Проверь Kafka UI

**Метрики:**
- Запусти тесты в Service One
- Проверь Grafana дашборды
- Посмотри Prometheus метрики

### 3. Проверка через curl

```bash
# Тест через API Gateway
curl http://localhost:3000/service-one/one/get
curl http://localhost:3000/service-two/two/get

# Прямое обращение к сервисам
curl http://localhost:8000/service-one/one/get
curl http://localhost:8080/one/get
```

## 🛠️ Разработка

### Локальная разработка фронтенда

```bash
# Запуск только инфраструктуры
docker-compose up -d postgres redis kafka zookeeper kafka-ui prometheus grafana

# Запуск бэкенд сервисов локально
cd service-one && mvn spring-boot:run &
cd service-two && mvn spring-boot:run &
cd api-gateway && mvn spring-boot:run &

# Запуск фронтенда в dev режиме
cd frontend
npm start  # Откроется на http://localhost:3000
```

### Пересборка отдельных сервисов

```bash
# Только фронтенд
docker-compose build frontend
docker-compose up -d frontend

# Только бэкенд сервисы
docker-compose build service-one service-two api-gateway
docker-compose up -d service-one service-two api-gateway
```

## 🐛 Troubleshooting

### Проблемы с CORS
Если фронтенд не может подключиться к API:
1. Проверь, что API Gateway запущен
2. Убедись, что nginx правильно проксирует запросы
3. Проверь логи: `docker-compose logs frontend`

### Проблемы с сборкой
```bash
# Очистка Docker кеша
docker system prune -a

# Принудительная пересборка
docker-compose build --no-cache

# Проверка логов сборки
docker-compose logs frontend
```

### Проблемы с зависимостями
```bash
# Переустановка зависимостей
cd frontend
rm -rf node_modules package-lock.json
npm install

# Проверка версий
node --version  # >= 16
npm --version   # >= 8
```

## 📊 Мониторинг

### Логи контейнеров
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f frontend
docker-compose logs -f service-one
```

### Метрики приложения
- **Grafana:** http://localhost:3001 (admin/admin)
- **Prometheus:** http://localhost:9090
- **Kafka UI:** http://localhost:8090

### Health Checks
```bash
# Через фронтенд API
curl http://localhost:3000/service-one/actuator/health
curl http://localhost:3000/service-two/two/get

# Напрямую
curl http://localhost:8080/actuator/health
curl http://localhost:8081/two/get
```

## 🚀 Production готовность

### Оптимизация
- [ ] Настройка environment variables
- [ ] SSL сертификаты для HTTPS
- [ ] Ограничение ресурсов контейнеров
- [ ] Настройка логирования
- [ ] Backup стратегия для данных

### Безопасность
- [ ] Смена дефолтных паролей
- [ ] Настройка firewall правил
- [ ] Ограничение доступа к внутренним портам
- [ ] Валидация входных данных

## 🎉 Поздравляем!

Ты успешно создал полнофункциональную микросервисную экосистему с:
- ✅ React фронтендом с TypeScript
- ✅ 3 микросервисами на Spring Boot
- ✅ API Gateway для маршрутизации
- ✅ PostgreSQL базой данных
- ✅ Redis кешем
- ✅ Apache Kafka для сообщений
- ✅ Prometheus + Grafana мониторингом
- ✅ Docker контейнеризацией
- ✅ Nginx для статики и проксирования

Система готова к разработке и тестированию! 🎯