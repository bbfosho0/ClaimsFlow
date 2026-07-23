package com.claimsflow.recommendation.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.boot.context.properties.source.MapConfigurationPropertySource;

class OpenAiPropertiesTest {

    @Test
    void defaultsModelAndTimeoutWhenTheyAreNotConfigured() {
        var properties = new OpenAiProperties(null, null);

        assertThat(properties.model()).isEqualTo("gpt-5-nano");
        assertThat(properties.timeout()).isEqualTo(Duration.ofSeconds(10));
    }

    @Test
    void alternateSpringPropertyCannotBindAnApiKey() {
        var source = new MapConfigurationPropertySource(Map.of(
                "claimsflow.openai.api-key", "property-key",
                "claimsflow.openai.model", "test-model",
                "claimsflow.openai.timeout", "3s"));

        var properties = new Binder(source)
                .bind("claimsflow.openai", Bindable.of(OpenAiProperties.class))
                .orElseThrow(() -> new AssertionError("OpenAI properties were not bound."));

        assertThat(OpenAiProperties.class.getRecordComponents())
                .extracting(component -> component.getName())
                .containsExactly("model", "timeout");
        assertThat(properties.model()).isEqualTo("test-model");
        assertThat(properties.timeout()).isEqualTo(Duration.ofSeconds(3));
    }
}
