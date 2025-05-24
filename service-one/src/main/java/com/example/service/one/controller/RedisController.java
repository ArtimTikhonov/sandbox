package com.example.service.one.controller;

import com.example.service.one.service.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Set;

@RestController
@RequestMapping("/redis")
@RequiredArgsConstructor
public class RedisController {

    private final RedisService redisService;

    // Добавить значение
    @PostMapping("/set/{key}")
    public ResponseEntity<String> setValue(@PathVariable String key, @RequestBody String value) {
        redisService.setValue(key, value);
        return ResponseEntity.ok("Значение установлено для ключа: " + key);
    }

    // Добавить значение с TTL (в секундах)
    @PostMapping("/set/{key}/ttl/{seconds}")
    public ResponseEntity<String> setValueWithTtl(@PathVariable String key,
                                                  @PathVariable long seconds,
                                                  @RequestBody String value) {
        redisService.setValue(key, value, Duration.ofSeconds(seconds));
        return ResponseEntity.ok("Значение установлено для ключа: " + key + " с TTL: " + seconds + " секунд");
    }

    // Получить значение
    @GetMapping("/get/{key}")
    public ResponseEntity<String> getValue(@PathVariable String key) {
        String value = redisService.getValue(key);
        if (value != null) {
            return ResponseEntity.ok(value);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Удалить ключ
    @DeleteMapping("/delete/{key}")
    public ResponseEntity<String> deleteKey(@PathVariable String key) {
        boolean deleted = redisService.deleteKey(key);
        if (deleted) {
            return ResponseEntity.ok("Ключ удален: " + key);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Проверить существование ключа
    @GetMapping("/exists/{key}")
    public ResponseEntity<Boolean> hasKey(@PathVariable String key) {
        boolean exists = redisService.hasKey(key);
        return ResponseEntity.ok(exists);
    }

    // Получить все ключи по паттерну
    @GetMapping("/keys/{pattern}")
    public ResponseEntity<Set<String>> getKeys(@PathVariable String pattern) {
        Set<String> keys = redisService.getKeys(pattern);
        return ResponseEntity.ok(keys);
    }

    // Получить все ключи
    @GetMapping("/keys")
    public ResponseEntity<Set<String>> getAllKeys() {
        Set<String> keys = redisService.getKeys("*");
        return ResponseEntity.ok(keys);
    }

    // Установить время жизни для ключа (в секундах)
    @PutMapping("/expire/{key}/{seconds}")
    public ResponseEntity<String> setExpire(@PathVariable String key, @PathVariable long seconds) {
        boolean result = redisService.expire(key, Duration.ofSeconds(seconds));
        if (result) {
            return ResponseEntity.ok("TTL установлен для ключа: " + key);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Получить время жизни ключа
    @GetMapping("/ttl/{key}")
    public ResponseEntity<Long> getExpire(@PathVariable String key) {
        Long ttl = redisService.getExpire(key);
        return ResponseEntity.ok(ttl);
    }

    // Инкремент значения
    @PostMapping("/increment/{key}")
    public ResponseEntity<Long> increment(@PathVariable String key) {
        Long result = redisService.increment(key);
        return ResponseEntity.ok(result);
    }

    // Инкремент на определенное значение
    @PostMapping("/increment/{key}/{delta}")
    public ResponseEntity<Long> increment(@PathVariable String key, @PathVariable long delta) {
        Long result = redisService.increment(key, delta);
        return ResponseEntity.ok(result);
    }

    // Декремент значения
    @PostMapping("/decrement/{key}")
    public ResponseEntity<Long> decrement(@PathVariable String key) {
        Long result = redisService.decrement(key);
        return ResponseEntity.ok(result);
    }

    // Декремент на определенное значение
    @PostMapping("/decrement/{key}/{delta}")
    public ResponseEntity<Long> decrement(@PathVariable String key, @PathVariable long delta) {
        Long result = redisService.decrement(key, delta);
        return ResponseEntity.ok(result);
    }
}