package com.example.service.two.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Component
public class MessageListener {

    // Разные логгеры для разных типов событий (для лучшей фильтрации в ELK)
    private static final Logger logger = LoggerFactory.getLogger(MessageListener.class);
    private static final Logger kafkaConsumerLogger = LoggerFactory.getLogger("KAFKA_CONSUMER");
    private static final Logger messageProcessingLogger = LoggerFactory.getLogger("MESSAGE_PROCESSING");

    private static final String TOPIC = "service-messages";

    @KafkaListener(topics = TOPIC, groupId = "service-two-group")
    public void listen(@Payload String message,
                       @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
                       @Header(KafkaHeaders.RECEIVED_PARTITION) Integer partition,
                       @Header(KafkaHeaders.OFFSET) Long offset,
                       @Header(KafkaHeaders.RECEIVED_TIMESTAMP) Long timestamp,
                       Acknowledgment acknowledgment) {

        // Генерируем уникальный ID для трассировки сообщения
        String messageId = UUID.randomUUID().toString();
        String processingStartTime = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

        try {
            // Добавляем контекстную информацию в MDC для структурированного логирования
            MDC.put("messageId", messageId);
            MDC.put("topic", topic);
            MDC.put("partition", String.valueOf(partition));
            MDC.put("offset", String.valueOf(offset));
            MDC.put("messageTimestamp", String.valueOf(timestamp));
            MDC.put("processingStartTime", processingStartTime);
            MDC.put("messageLength", String.valueOf(message.length()));

            // Логируем получение сообщения
            kafkaConsumerLogger.info("Received message from Kafka - Topic: {}, Partition: {}, Offset: {}, MessageId: {}",
                    topic, partition, offset, messageId);

            // Симулируем обработку сообщения
            long processingStart = System.currentTimeMillis();

            // Основная обработка
            processMessage(message, messageId);

            long processingTime = System.currentTimeMillis() - processingStart;
            MDC.put("processingTimeMs", String.valueOf(processingTime));

            // Логируем успешную обработку
            messageProcessingLogger.info("Message processed successfully - MessageId: {}, ProcessingTime: {}ms, Content: '{}'",
                    messageId, processingTime, truncateMessage(message, 100));

            // Подтверждаем получение сообщения
            if (acknowledgment != null) {
                acknowledgment.acknowledge();
            }

            // Общий лог для консоли
            logger.info("✅ Обработано сообщение [{}]: {} (время: {}ms)", messageId, truncateMessage(message, 50), processingTime);

        } catch (Exception e) {
            // Логируем ошибку обработки
            MDC.put("errorMessage", e.getMessage());
            MDC.put("errorClass", e.getClass().getSimpleName());

            messageProcessingLogger.error("Failed to process message - MessageId: {}, Error: {}",
                    messageId, e.getMessage(), e);

            logger.error("❌ Ошибка обработки сообщения [{}]: {}", messageId, e.getMessage());

            // В зависимости от типа ошибки можем решить подтверждать или нет
            if (acknowledgment != null && !isRetryableError(e)) {
                acknowledgment.acknowledge(); // Подтверждаем чтобы не зациклиться
            }

        } finally {
            // Очищаем MDC
            MDC.clear();
        }
    }

    /**
     * Основная логика обработки сообщения
     */
    private void processMessage(String message, String messageId) {
        MDC.put("processingStep", "validation");

        // Валидация сообщения
        if (message == null || message.trim().isEmpty()) {
            throw new IllegalArgumentException("Empty or null message received");
        }

        messageProcessingLogger.debug("Message validation passed - MessageId: {}", messageId);

        MDC.put("processingStep", "analysis");

        // Анализируем тип сообщения
        String messageType = determineMessageType(message);
        MDC.put("messageType", messageType);

        messageProcessingLogger.info("Message type determined: {} - MessageId: {}", messageType, messageId);

        MDC.put("processingStep", "business_logic");

        // Симулируем различное время обработки в зависимости от типа
        simulateProcessing(messageType, messageId);

        MDC.put("processingStep", "completed");
        messageProcessingLogger.debug("Message processing completed - MessageId: {}", messageId);
    }

    /**
     * Определяет тип сообщения для метрик и логирования
     */
    private String determineMessageType(String message) {
        String lowerMessage = message.toLowerCase();

        if (lowerMessage.contains("json") || lowerMessage.startsWith("{")) {
            return "JSON";
        } else if (lowerMessage.contains("error") || lowerMessage.contains("ошибка")) {
            return "ERROR";
        } else if (lowerMessage.contains("test") || lowerMessage.contains("тест")) {
            return "TEST";
        } else if (lowerMessage.length() > 100) {
            return "LARGE";
        } else {
            return "SIMPLE";
        }
    }

    /**
     * Симулирует обработку разных типов сообщений
     */
    private void simulateProcessing(String messageType, String messageId) {
        try {
            int delay = switch (messageType) {
                case "JSON" -> 100 + (int)(Math.random() * 200); // 100-300ms
                case "ERROR" -> 50;  // Быстрая обработка ошибок
                case "LARGE" -> 200 + (int)(Math.random() * 500); // 200-700ms
                default -> 50 + (int)(Math.random() * 100); // 50-150ms
            };

            MDC.put("simulatedDelay", String.valueOf(delay));
            Thread.sleep(delay);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Processing interrupted", e);
        }
    }

    /**
     * Определяет, можно ли повторить обработку при данной ошибке
     */
    private boolean isRetryableError(Exception e) {
        // Сетевые ошибки и временные сбои можно повторить
        return e instanceof RuntimeException &&
                (e.getMessage().contains("timeout") ||
                        e.getMessage().contains("connection") ||
                        e.getMessage().contains("temporary"));
    }

    /**
     * Обрезает сообщение для логирования
     */
    private String truncateMessage(String message, int maxLength) {
        if (message == null) return "null";
        if (message.length() <= maxLength) return message;
        return message.substring(0, maxLength) + "...";
    }
}