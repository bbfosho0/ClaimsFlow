package com.claimsflow.recommendation.config;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("claimsflow.openai")
public record OpenAiProperties(String apiKey, String model, Duration timeout) {
    public OpenAiProperties {
        model = model == null || model.isBlank() ? "gpt-5-nano" : model;
        timeout = timeout == null ? Duration.ofSeconds(10) : timeout;
    }
}
