import React, { useState, useEffect } from 'react';
import { redisApi, handleApiError } from '../services/api';
import './RedisDemo.css';

interface RedisKey {
    key: string;
    value?: string;
    ttl?: number;
}

const RedisDemo: React.FC = () => {
    const [keys, setKeys] = useState<string[]>([]);
    const [selectedKey, setSelectedKey] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<string>('');
    const [newKey, setNewKey] = useState<string>('');
    const [newValue, setNewValue] = useState<string>('');
    const [ttl, setTtl] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const loadKeys = async () => {
        try {
            setLoading(true);
            const response = await redisApi.getAllKeys();
            setKeys(response.data || []);
        } catch (error) {
            showMessage(handleApiError(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadValue = async (key: string) => {
        try {
            const response = await redisApi.getValue(key);
            setSelectedValue(response.data || '');
            setSelectedKey(key);
        } catch (error) {
            showMessage(`Ошибка загрузки значения: ${handleApiError(error)}`, 'error');
        }
    };

    const setValue = async () => {
        if (!newKey.trim()) {
            showMessage('Введите ключ', 'error');
            return;
        }

        try {
            setLoading(true);
            if (ttl > 0) {
                await redisApi.setValueWithTTL(newKey, newValue, ttl);
                showMessage(`Ключ "${newKey}" установлен с TTL ${ttl} секунд`);
            } else {
                await redisApi.setValue(newKey, newValue);
                showMessage(`Ключ "${newKey}" установлен`);
            }

            setNewKey('');
            setNewValue('');
            setTtl(0);
            await loadKeys();
        } catch (error) {
            showMessage(handleApiError(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteKey = async (key: string) => {
        try {
            setLoading(true);
            await redisApi.deleteKey(key);
            showMessage(`Ключ "${key}" удален`);
            await loadKeys();
            if (selectedKey === key) {
                setSelectedKey('');
                setSelectedValue('');
            }
        } catch (error) {
            showMessage(handleApiError(error), 'error');
        } finally {
            setLoading(false);
        }
    };

    const incrementKey = async (key: string, delta: number = 1) => {
        try {
            const response = await redisApi.increment(key, delta);
            showMessage(`Ключ "${key}" увеличен на ${delta}. Новое значение: ${response.data}`);
            if (selectedKey === key) {
                setSelectedValue(response.data.toString());
            }
        } catch (error) {
            showMessage(handleApiError(error), 'error');
        }
    };

    const decrementKey = async (key: string, delta: number = 1) => {
        try {
            const response = await redisApi.decrement(key, delta);
            showMessage(`Ключ "${key}" уменьшен на ${delta}. Новое значение: ${response.data}`);
            if (selectedKey === key) {
                setSelectedValue(response.data.toString());
            }
        } catch (error) {
            showMessage(handleApiError(error), 'error');
        }
    };

    useEffect(() => {
        loadKeys();
    }, []);

    return (
        <div className="redis-demo">
            <div className="redis-header">
                <h1>🔴 Redis Демо</h1>
                <p>Интерактивное управление кешем Redis</p>
            </div>

            {message && (
                <div className={`message ${messageType}`}>
                    {message}
                </div>
            )}

            <div className="redis-content">
                <div className="redis-section">
                    <div className="section-card">
                        <h2>➕ Добавить новый ключ</h2>
                        <div className="form-group">
                            <label>Ключ:</label>
                            <input
                                type="text"
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                placeholder="Введите ключ"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>Значение:</label>
                            <input
                                type="text"
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="Введите значение"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>TTL (секунды, 0 = без ограничения):</label>
                            <input
                                type="number"
                                value={ttl}
                                onChange={(e) => setTtl(Number(e.target.value))}
                                min="0"
                                disabled={loading}
                            />
                        </div>

                        <button
                            onClick={setValue}
                            disabled={loading || !newKey.trim()}
                            className="btn-primary"
                        >
                            {loading ? 'Добавление...' : 'Добавить ключ'}
                        </button>
                    </div>
                </div>

                <div className="redis-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>🗃️ Существующие ключи</h2>
                            <button
                                onClick={loadKeys}
                                disabled={loading}
                                className="btn-secondary"
                            >
                                🔄 Обновить
                            </button>
                        </div>

                        <div className="keys-list">
                            {keys.length === 0 ? (
                                <p className="no-keys">Ключи не найдены</p>
                            ) : (
                                keys.map((key) => (
                                    <div
                                        key={key}
                                        className={`key-item ${selectedKey === key ? 'selected' : ''}`}
                                    >
                                        <div className="key-info" onClick={() => loadValue(key)}>
                                            <span className="key-name">{key}</span>
                                        </div>
                                        <div className="key-actions">
                                            <button
                                                onClick={() => incrementKey(key)}
                                                className="btn-small btn-success"
                                                title="Увеличить на 1"
                                            >
                                                +1
                                            </button>
                                            <button
                                                onClick={() => decrementKey(key)}
                                                className="btn-small btn-warning"
                                                title="Уменьшить на 1"
                                            >
                                                -1
                                            </button>
                                            <button
                                                onClick={() => deleteKey(key)}
                                                className="btn-small btn-danger"
                                                title="Удалить ключ"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {selectedKey && (
                    <div className="redis-section">
                        <div className="section-card">
                            <h2>📄 Значение ключа: {selectedKey}</h2>
                            <div className="value-display">
                <textarea
                    value={selectedValue}
                    readOnly
                    rows={6}
                    placeholder="Выберите ключ для просмотра значения"
                />
                            </div>
                            <div className="value-actions">
                                <button
                                    onClick={() => incrementKey(selectedKey, 5)}
                                    className="btn-secondary"
                                >
                                    +5
                                </button>
                                <button
                                    onClick={() => incrementKey(selectedKey, 10)}
                                    className="btn-secondary"
                                >
                                    +10
                                </button>
                                <button
                                    onClick={() => decrementKey(selectedKey, 5)}
                                    className="btn-secondary"
                                >
                                    -5
                                </button>
                                <button
                                    onClick={() => decrementKey(selectedKey, 10)}
                                    className="btn-secondary"
                                >
                                    -10
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="redis-info">
                <div className="info-card">
                    <h3>💡 Возможности Redis API</h3>
                    <ul>
                        <li>Установка и получение строковых значений</li>
                        <li>Автоматическое истечение времени жизни (TTL)</li>
                        <li>Атомарные операции инкремента/декремента</li>
                        <li>Управление ключами и их удаление</li>
                        <li>Просмотр всех существующих ключей</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default RedisDemo;