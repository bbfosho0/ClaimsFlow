package com.claimsflow.recommendation.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class OpenAiApiKeyTest {

    @Test
    void readsOnlyTheExactProcessEnvironmentVariable() {
        var key = OpenAiApiKey.fromEnvironment(Map.of(
                "OPENAI_API_KEY", "environment-key",
                "CLAIMSFLOW_OPENAI_API_KEY", "alternate-key"));

        assertThat(key.isConfigured()).isTrue();
        assertThat(key.authorizationHeader()).isEqualTo("Bearer environment-key");
        assertThat(key).hasToString("OpenAiApiKey[redacted]");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "claimsflow.openai.api-key",
            "CLAIMSFLOW_OPENAI_API_KEY",
            "OPENAI_APIKEY",
            "openai_api_key"
    })
    void alternateNamesCannotActivateTheProvider(String alternateName) {
        var key = OpenAiApiKey.fromEnvironment(Map.of(alternateName, "alternate-key"));

        assertThat(key.isConfigured()).isFalse();
    }
}
