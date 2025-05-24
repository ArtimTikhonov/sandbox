package com.example.service.one.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, String> redisTemplate;

    // Добавить значение
    public void setValue(String key, String value) {
        redisTemplate.opsForValue().set(key, value);
    }

    // Добавить значение с TTL (время жизни)
    public void setValue(String key, String value, Duration timeout) {
        redisTemplate.opsForValue().set(key, value, timeout);
    }

    // Получить значение
    public String getValue(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // Удалить ключ
    public boolean deleteKey(String key) {
        return redisTemplate.delete(key);
    }

    // Проверить существование ключа
    public boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    // Получить все ключи по паттерну
    public Set<String> getKeys(String pattern) {
        return redisTemplate.keys(pattern);
    }

    // Установить время жизни для ключа
    public boolean expire(String key, Duration timeout) {
        return Boolean.TRUE.equals(redisTemplate.expire(key, timeout));
    }

    // Получить время жизни ключа
    public Long getExpire(String key) {
        return redisTemplate.getExpire(key);
    }

    // Инкремент значения (для числовых значений)
    public Long increment(String key) {
        return redisTemplate.opsForValue().increment(key);
    }

    // Инкремент на определенное значение
    public Long increment(String key, long delta) {
        return redisTemplate.opsForValue().increment(key, delta);
    }

    // Декремент значения
    public Long decrement(String key) {
        return redisTemplate.opsForValue().decrement(key);
    }

    // Декремент на определенное значение
    public Long decrement(String key, long delta) {
        return redisTemplate.opsForValue().decrement(key, delta);
    }
}