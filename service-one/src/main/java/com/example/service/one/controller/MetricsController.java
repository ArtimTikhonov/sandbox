package com.example.service.one.controller;

import io.micrometer.core.annotation.Counted;
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.web.bind.annotation.*;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/metrics")
public class MetricsController {

    private final MeterRegistry meterRegistry;
    private final Counter customCounter;
    private final AtomicInteger gaugeValue = new AtomicInteger(0);
    private final Random random = new Random();

    public MetricsController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;

        // Создаем кастомный счетчик
        this.customCounter = Counter.builder("custom.api.calls")
                .description("Количество вызовов кастомного API")
                .tag("service", "service-one")
                .register(meterRegistry);

        // Создаем gauge для отслеживания активных подключений - ПРАВИЛЬНЫЙ СИНТАКСИС
        Gauge.builder("custom.active.connections", gaugeValue, AtomicInteger::get)
                .description("Количество активных подключений")
                .tag("service", "service-one")
                .register(meterRegistry);
    }

    @GetMapping("/test")
    @Timed(value = "custom.api.test.time", description = "Время выполнения тестового API")
    @Counted(value = "custom.api.test.count", description = "Количество вызовов тестового API")
    public String testEndpoint() {
        // Увеличиваем кастомный счетчик
        customCounter.increment();

        // Изменяем значение gauge
        gaugeValue.set(random.nextInt(100));

        // Симулируем различное время выполнения
        try {
            Thread.sleep(random.nextInt(1000));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return "Test endpoint executed successfully!";
    }

    @PostMapping("/increment-counter")
    public String incrementCounter() {
        customCounter.increment();
        return "Counter incremented. Current value: " + customCounter.count();
    }

    @PostMapping("/set-gauge/{value}")
    public String setGaugeValue(@PathVariable int value) {
        gaugeValue.set(value);
        return "Gauge value set to: " + value;
    }

    @GetMapping("/simulate-error")
    public String simulateError() {
        // Создаем счетчик для ошибок
        Counter errorCounter = Counter.builder("custom.api.errors")
                .description("Количество ошибок API")
                .tag("service", "service-one")
                .tag("error.type", "simulated")
                .register(meterRegistry);

        errorCounter.increment();

        if (random.nextBoolean()) {
            throw new RuntimeException("Simulated error for metrics testing");
        }

        return "No error this time!";
    }

    @GetMapping("/long-operation")
    @Timed(value = "custom.long.operation.time", description = "Время выполнения длительной операции")
    public String longOperation() {
        Timer.Sample sample = Timer.start(meterRegistry);

        try {
            // Симулируем длительную операцию
            Thread.sleep(2000 + random.nextInt(3000));
            return "Long operation completed successfully!";
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "Operation interrupted";
        } finally {
            sample.stop(Timer.builder("custom.operation.duration")
                    .description("Длительность выполнения операции")
                    .tag("operation", "long")
                    .register(meterRegistry));
        }
    }

    @GetMapping("/database-simulation")
    public String databaseSimulation() {
        Timer dbTimer = Timer.builder("custom.database.query.time")
                .description("Время выполнения запроса к БД")
                .tag("query.type", "select")
                .register(meterRegistry);

        try {
            return dbTimer.recordCallable(() -> {
                // Симулируем запрос к БД
                Thread.sleep(50 + random.nextInt(200));
                return "Database query executed";
            });
        } catch (Exception e) {
            return "Database query failed: " + e.getMessage();
        }
    }

    @GetMapping("/memory-usage")
    public String memoryUsage() {
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;

        return String.format("Memory usage: %d bytes (%.2f MB)",
                usedMemory, usedMemory / (1024.0 * 1024.0));
    }
}