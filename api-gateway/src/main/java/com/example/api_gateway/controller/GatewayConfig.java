package com.example.api_gateway.controller;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("service-one-route", r -> r.path("/service-one/**")
                        .filters(f -> f.rewritePath("/service-one/(?<segment>.*)", "/${segment}"))
                        .uri("http://service-one:8080"))  // Имя Docker-сервиса, а не localhost
                .route("service-two-route", r -> r.path("/service-two/**")
                        .filters(f -> f.rewritePath("/service-two/(?<segment>.*)", "/${segment}"))
                        .uri("http://service-two:8080"))  // Имя Docker-сервиса, а не localhost
                .build();
    }
}