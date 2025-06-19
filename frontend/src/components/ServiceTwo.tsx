import React, { useState, useEffect } from 'react';
import { serviceTwoApi, handleApiError } from '../services/api';
import './ServiceTwo.css';

interface LogMessage {
    id: number;
    timestamp: string;
    message: string;
    type: 'info' | 'warning' | 'error';
}

const ServiceTwo: React.FC = () => {
    const [serviceStatus, setServiceStatus] = useState<'checking' | 'online' | 'offline'>('checking');
    const [lastCheck, setLastCheck] = useState<Date | null>(null);
    const [response, setResponse] = useState<string>('');
    const [logs, setLogs] = useState<LogMessage[]>([
        {
            id: 1,
            timestamp: new Date().toISOString(),
            message: 'Service Two запущен и ожидает сообщения из Kafka',
            type: 'info'
        }
    ]);

    const checkServiceStatus = async () => {
        try {
            setServiceStatus('checking');
            const result = await serviceTwoApi.test();
            setServiceStatus('online');
            setResponse(result.data);
            setLastCheck(new Date());

            addLog('Проверка статуса успешна: ' + result.data, 'info');
        } catch (error) {
            setServiceStatus('offline');
            setResponse(handleApiError(error));
            setLastCheck(new Date());

            addLog('Ошибка проверки статуса: ' + handleApiError(error), 'error');
        }
    };

    const addLog = (message: string, type: LogMessage['type'] = 'info') => {
        const newLog: LogMessage = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            message,
            type
        };

        setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Храним последние 50 логов
    };

    const clearLogs = () => {
        setLogs([]);
    };

    const simulateKafkaMessage = () => {
        const messages = [
            'Получено сообщение из Kafka: "Hello from Service One!"',
            'Обработка JSON сообщения: {"action": "test", "data": "sample"}',
            'Получено сообщение от фронтенда: "Тестовое сообщение"',
            'Обработка длинного сообщения с множественными данными...',
            'Получено уведомление о системном событии'
        ];

        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        addLog(randomMessage, 'info');
    };

    const getStatusIcon = () => {
        switch (serviceStatus) {
            case 'online': return '🟢';
            case 'offline': return '🔴';
            case 'checking': return '🟡';
            default: return '❓';
        }
    };

    const getStatusText = () => {
        switch (serviceStatus) {
            case 'online': return 'Онлайн';
            case 'offline': return 'Оффлайн';
            case 'checking': return 'Проверка...';
            default: return 'Неизвестно';
        }
    };

    const getLogIcon = (type: LogMessage['type']) => {
        switch (type) {
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return '📝';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU');
    };

    useEffect(() => {
        checkServiceStatus();

        // Автопроверка каждые 30 секунд
        const interval = setInterval(checkServiceStatus, 30000);

        // Симуляция получения сообщений из Kafka каждые 10-30 секунд
        const kafkaSimulation = setInterval(() => {
            if (Math.random() < 0.3) { // 30% шанс получить "сообщение"
                simulateKafkaMessage();
            }
        }, 15000);

        return () => {
            clearInterval(interval);
            clearInterval(kafkaSimulation);
        };
    }, []);

    return (
        <div className="service-two">
            <div className="service-header">
                <h1>🔧 Service Two</h1>
                <p>Сервис-потребитель сообщений из Apache Kafka</p>
            </div>

            <div className="service-content">
                {/* Service Status */}
                <div className="service-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>📊 Статус сервиса</h2>
                            <button
                                onClick={checkServiceStatus}
                                disabled={serviceStatus === 'checking'}
                                className="btn-secondary"
                            >
                                {serviceStatus === 'checking' ? '⏳ Проверка...' : '🔄 Обновить'}
                            </button>
                        </div>

                        <div className="status-display">
                            <div className="status-main">
                                <span className="status-icon">{getStatusIcon()}</span>
                                <div className="status-info">
                  <span className="status-text">
                    Статус: <strong>{getStatusText()}</strong>
                  </span>
                                    <span className="status-response">
                    Ответ: <code>{response || 'Нет данных'}</code>
                  </span>
                                    <span className="status-time">
                    Последняя проверка: {lastCheck ? formatTimestamp(lastCheck.toISOString()) : 'Никогда'}
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kafka Consumer Info */}
                <div className="service-section">
                    <div className="section-card">
                        <h2>🔄 Kafka Consumer</h2>
                        <div className="kafka-info">
                            <div className="kafka-config">
                                <h4>Конфигурация:</h4>
                                <div className="config-item">
                                    <span className="config-label">Топик:</span>
                                    <span className="config-value">service-messages</span>
                                </div>
                                <div className="config-item">
                                    <span className="config-label">Consumer Group:</span>
                                    <span className="config-value">service-two-group</span>
                                </div>
                                <div className="config-item">
                                    <span className="config-label">Auto Offset Reset:</span>
                                    <span className="config-value">earliest</span>
                                </div>
                                <div className="config-item">
                                    <span className="config-label">Bootstrap Servers:</span>
                                    <span className="config-value">kafka:9092</span>
                                </div>
                            </div>

                            <div className="kafka-functionality">
                                <h4>Функциональность:</h4>
                                <ul>
                                    <li>Автоматическое получение сообщений из Kafka</li>
                                    <li>Логирование всех обработанных сообщений</li>
                                    <li>Обработка ошибок и восстановление подключения</li>
                                    <li>Мониторинг состояния consumer group</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs */}
                <div className="service-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>📋 Логи обработки сообщений</h2>
                            <div className="header-actions">
                                <button
                                    onClick={simulateKafkaMessage}
                                    className="btn-secondary"
                                >
                                    📥 Симулировать сообщение
                                </button>
                                <button
                                    onClick={clearLogs}
                                    disabled={logs.length === 0}
                                    className="btn-secondary"
                                >
                                    🗑️ Очистить логи
                                </button>
                            </div>
                        </div>

                        <div className="logs-container">
                            {logs.length === 0 ? (
                                <div className="no-logs">
                                    <p>Логи пусты</p>
                                    <p>Сообщения из Kafka будут отображаться здесь</p>
                                </div>
                            ) : (
                                <div className="logs-list">
                                    {logs.map((log) => (
                                        <div key={log.id} className={`log-item ${log.type}`}>
                                            <div className="log-header">
                                                <span className="log-icon">{getLogIcon(log.type)}</span>
                                                <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                                                <span className={`log-type ${log.type}`}>{log.type.toUpperCase()}</span>
                                            </div>
                                            <div className="log-message">{log.message}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* API Information */}
                <div className="service-section">
                    <div className="section-card">
                        <h2>🔗 API Эндпоинты</h2>
                        <div className="api-endpoints">
                            <div className="endpoint">
                                <span className="method get">GET</span>
                                <span className="path">/two/get</span>
                                <span className="description">Простой тест сервиса</span>
                            </div>
                        </div>

                        <div className="api-note">
                            <p><strong>Примечание:</strong> Service Two в основном работает как Kafka consumer и не предоставляет много внешних API. Основная функциональность заключается в обработке сообщений из очереди.</p>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="service-section">
                    <div className="section-card">
                        <h2>📖 Как использовать</h2>
                        <div className="instructions">
                            <div className="instruction-step">
                                <h4>1. Отправка сообщений</h4>
                                <p>Перейдите на страницу <strong>Kafka</strong> или <strong>Service One</strong> и отправьте сообщение в топик.</p>
                            </div>

                            <div className="instruction-step">
                                <h4>2. Мониторинг обработки</h4>
                                <p>Сообщения будут автоматически получены Service Two и отображены в логах выше.</p>
                            </div>

                            <div className="instruction-step">
                                <h4>3. Просмотр в Kafka UI</h4>
                                <p>Используйте <a href="http://localhost:8090" target="_blank" rel="noopener noreferrer">Kafka UI</a> для детального мониторинга топиков и consumer groups.</p>
                            </div>

                            <div className="instruction-step">
                                <h4>4. Логи Docker</h4>
                                <p>Для просмотра полных логов используйте: <code>docker-compose logs -f service-two</code></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceTwo;