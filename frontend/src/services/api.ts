import axios from 'axios';

// Создаём базовый экземпляр axios
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Интерсептор для логирования запросов
api.interceptors.request.use(
    (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Интерсептор для обработки ответов
api.interceptors.response.use(
    (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error('❌ Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// =============================================================================
// SERVICE ONE API
// =============================================================================

export const serviceOneApi = {
    // Простой тест
    test: () => api.get('/service-one/one/get'),

    // Метрики
    testMetrics: () => api.get('/service-one/metrics/test'),
    incrementCounter: () => api.post('/service-one/metrics/increment-counter'),
    simulateError: () => api.get('/service-one/metrics/simulate-error'),
    longOperation: () => api.get('/service-one/metrics/long-operation'),
    databaseSimulation: () => api.get('/service-one/metrics/database-simulation'),
    setGauge: (value: number) => api.post(`/service-one/metrics/set-gauge/${value}`),

    // Health check
    health: () => api.get('/service-one/actuator/health'),
    metrics: () => api.get('/service-one/actuator/metrics'),
    prometheus: () => api.get('/service-one/actuator/prometheus'),

    // Actuator endpoints
    info: () => api.get('/service-one/actuator/info'),
    env: () => api.get('/service-one/actuator/env'),
};

// =============================================================================
// SERVICE TWO API
// =============================================================================

export const serviceTwoApi = {
    test: () => api.get('/service-two/two/get'),

    // Health check (если добавить Actuator в Service Two)
    health: () => api.get('/service-two/actuator/health').catch(() => ({ data: { status: 'Unknown' } })),
};

// =============================================================================
// REDIS API
// =============================================================================

export const redisApi = {
    setValue: (key: string, value: string) =>
        api.post(`/service-one/redis/set/${key}`, value),

    setValueWithTTL: (key: string, value: string, seconds: number) =>
        api.post(`/service-one/redis/set/${key}/ttl/${seconds}`, value),

    getValue: (key: string) =>
        api.get(`/service-one/redis/get/${key}`),

    deleteKey: (key: string) =>
        api.delete(`/service-one/redis/delete/${key}`),

    getAllKeys: () =>
        api.get('/service-one/redis/keys'),

    hasKey: (key: string) =>
        api.get(`/service-one/redis/exists/${key}`),

    increment: (key: string, delta?: number) =>
        delta ? api.post(`/service-one/redis/increment/${key}/${delta}`)
            : api.post(`/service-one/redis/increment/${key}`),

    decrement: (key: string, delta?: number) =>
        delta ? api.post(`/service-one/redis/decrement/${key}/${delta}`)
            : api.post(`/service-one/redis/decrement/${key}`),

    setExpire: (key: string, seconds: number) =>
        api.put(`/service-one/redis/expire/${key}/${seconds}`),

    getTTL: (key: string) =>
        api.get(`/service-one/redis/ttl/${key}`),
};

// =============================================================================
// KAFKA API
// =============================================================================

export const kafkaApi = {
    sendMessage: (message: string) =>
        api.post('/service-one/api/messages', message),
};

// =============================================================================
// API GATEWAY API
// =============================================================================

export const gatewayApi = {
    // Проверка доступности через разные пути
    testDirect: () => api.get('/service-one/one/get'),
    testServiceTwo: () => api.get('/service-two/two/get'),

    // Health check API Gateway (если добавить)
    health: () => api.get('/actuator/health').catch(() => ({ data: { status: 'Unknown' } })),
};

// =============================================================================
// SYSTEM API - для мониторинга всей системы
// =============================================================================

export const systemApi = {
    // Проверка всех сервисов одновременно
    checkAllServices: async () => {
        const results = await Promise.allSettled([
            serviceOneApi.test(),
            serviceTwoApi.test(),
            gatewayApi.health(),
        ]);

        return results.map((result, index) => ({
            service: ['Service One', 'Service Two', 'API Gateway'][index],
            status: result.status === 'fulfilled' ? 'online' : 'offline',
            data: result.status === 'fulfilled' ? result.value.data : result.reason.message,
        }));
    },

    // Получить сводную статистику
    getSystemStats: async () => {
        try {
            const services = await systemApi.checkAllServices();
            const online = services.filter(s => s.status === 'online').length;
            const total = services.length;

            return {
                totalServices: total,
                onlineServices: online,
                offlineServices: total - online,
                healthPercentage: Math.round((online / total) * 100),
                services,
            };
        } catch (error) {
            return {
                totalServices: 3,
                onlineServices: 0,
                offlineServices: 3,
                healthPercentage: 0,
                services: [],
            };
        }
    },
};

// =============================================================================
// ТИПЫ ДАННЫХ
// =============================================================================

export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
}

export interface HealthStatus {
    status: string;
    components: {
        [key: string]: {
            status: string;
            details?: any;
        };
    };
}

export interface RedisKey {
    key: string;
    value?: string;
    ttl?: number;
}

export interface ServiceStatus {
    name: string;
    status: 'online' | 'offline' | 'checking';
    response?: string;
    lastCheck?: Date;
    responseTime?: number;
}

export interface SystemStats {
    totalServices: number;
    onlineServices: number;
    offlineServices: number;
    healthPercentage: number;
    services: Array<{
        service: string;
        status: string;
        data: any;
    }>;
}

// =============================================================================
// УТИЛИТЫ
// =============================================================================

export const handleApiError = (error: any): string => {
    if (error.response) {
        // Сервер ответил с кодом ошибки
        const status = error.response.status;
        const message = error.response.data?.message || error.response.statusText;
        return `Ошибка ${status}: ${message}`;
    } else if (error.request) {
        // Запрос был отправлен, но ответа не получено
        return 'Ошибка сети: сервер не отвечает';
    } else {
        // Ошибка при настройке запроса
        return `Ошибка запроса: ${error.message}`;
    }
};

// Утилита для измерения времени ответа
export const measureResponseTime = async <T>(
    apiCall: () => Promise<T>
): Promise<{ data: T; responseTime: number }> => {
    const startTime = Date.now();
    try {
        const data = await apiCall();
        const responseTime = Date.now() - startTime;
        return { data, responseTime };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        throw { error, responseTime };
    }
};

// Утилита для ретраев
export const retryApiCall = async <T>(
    apiCall: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> => {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await apiCall();
        } catch (error) {
            lastError = error;
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
            }
        }
    }

    throw lastError;
};

// Проверка доступности сервиса
export const pingService = async (serviceName: string): Promise<boolean> => {
    try {
        switch (serviceName.toLowerCase()) {
            case 'service-one':
                await serviceOneApi.test();
                return true;
            case 'service-two':
                await serviceTwoApi.test();
                return true;
            case 'api-gateway':
                await gatewayApi.health();
                return true;
            default:
                return false;
        }
    } catch {
        return false;
    }
};

export default api;