package com.claimsflow.recommendation.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import org.junit.jupiter.api.Test;

class OpenAiPropertiesTest {

    @Test
    void defaultsModelAndTimeoutWhenTheyAreNotConfigured() {
        var properties = new OpenAiProperties("api-key", null, null);

        assertThat(properties.apiKey()).isEqualTo("api-key");
        assertThat(properties.model()).isEqualTo("gpt-5-nano");
        assertThat(properties.timeout()).isEqualTo(Duration.ofSeconds(10));
    }
}
