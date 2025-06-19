import React, { useState, useEffect } from 'react';
import { serviceOneApi, handleApiError, HealthStatus } from '../services/api';
import './ServiceOne.css';

interface MetricTest {
    name: string;
    description: string;
    action: () => Promise<any>;
    loading: boolean;
    result?: string;
    error?: string;
}

const ServiceOne: React.FC = () => {
    const [health, setHealth] = useState<HealthStatus | null>(null);
    const [healthLoading, setHealthLoading] = useState<boolean>(false);
    const [metrics, setMetrics] = useState<MetricTest[]>([
        {
            name: 'Тестовый эндпоинт',
            description: 'Тестирует базовую функциональность с метриками времени выполнения',
            action: serviceOneApi.testMetrics,
            loading: false,
        },
        {
            name: 'Инкремент счётчика',
            description: 'Увеличивает кастомный счётчик API вызовов',
            action: serviceOneApi.incrementCounter,
            loading: false,
        },
        {
            name: 'Симуляция ошибки',
            description: 'Генерирует случайную ошибку для тестирования метрик ошибок',
            action: serviceOneApi.simulateError,
            loading: false,
        },
        {
            name: 'Длительная операция',
            description: 'Выполняет операцию длительностью 2-5 секунд',
            action: serviceOneApi.longOperation,
            loading: false,
        },
        {
            name: 'Симуляция БД запроса',
            description: 'Имитирует запрос к базе данных с метриками времени',
            action: serviceOneApi.databaseSimulation,
            loading: false,
        },
    ]);

    const [gaugeValue, setGaugeValue] = useState<number>(50);

    const loadHealth = async () => {
        try {
            setHealthLoading(true);
            const response = await serviceOneApi.health();
            setHealth(response.data);
        } catch (error) {
            console.error('Health check failed:', error);
        } finally {
            setHealthLoading(false);
        }
    };

    const executeMetricTest = async (index: number) => {
        const updatedMetrics = [...metrics];
        updatedMetrics[index].loading = true;
        updatedMetrics[index].result = undefined;
        updatedMetrics[index].error = undefined;
        setMetrics(updatedMetrics);

        try {
            const response = await metrics[index].action();
            updatedMetrics[index].result = typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);
        } catch (error) {
            updatedMetrics[index].error = handleApiError(error);
        } finally {
            updatedMetrics[index].loading = false;
            setMetrics(updatedMetrics);
        }
    };

    const setGaugeMetric = async () => {
        try {
            const response = await serviceOneApi.setGauge(gaugeValue);
            console.log('Gauge updated:', response.data);
        } catch (error) {
            console.error('Failed to set gauge:', error);
        }
    };

    const executeAllTests = async () => {
        for (let i = 0; i < metrics.length; i++) {
            await executeMetricTest(i);
            // Небольшая задержка между тестами
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    useEffect(() => {
        loadHealth();
    }, []);

    const getHealthStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'up': return '#27ae60';
            case 'down': return '#e74c3c';
            default: return '#f39c12';
        }
    };

    return (
        <div className="service-one">
            <div className="service-header">
                <h1>🔧 Service One</h1>
                <p>Основной бизнес-сервис с метриками, БД и кешем</p>
            </div>

            <div className="service-content">
                {/* Health Status */}
                <div className="service-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>💚 Статус здоровья</h2>
                            <button
                                onClick={loadHealth}
                                disabled={healthLoading}
                                className="btn-secondary"
                            >
                                {healthLoading ? '⏳ Проверка...' : '🔄 Обновить'}
                            </button>
                        </div>

                        {health ? (
                            <div className="health-status">
                                <div className="health-overall">
                  <span
                      className="health-indicator"
                      style={{ backgroundColor: getHealthStatusColor(health.status) }}
                  ></span>
                                    <span className="health-text">
                    Общий статус: <strong>{health.status.toUpperCase()}</strong>
                  </span>
                                </div>

                                <div className="health-components">
                                    <h4>Компоненты:</h4>
                                    {Object.entries(health.components).map(([componentName, component]) => (
                                        <div key={componentName} className="health-component">
                      <span
                          className="component-indicator"
                          style={{ backgroundColor: getHealthStatusColor(component.status) }}
                      ></span>
                                            <span className="component-name">{componentName}</span>
                                            <span className="component-status">{component.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="no-health">Данные о здоровье недоступны</p>
                        )}
                    </div>
                </div>

                {/* Metrics Testing */}
                <div className="service-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>📊 Тестирование метрик</h2>
                            <button
                                onClick={executeAllTests}
                                disabled={metrics.some(m => m.loading)}
                                className="btn-primary"
                            >
                                🚀 Запустить все тесты
                            </button>
                        </div>

                        <div className="metrics-grid">
                            {metrics.map((metric, index) => (
                                <div key={index} className="metric-card">
                                    <div className="metric-header">
                                        <h3>{metric.name}</h3>
                                        <button
                                            onClick={() => executeMetricTest(index)}
                                            disabled={metric.loading}
                                            className="btn-secondary btn-small"
                                        >
                                            {metric.loading ? '⏳' : '▶️'}
                                        </button>
                                    </div>

                                    <p className="metric-description">{metric.description}</p>

                                    {metric.result && (
                                        <div className="metric-result success">
                                            <strong>Результат:</strong>
                                            <code>{metric.result}</code>
                                        </div>
                                    )}

                                    {metric.error && (
                                        <div className="metric-result error">
                                            <strong>Ошибка:</strong>
                                            <span>{metric.error}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Gauge Control */}
                <div className="service-section">
                    <div className="section-card">
                        <h2>🎚️ Управление Gauge метрикой</h2>
                        <div className="gauge-control">
                            <label>Значение активных подключений:</label>
                            <div className="gauge-input">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={gaugeValue}
                                    onChange={(e) => setGaugeValue(Number(e.target.value))}
                                    className="gauge-slider"
                                />
                                <span className="gauge-value">{gaugeValue}</span>
                                <button
                                    onClick={setGaugeMetric}
                                    className="btn-primary"
                                >
                                    Установить
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Information */}
                <div className="service-section">
                    <div className="section-card">
                        <h2>🔗 API Эндпоинты</h2>
                        <div className="api-endpoints">
                            <div className="endpoint-group">
                                <h4>Основные:</h4>
                                <div className="endpoint">
                                    <span className="method get">GET</span>
                                    <span className="path">/one/get</span>
                                    <span className="description">Простой тест</span>
                                </div>
                            </div>

                            <div className="endpoint-group">
                                <h4>Метрики:</h4>
                                <div className="endpoint">
                                    <span className="method get">GET</span>
                                    <span className="path">/metrics/test</span>
                                    <span className="description">Тестовый эндпоинт с метриками</span>
                                </div>
                                <div className="endpoint">
                                    <span className="method post">POST</span>
                                    <span className="path">/metrics/increment-counter</span>
                                    <span className="description">Инкремент счетчика</span>
                                </div>
                                <div className="endpoint">
                                    <span className="method post">POST</span>
                                    <span className="path">/metrics/set-gauge/{`{value}`}</span>
                                    <span className="description">Установить gauge значение</span>
                                </div>
                            </div>

                            <div className="endpoint-group">
                                <h4>Redis:</h4>
                                <div className="endpoint">
                                    <span className="method post">POST</span>
                                    <span className="path">/redis/set/{`{key}`}</span>
                                    <span className="description">Установить значение</span>
                                </div>
                                <div className="endpoint">
                                    <span className="method get">GET</span>
                                    <span className="path">/redis/get/{`{key}`}</span>
                                    <span className="description">Получить значение</span>
                                </div>
                                <div className="endpoint">
                                    <span className="method get">GET</span>
                                    <span className="path">/redis/keys</span>
                                    <span className="description">Все ключи</span>
                                </div>
                            </div>

                            <div className="endpoint-group">
                                <h4>Kafka:</h4>
                                <div className="endpoint">
                                    <span className="method post">POST</span>
                                    <span className="path">/api/messages</span>
                                    <span className="description">Отправить сообщение</span>
                                </div>
                            </div>

                            <div className="endpoint-group">
                                <h4>Actuator:</h4>
                                <div className="endpoint">
                                    <span className="method get">GET</span>
                                    <span className="path">/actuator/health</span>
                                    <span className="description">Статус здоровья</span>
                                </div>
                                <div className="endpoint">
                                    <span className="method get">GET</span>
                                    <span className="path">/actuator/prometheus</span>
                                    <span className="description">Метрики Prometheus</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="service-section">
                    <div className="section-card">
                        <h2>🔗 Быстрые ссылки</h2>
                        <div className="quick-links">
                            <a
                                href="http://localhost:8080/actuator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                ⚙️ Spring Boot Actuator
                            </a>
                            <a
                                href="http://localhost:8080/actuator/health"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                💚 Health Check
                            </a>
                            <a
                                href="http://localhost:8080/actuator/prometheus"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                📊 Prometheus Metrics
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceOne;