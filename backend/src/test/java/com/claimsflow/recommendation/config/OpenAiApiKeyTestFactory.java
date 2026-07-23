package com.claimsflow.recommendation.config;

import java.util.Map;

public final class OpenAiApiKeyTestFactory {
    private OpenAiApiKeyTestFactory() {}

    public static OpenAiApiKey fromValue(String value) {
        return OpenAiApiKey.fromEnvironment(Map.of("OPENAI_API_KEY", value));
    }
}
