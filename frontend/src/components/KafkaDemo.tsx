import React, { useState } from 'react';
import { kafkaApi, handleApiError } from '../services/api';
import './KafkaDemo.css';

interface Message {
    id: number;
    content: string;
    timestamp: Date;
    status: 'sending' | 'sent' | 'error';
    error?: string;
}

const KafkaDemo: React.FC = () => {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const predefinedMessages = [
        'Привет от фронтенда! 👋',
        'Тестовое сообщение для Kafka',
        'Сообщение с временной меткой: ' + new Date().toLocaleString('ru-RU'),
        'JSON данные: {"user": "frontend", "action": "test"}',
        'Многострочное\nсообщение\nс переносами строк',
        'Эмодзи тест: 🚀 🎉 ✅ ❌ 🔔',
        'Длинное сообщение для тестирования обработки больших текстов в Kafka. Это сообщение содержит много слов и может помочь проверить, как система обрабатывает объёмные данные.',
    ];

    const sendMessage = async (messageContent: string) => {
        if (!messageContent.trim()) {
            return;
        }

        const newMessage: Message = {
            id: Date.now(),
            content: messageContent,
            timestamp: new Date(),
            status: 'sending',
        };

        setMessages(prev => [newMessage, ...prev]);
        setLoading(true);

        try {
            await kafkaApi.sendMessage(messageContent);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === newMessage.id
                        ? { ...msg, status: 'sent' as const }
                        : msg
                )
            );
        } catch (error) {
            const errorMessage = handleApiError(error);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === newMessage.id
                        ? { ...msg, status: 'error' as const, error: errorMessage }
                        : msg
                )
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSendCustomMessage = () => {
        sendMessage(message);
        setMessage('');
    };

    const handleSendPredefined = (msg: string) => {
        sendMessage(msg);
    };

    const clearMessages = () => {
        setMessages([]);
    };

    const getStatusIcon = (status: Message['status']) => {
        switch (status) {
            case 'sending': return '⏳';
            case 'sent': return '✅';
            case 'error': return '❌';
            default: return '❓';
        }
    };

    const getStatusText = (status: Message['status']) => {
        switch (status) {
            case 'sending': return 'Отправка...';
            case 'sent': return 'Отправлено';
            case 'error': return 'Ошибка';
            default: return 'Неизвестно';
        }
    };

    return (
        <div className="kafka-demo">
            <div className="kafka-header">
                <h1>🔄 Kafka Демо</h1>
                <p>Отправка сообщений в Apache Kafka через Service One</p>
            </div>

            <div className="kafka-content">
                <div className="kafka-section">
                    <div className="section-card">
                        <h2>✉️ Отправить сообщение</h2>

                        <div className="message-input">
              <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите ваше сообщение здесь..."
                  rows={4}
                  disabled={loading}
              />
                            <button
                                onClick={handleSendCustomMessage}
                                disabled={loading || !message.trim()}
                                className="btn-primary"
                            >
                                {loading ? 'Отправка...' : 'Отправить сообщение'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="kafka-section">
                    <div className="section-card">
                        <h2>📋 Быстрые сообщения</h2>
                        <p>Нажмите на любое сообщение для быстрой отправки:</p>

                        <div className="predefined-messages">
                            {predefinedMessages.map((msg, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSendPredefined(msg)}
                                    disabled={loading}
                                    className="predefined-message"
                                >
                                    {msg.length > 50 ? msg.substring(0, 50) + '...' : msg}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="kafka-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>📤 История отправленных сообщений</h2>
                            <div className="header-actions">
                <span className="message-count">
                  Всего: {messages.length}
                </span>
                                <button
                                    onClick={clearMessages}
                                    disabled={messages.length === 0}
                                    className="btn-secondary"
                                >
                                    🗑️ Очистить
                                </button>
                            </div>
                        </div>

                        <div className="messages-list">
                            {messages.length === 0 ? (
                                <div className="no-messages">
                                    <p>Сообщения ещё не отправлялись</p>
                                    <p>Отправьте первое сообщение выше ⬆️</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`message-item ${msg.status}`}>
                                        <div className="message-header">
                      <span className="message-status">
                        {getStatusIcon(msg.status)} {getStatusText(msg.status)}
                      </span>
                                            <span className="message-time">
                        {msg.timestamp.toLocaleTimeString('ru-RU')}
                      </span>
                                        </div>

                                        <div className="message-content">
                                            {msg.content}
                                        </div>

                                        {msg.error && (
                                            <div className="message-error">
                                                Ошибка: {msg.error}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="kafka-info">
                <div className="info-grid">
                    <div className="info-card">
                        <h3>🔄 Как это работает</h3>
                        <ol>
                            <li>Фронтенд отправляет сообщение в Service One</li>
                            <li>Service One публикует сообщение в топик Kafka</li>
                            <li>Service Two получает и обрабатывает сообщение</li>
                            <li>Логи обработки видны в консоли Service Two</li>
                        </ol>
                    </div>

                    <div className="info-card">
                        <h3>🎯 Топик Kafka</h3>
                        <p><strong>Название:</strong> service-messages</p>
                        <p><strong>Consumer Group:</strong> service-two-group</p>
                        <p><strong>Формат:</strong> String (text/plain)</p>
                    </div>

                    <div className="info-card">
                        <h3>📊 Мониторинг</h3>
                        <p>Для просмотра сообщений в Kafka используйте:</p>
                        <a
                            href="http://localhost:8090"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link"
                        >
                            🔄 Kafka UI
                        </a>
                    </div>

                    <div className="info-card">
                        <h3>📝 Логи Service Two</h3>
                        <p>Для просмотра обработки сообщений:</p>
                        <code>docker-compose logs -f service-two</code>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KafkaDemo;