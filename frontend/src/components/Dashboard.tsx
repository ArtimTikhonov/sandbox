/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {useState, useEffect} from 'react';
import {serviceOneApi, serviceTwoApi, handleApiError} from '../services/api';
import './Dashboard.css';

export interface DashboardProps {
}

interface ServiceStatus {
    name: string;
    status: 'online' | 'offline' | 'checking';
    response?: string;
    lastCheck?: Date;
    responseTime?: number;
}

interface SystemStats {
    totalServices: number;
    onlineServices: number;
    offlineServices: number;
    uptime: string;
}

const Dashboard: React.FC<DashboardProps> = () => {
    const [services, setServices] = useState<ServiceStatus[]>([
        {name: 'Service One', status: 'checking'},
        {name: 'Service Two', status: 'checking'},
        {name: 'API Gateway', status: 'checking'},
    ]);

    const [stats, setStats] = useState<SystemStats>({
        totalServices: 3,
        onlineServices: 0,
        offlineServices: 0,
        uptime: '0m',
    });

    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

    const checkServiceStatus = async (serviceName: string, checkFunction: any) => {
        const startTime = Date.now();

        try {
            const response = await checkFunction();
            const responseTime = Date.now() - startTime;

            setServices(prev => prev.map(service =>
                service.name === serviceName
                    ? {
                        ...service,
                        status: 'online' as const,
                        response: typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
                        lastCheck: new Date(),
                        responseTime
                    }
                    : service
            ));
        } catch (error) {
            setServices(prev => prev.map(service =>
                service.name === serviceName
                    ? {
                        ...service,
                        status: 'offline' as const,
                        response: handleApiError(error),
                        lastCheck: new Date(),
                        responseTime: Date.now() - startTime
                    }
                    : service
            ));
        }
    };

    const checkAllServices = async () => {
        // Устанавливаем статус "checking" для всех сервисов
        setServices(prev => prev.map(service => ({...service, status: 'checking' as const})));
        setLastRefresh(new Date());

        // Проверяем все сервисы параллельно
        await Promise.all([
            checkServiceStatus('Service One', serviceOneApi.test),
            checkServiceStatus('Service Two', serviceTwoApi.test),
            checkServiceStatus('API Gateway', () =>
                fetch('http://localhost:8000/service-one/one/get').then(r => ({data: r.ok ? 'OK' : 'Error'}))
            ),
        ]);
    };

    // Обновляем статистику при изменении сервисов
    useEffect(() => {
        const online = services.filter(s => s.status === 'online').length;
        const offline = services.filter(s => s.status === 'offline').length;

        setStats(prev => ({
            ...prev,
            onlineServices: online,
            offlineServices: offline,
        }));
    }, [services]);

    // Автоматическое обновление
    useEffect(() => {
        checkAllServices();

        if (autoRefresh) {
            const interval = setInterval(checkAllServices, 30000); // каждые 30 секунд
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    // Uptime таймер
    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const uptime = Math.floor((Date.now() - startTime) / 60000);
            setStats(prev => ({...prev, uptime: `${uptime}m`}));
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: ServiceStatus['status']) => {
        switch (status) {
            case 'online':
                return '🟢';
            case 'offline':
                return '🔴';
            case 'checking':
                return '🟡';
            default:
                return '❓';
        }
    };

    const formatLastCheck = (date?: Date) => {
        if (!date) return 'Никогда';
        return date.toLocaleTimeString('ru-RU');
    };

    const getSystemHealthColor = () => {
        const percentage = (stats.onlineServices / stats.totalServices) * 100;
        if (percentage === 100) return '#27ae60';
        if (percentage >= 66) return '#f39c12';
        return '#e74c3c';
    };

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>🏗️ Дашборд Микросервисов</h1>
                <p>Мониторинг состояния всех сервисов экосистемы</p>
                <div className="dashboard-controls">
                    <button onClick={checkAllServices} className="btn-primary">
                        🔄 Обновить все
                    </button>
                    <label className="auto-refresh-toggle">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        Автообновление (30с)
                    </label>
                </div>
            </div>

            <div className="dashboard-grid">
                {/* Общая статистика */}
                <div className="stats-section">
                    <div className="stat-card main-stats">
                        <h3>📊 Общая статистика</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <span className="stat-value">{stats.totalServices}</span>
                                <span className="stat-label">Всего сервисов</span>
                            </div>
                            <div className="stat-item">
                <span className="stat-value" style={{color: '#27ae60'}}>
                  {stats.onlineServices}
                </span>
                                <span className="stat-label">Онлайн</span>
                            </div>
                            <div className="stat-item">
                <span className="stat-value" style={{color: '#e74c3c'}}>
                  {stats.offlineServices}
                </span>
                                <span className="stat-label">Оффлайн</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{stats.uptime}</span>
                                <span className="stat-label">Uptime</span>
                            </div>
                        </div>
                        <div className="system-health">
                            <span>Здоровье системы:</span>
                            <div className="health-bar">
                                <div
                                    className="health-fill"
                                    style={{
                                        width: `${(stats.onlineServices / stats.totalServices) * 100}%`,
                                        backgroundColor: getSystemHealthColor()
                                    }}
                                ></div>
                            </div>
                            <span>{Math.round((stats.onlineServices / stats.totalServices) * 100)}%</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <h3>🔗 Быстрые ссылки</h3>
                        <div className="quick-links">
                            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
                                📊 Grafana
                            </a>
                            <a href="http://localhost:9090" target="_blank" rel="noopener noreferrer">
                                📈 Prometheus
                            </a>
                            <a href="http://localhost:8090" target="_blank" rel="noopener noreferrer">
                                🔄 Kafka UI
                            </a>
                            <a href="http://localhost:5601" target="_blank" rel="noopener noreferrer">
                                🔍 Kibana (ELK)
                            </a>
                            <a href="http://localhost:8080/actuator" target="_blank" rel="noopener noreferrer">
                                ⚙️ Actuator
                            </a>
                        </div>
                    </div>
                </div>

                {/* Статус сервисов */}
                <div className="services-section">
                    <div className="section-header">
                        <h2>🔧 Статус Сервисов</h2>
                        <div className="last-refresh">
                            Последнее обновление: {formatLastCheck(lastRefresh)}
                        </div>
                    </div>

                    <div className="services-grid">
                        {services.map((service) => (
                            <div key={service.name} className={`service-card ${service.status}`}>
                                <div className="service-header">
                                    <span className="service-icon">{getStatusIcon(service.status)}</span>
                                    <h3>{service.name}</h3>
                                    {service.responseTime && (
                                        <span className="response-time">{service.responseTime}ms</span>
                                    )}
                                </div>

                                <div className="service-details">
                                    <div className="service-status">
                                        <span>Статус:</span>
                                        <span className={`status-badge ${service.status}`}>
                      {service.status === 'online' ? 'Онлайн' :
                          service.status === 'offline' ? 'Оффлайн' : 'Проверка...'}
                    </span>
                                    </div>

                                    <div className="service-last-check">
                                        <span>Последняя проверка:</span>
                                        <span>{formatLastCheck(service.lastCheck)}</span>
                                    </div>

                                    {service.response && (
                                        <div className="service-response">
                                            <span>Ответ:</span>
                                            <code>{service.response.length > 50
                                                ? service.response.substring(0, 50) + '...'
                                                : service.response}
                                            </code>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Архитектура системы */}
            <div className="architecture-section">
                <h2>🏗️ Архитектура Системы</h2>
                <div className="architecture-diagram">
                    <div className="arch-layer">
                        <div className="arch-node frontend">
                            <span>Frontend</span>
                            <small>React + nginx</small>
                        </div>
                    </div>
                    <div className="connection-line"></div>
                    <div className="arch-layer">
                        <div className="arch-node gateway">
                            <span>API Gateway</span>
                            <small>Spring Cloud Gateway</small>
                        </div>
                    </div>
                    <div className="connection-line"></div>
                    <div className="arch-layer">
                        <div className="arch-node service">
                            <span>Service One</span>
                            <small>Business Logic</small>
                        </div>
                        <div className="arch-node service">
                            <span>Service Two</span>
                            <small>Kafka Consumer</small>
                        </div>
                    </div>
                    <div className="connection-line"></div>
                    <div className="arch-layer">
                        <div className="arch-node db">
                            <span>PostgreSQL</span>
                            <small>Main Database</small>
                        </div>
                        <div className="arch-node cache">
                            <span>Redis</span>
                            <small>Cache & Sessions</small>
                        </div>
                        <div className="arch-node queue">
                            <span>Kafka</span>
                            <small>Message Queue</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Системная информация */}
            <div className="system-info">
                <div className="info-grid">
                    <div className="info-card">
                        <h4>🔧 Технологии</h4>
                        <ul>
                            <li>Frontend: React 18 + TypeScript</li>
                            <li>Backend: Spring Boot 3.4.5</li>
                            <li>Database: PostgreSQL 16</li>
                            <li>Cache: Redis 7</li>
                            <li>Queue: Apache Kafka</li>
                            <li>Monitoring: Prometheus + Grafana</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h4>📊 Возможности</h4>
                        <ul>
                            <li>✅ Автоматический мониторинг</li>
                            <li>✅ Управление кешем Redis</li>
                            <li>✅ Отправка сообщений Kafka</li>
                            <li>✅ Метрики и логирование</li>
                            <li>✅ Health checks</li>
                            <li>✅ Масштабируемая архитектура</li>
                        </ul>
                    </div>

                    <div className="info-card">
                        <h4>🚀 Начать работу</h4>
                        <p>Используйте навигацию для доступа к различным компонентам системы:</p>
                        <ul>
                            <li><strong>Service One</strong> - основной сервис и метрики</li>
                            <li><strong>Service Two</strong> - Kafka consumer и логи</li>
                            <li><strong>Redis</strong> - управление кешем</li>
                            <li><strong>Kafka</strong> - отправка сообщений</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;