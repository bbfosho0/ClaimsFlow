package com.claimsflow.recommendation.config;

import com.claimsflow.recommendation.domain.ClaimInsightProvider;
import com.claimsflow.recommendation.domain.OpenAiClaimInsightProvider;
import com.claimsflow.recommendation.domain.RuleBasedClaimInsightProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(OpenAiProperties.class)
public class RecommendationProviderConfiguration {

    @Bean
    RestClient openAiRestClient(OpenAiProperties properties) {
        var requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(properties.timeout());
        requestFactory.setReadTimeout(properties.timeout());
        return RestClient.builder()
                .baseUrl("https://api.openai.com")
                .requestFactory(requestFactory)
                .build();
    }

    @Bean
    RuleBasedClaimInsightProvider ruleBasedClaimInsightProvider() {
        return new RuleBasedClaimInsightProvider();
    }

    @Bean
    @Primary
    ClaimInsightProvider claimInsightProvider(
            RestClient openAiRestClient,
            OpenAiProperties properties,
            RuleBasedClaimInsightProvider fallback,
            ObjectMapper objectMapper) {
        return new OpenAiClaimInsightProvider(openAiRestClient, properties, fallback, objectMapper);
    }
}
