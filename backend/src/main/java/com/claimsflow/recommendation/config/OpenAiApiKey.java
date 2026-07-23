package com.claimsflow.recommendation.config;

import java.util.Map;
import java.util.Objects;

public final class OpenAiApiKey {
    private static final String ENVIRONMENT_VARIABLE = "OPENAI_API_KEY";

    private final String value;

    private OpenAiApiKey(String value) {
        this.value = value;
    }

    public static OpenAiApiKey fromProcessEnvironment() {
        return fromEnvironment(System.getenv());
    }

    static OpenAiApiKey fromEnvironment(Map<String, String> environment) {
        Objects.requireNonNull(environment, "Environment must not be null.");
        return new OpenAiApiKey(environment.get(ENVIRONMENT_VARIABLE));
    }

    public boolean isConfigured() {
        return value != null && !value.isBlank();
    }

    public String authorizationHeader() {
        return "Bearer " + value;
    }

    @Override
    public String toString() {
        return "OpenAiApiKey[redacted]";
    }
}
