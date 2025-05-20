package com.example.service.two.listener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class MessageListener {

    private static final Logger logger = LoggerFactory.getLogger(MessageListener.class);
    private static final String TOPIC = "service-messages";

    @KafkaListener(topics = TOPIC, groupId = "service-two-group")
    public void listen(String message) {
        logger.info("Получено сообщение из Kafka: {}", message);
    }
}
