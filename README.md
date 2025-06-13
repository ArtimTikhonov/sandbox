# 🏗️ Песочница микросервисов (Microservices Sandbox)

Полнофункциональная экосистема микросервисов на базе Spring Boot с полным стеком инфраструктуры для разработки и мониторинга.

## 📋 Содержание

- [Архитектура системы](#-архитектура-системы)
- [Компоненты проекта](#-компоненты-проекта)
- [Быстрый старт](#-быстрый-старт)
- [API документация](#-api-документация)
- [Мониторинг и метрики](#-мониторинг-и-метрики)
- [Структура проекта](#-структура-проекта)
- [Разработка](#-разработка)

## 🏗️ Архитектура системы

```
                    ┌─────────────────┐
                    │   API Gateway   │
                    │    (Port 8000)  │
                    └─────────┬───────┘
                              │
                    ┌─────────┴───────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼────────┐
            │ Service One  │  │ Service Two   │
            │ (Port 8080)  │  │ (Port 8081)   │
            └──────┬───────┘  └───────┬───────┘
                   │                  │
    ┌──────────────┼──────────────────┼──────────────┐
    │              │                  │              │
┌───▼───┐ ┌───────▼────┐ ┌───────────▼─┐ ┌─────────▼──┐
│ Redis │ │PostgreSQL  │ │    Kafka    │ │Prometheus  │
│:6379  │ │   :5432    │ │   :9092     │ │   :9090    │
└───────┘ └────────────┘ └─────────────┘ └────────────┘
```

## 🛠️ Компоненты проекта

### Микросервисы

| Сервис | Порт | Описание | Технологии |
|--------|------|----------|------------|
| **API Gateway** | 8000 | Единая точка входа, маршрутизация запросов | Spring Cloud Gateway |
| **Service One** | 8080 | Основной бизнес-сервис с БД и кешем | Spring Boot, JPA, Redis |
| **Service Two** | 8081 | Сервис-потребитель сообщений | Spring Boot, Kafka Consumer |

### Инфраструктура

| Компонент | Порт | Описание |
|-----------|------|----------|
| **PostgreSQL** | 5432 | Основная база данных |
| **Redis** | 6379 | Кеш и сессии |
| **Kafka** | 9092 | Очередь сообщений |
| **Kafka UI** | 8090 | Веб-интерфейс для Kafka |
| **Prometheus** | 9090 | Сбор метрик |
| **Grafana** | 3000 | Визуализация метрик |
| **Zookeeper** | 2181 | Координатор для Kafka |

## 🚀 Быстрый старт

### Предварительные требования

- Java 24+
- Docker и Docker Compose
- Maven 3.9+

### Запуск проекта

1. **Клонирование и переход в директорию:**
```bash
git clone <repository-url>
cd sandbox
```

2. **Сборка проекта:**
```bash
mvn clean package -DskipTests
```

3. **Запуск всей инфраструктуры:**
```bash
# Принудительная пересборка (если нужно)
export REBUILD_DATE=$(date +%Y%m%d%H%M%S)

# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f
```

4. **Проверка работоспособности:**
```bash
# API Gateway
curl http://localhost:8000/service-one/one/get

# Service One напрямую
curl http://localhost:8080/one/get

# Service Two напрямую
curl http://localhost:8081/two/get
```

### Остановка проекта

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

## 📚 API документация

### API Gateway (порт 8000)

Все запросы проходят через API Gateway с префиксами:

- `/service-one/**` → перенаправляется на Service One
- `/service-two/**` → перенаправляется на Service Two

### Service One API

**Основные эндпоинты:**
```http
GET /one/get                    # Простой тест
POST /api/messages              # Отправка сообщения в Kafka
```

**Redis API:**
```http
POST /redis/set/{key}           # Установить значение
GET /redis/get/{key}            # Получить значение
POST /redis/set/{key}/ttl/{sec} # Установить с TTL
DELETE /redis/delete/{key}      # Удалить ключ
GET /redis/keys                 # Все ключи
POST /redis/increment/{key}     # Инкремент
```

**Метрики API:**
```http
GET /metrics/test               # Тестовый эндпоинт с метриками
POST /metrics/increment-counter # Инкремент счетчика
GET /metrics/simulate-error     # Симуляция ошибок
GET /metrics/long-operation     # Длительная операция
GET /metrics/database-simulation # Симуляция БД запроса
```

### Service Two API

```http
GET /two/get                    # Простой тест
```

### Примеры использования

**Отправка сообщения через API Gateway:**
```bash
curl -X POST http://localhost:8000/service-one/api/messages \
  -H "Content-Type: application/json" \
  -d "Привет из API Gateway!"
```

**Работа с Redis:**
```bash
# Установить значение
curl -X POST http://localhost:8080/redis/set/test-key \
  -H "Content-Type: application/json" \
  -d "Тестовое значение"

# Получить значение
curl http://localhost:8080/redis/get/test-key

# Установить с TTL (60 секунд)
curl -X POST http://localhost:8080/redis/set/temp-key/ttl/60 \
  -H "Content-Type: application/json" \
  -d "Временное значение"
```

## 📊 Мониторинг и метрики

### Grafana Dashboard
- **URL:** http://localhost:3000
- **Логин:** admin
- **Пароль:** admin

**Доступные дашборды:**
- Spring Boot Service Dashboard
- Custom метрики приложений
- JVM метрики

### Prometheus
- **URL:** http://localhost:9090
- Автоматический сбор метрик с всех сервисов
- Кастомные метрики приложений

### Kafka UI
- **URL:** http://localhost:8090
- Просмотр топиков, партиций, сообщений
- Мониторинг consumer groups

### Health Checks

**Service One:**
```bash
curl http://localhost:8080/actuator/health
curl http://localhost:8080/actuator/metrics
curl http://localhost:8080/actuator/prometheus
```

**API Gateway:**
```bash
curl http://localhost:8000/actuator/health
```

## 📁 Структура проекта

```
sandbox/
├── api-gateway/                    # API Gateway модуль
│   ├── src/main/java/
│   │   └── com/example/api_gateway/
│   │       ├── config/
│   │       │   └── GatewayConfig.java    # Конфигурация маршрутов
│   │       └── ApiGatewayApplication.java
│   └── src/main/resources/
│       └── application.yaml             # Настройки Gateway
├── service-one/                         # Основной сервис
│   ├── src/main/java/
│   │   └── com/example/service/one/
│   │       ├── config/                  # Конфигурации
│   │       ├── controller/              # REST контроллеры
│   │       ├── service/                 # Бизнес логика
│   │       └── ServiceOneApplication.java
│   └── src/main/resources/
│       ├── application.yaml             # Настройки приложения
│       └── db/migration/                # Flyway миграции
│           └── V1__unit_schema.sql      # Начальная схема БД
├── service-two/                         # Потребитель сообщений
│   ├── src/main/java/
│   │   └── com/example/service/two/
│   │       ├── config/                  # Kafka конфигурация
│   │       ├── controller/              # REST контроллеры
│   │       ├── listener/                # Kafka listeners
│   │       └── ServiceTwoApplication.java
│   └── src/main/resources/
│       └── application.yaml
├── monitoring/                          # Конфигурации мониторинга
│   ├── grafana/
│   │   ├── dashboards/                  # Готовые дашборды
│   │   └── provisioning/                # Автоматическая настройка
│   └── prometheus/
│       └── prometheus.yml               # Конфигурация Prometheus
├── docker-compose.yml                   # Оркестрация всех сервисов
├── Dockerfile                          # Мультистейдж сборка
└── pom.xml                             # Родительский Maven POM
```

## 🔧 Разработка

### Локальная разработка

**Запуск только инфраструктуры:**
```bash
# Запуск только БД, Redis, Kafka
docker-compose up -d postgres redis kafka zookeeper kafka-ui prometheus grafana
```

**Запуск сервисов в IDE:**
```bash
# Service One
cd service-one
mvn spring-boot:run

# Service Two  
cd service-two
mvn spring-boot:run

# API Gateway
cd api-gateway
mvn spring-boot:run
```

### Настройка профилей

**Профили Spring:**
- `default` - для локальной разработки
- `docker` - для контейнеризованного окружения

### База данных

**Подключение к PostgreSQL:**
```bash
docker exec -it postgres psql -U postgres -d sandbox
```

**Flyway миграции:**
- Автоматически применяются при старте Service One
- Находятся в `service-one/src/main/resources/db/migration/`

### Тестирование Kafka

**Отправка сообщения:**
```bash
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -d "Тестовое сообщение для Kafka"
```

**Проверка логов Service Two:**
```bash
docker-compose logs -f service-two
```

### Метрики и мониторинг

**Кастомные метрики в Service One:**
- `custom.api.calls` - счетчик вызовов API
- `custom.active.connections` - gauge активных подключений
- `custom.api.test.time` - время выполнения тестовых запросов
- `custom.database.query.time` - время выполнения БД запросов

**Добавление новых метрик:**
```java
@Autowired
private MeterRegistry meterRegistry;

// Счетчик
Counter.builder("my.custom.counter")
    .description("Описание счетчика")
    .tag("service", "my-service")
    .register(meterRegistry);

// Gauge
Gauge.builder("my.custom.gauge", atomicValue, AtomicInteger::get)
    .register(meterRegistry);
```

### Полезные команды

```bash
# Пересборка конкретного сервиса
docker-compose build service-one

# Просмотр логов конкретного сервиса
docker-compose logs -f api-gateway

# Масштабирование сервиса
docker-compose up -d --scale service-one=2

# Очистка неиспользуемых ресурсов Docker
docker system prune -a

# Проверка статуса всех контейнеров
docker-compose ps
```

---

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License.

## 🆘 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [Issues](../../issues) - возможно, ответ уже есть
2. Создайте новый Issue с подробным описанием проблемы
3. Включите логи сервисов: `docker-compose logs > logs.txt`

**Проверка работоспособности системы:**
```bash
# Проверка всех сервисов одной командой
curl -s http://localhost:8000/service-one/one/get && echo " ✅ API Gateway -> Service One" || echo " ❌ API Gateway -> Service One"
curl -s http://localhost:8000/service-two/two/get && echo " ✅ API Gateway -> Service Two" || echo " ❌ API Gateway -> Service Two"
curl -s http://localhost:3000/api/health && echo " ✅ Grafana" || echo " ❌ Grafana"
curl -s http://localhost:9090/-/healthy && echo " ✅ Prometheus" || echo " ❌ Prometheus"
```