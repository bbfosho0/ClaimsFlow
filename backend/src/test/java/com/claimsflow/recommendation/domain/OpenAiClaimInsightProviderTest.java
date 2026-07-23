package com.claimsflow.recommendation.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.recommendation.config.OpenAiApiKeyTestFactory;
import com.claimsflow.recommendation.config.OpenAiProperties;
import java.net.SocketTimeoutException;
import java.time.Duration;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.web.client.ResponseCreator;
import org.springframework.web.client.RestClient;

class OpenAiClaimInsightProviderTest {
    private static final ClaimAnalysisRequest REQUEST = new ClaimAnalysisRequest(
            ClaimType.AUTO,
            ClaimStatus.NEW,
            ClaimPriority.HIGH,
            false,
            50,
            List.of("Damage photos"));

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer server;
    private RuleBasedClaimInsightProvider ruleBased;
    private OpenAiClaimInsightProvider provider;

    @BeforeEach
    void setUp() {
        restClientBuilder = RestClient.builder().baseUrl("https://api.openai.com");
        server = MockRestServiceServer.bindTo(restClientBuilder).build();
        ruleBased = new RuleBasedClaimInsightProvider();
        provider = providerFor("test-key");
    }

    @Test
    void sendsRedactedStructuredRequestAndReturnsValidatedInsight() {
        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("Authorization", "Bearer test-key"))
                .andExpect(content().contentTypeCompatibleWith(APPLICATION_JSON))
                .andExpect(content().string(containsString("\"model\":\"gpt-5-nano\"")))
                .andExpect(content().string(containsString("\"type\":\"json_schema\"")))
                .andExpect(content().string(containsString("\"strict\":true")))
                .andExpect(content().string(containsString("\"REQUEST_INFORMATION\"")))
                .andExpect(content().string(containsString("\"PREPARE_DECISION\"")))
                .andExpect(content().string(not(containsString("description"))))
                .andExpect(content().string(not(containsString("estimatedLoss"))))
                .andExpect(content().string(not(containsString("incidentDate"))))
                .andRespond(withSuccess(validResponse("BEGIN_REVIEW"), APPLICATION_JSON));

        var insight = provider.analyze(REQUEST);

        assertThat(insight).isEqualTo(new ClaimInsight(
                "BEGIN_REVIEW", "The claim is ready for review.", 82, List.of("Damage photos")));
        server.verify();
    }

    @Test
    void immediatelyFallsBackWhenApiKeyIsBlank() {
        var blankKeyProvider = providerFor("  ");

        assertThat(blankKeyProvider.analyze(REQUEST)).isEqualTo(ruleBased.analyze(REQUEST));
        server.verify();
    }

    @Test
    void fallsBackWhenMissingInformationWouldExceedPersistenceLimit() {
        List<String> missingInformation = List.of("x".repeat(500), "y".repeat(500), "z".repeat(500));
        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess(responseWithInsight("BEGIN_REVIEW", "The claim is ready for review.", 82, missingInformation), APPLICATION_JSON));

        assertThat(provider.analyze(REQUEST)).isEqualTo(ruleBased.analyze(REQUEST));
        server.verify();
    }

    @Test
    void fallsBackWhenMissingInformationContainsPersistenceDelimiter() {
        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess(responseWithInsight("BEGIN_REVIEW", "The claim is ready for review.", 82, List.of("Damage|photos")), APPLICATION_JSON));

        assertThat(provider.analyze(REQUEST)).isEqualTo(ruleBased.analyze(REQUEST));
        server.verify();
    }

    @ParameterizedTest
    @ValueSource(strings = {"failed", "in_progress", "cancelled", "queued", "incomplete"})
    void fallsBackWhenResponseEnvelopeIsNotCompleted(String status) {
        server.expect(requestTo("https://api.openai.com/v1/responses"))
                .andRespond(withSuccess(responseEnvelope(
                        status,
                        "null",
                        "null",
                        "completed",
                        outputTextContent(validInsight("BEGIN_REVIEW"))), APPLICATION_JSON));

        assertThat(provider.analyze(REQUEST)).isEqualTo(ruleBased.analyze(REQUEST));
        server.verify();
    }

    @ParameterizedTest
    @MethodSource("invalidOrFailedResponses")
    void fallsBackForInvalidOrUnavailableModelOutput(ResponseCreator response) {
        server.expect(requestTo("https://api.openai.com/v1/responses")).andRespond(response);

        assertThat(provider.analyze(REQUEST)).isEqualTo(ruleBased.analyze(REQUEST));
        server.verify();
    }

    private OpenAiClaimInsightProvider providerFor(String apiKey) {
        return new OpenAiClaimInsightProvider(
                restClientBuilder.build(),
                OpenAiApiKeyTestFactory.fromValue(apiKey),
                new OpenAiProperties("gpt-5-nano", Duration.ofSeconds(2)),
                ruleBased,
                new com.fasterxml.jackson.databind.ObjectMapper());
    }

    private static Stream<ResponseCreator> invalidOrFailedResponses() {
        return Stream.of(
                withStatus(INTERNAL_SERVER_ERROR).contentType(APPLICATION_JSON).body("{\"error\":{\"message\":\"unavailable\"}}"),
                request -> {
                    throw new SocketTimeoutException("Timed out");
                },
                withSuccess(responseEnvelope(
                        "completed",
                        "{\"code\":\"server_error\",\"message\":\"failed\"}",
                        "null",
                        "completed",
                        outputTextContent(validInsight("BEGIN_REVIEW"))), APPLICATION_JSON),
                withSuccess(responseEnvelope(
                        "completed",
                        "null",
                        "{\"reason\":\"max_output_tokens\"}",
                        "completed",
                        outputTextContent(validInsight("BEGIN_REVIEW"))), APPLICATION_JSON),
                withSuccess(responseEnvelope(
                        "completed",
                        "null",
                        "null",
                        "incomplete",
                        outputTextContent(validInsight("BEGIN_REVIEW"))), APPLICATION_JSON),
                withSuccess(responseEnvelope(
                        "completed",
                        "null",
                        "null",
                        "completed",
                        "[{\"type\":\"refusal\",\"refusal\":\"I cannot help\"}]"), APPLICATION_JSON),
                withSuccess(responseEnvelope(
                        "completed",
                        "null",
                        "null",
                        "completed",
                        "[%s,{\"type\":\"refusal\",\"refusal\":\"I cannot help\"}]"
                                .formatted(outputTextPart(validInsight("BEGIN_REVIEW")))), APPLICATION_JSON),
                withSuccess(responseEnvelope(
                        "completed",
                        "null",
                        "null",
                        "completed",
                        outputTextContent("not-json")), APPLICATION_JSON),
                withSuccess(validResponse("ESCALATE_EXTERNALLY"), APPLICATION_JSON),
                withSuccess(responseWithInsight("BEGIN_REVIEW", "", 82, List.of()), APPLICATION_JSON),
                withSuccess(responseWithInsight("BEGIN_REVIEW", "x".repeat(501), 82, List.of()), APPLICATION_JSON),
                withSuccess(responseWithInsight("BEGIN_REVIEW", "The claim is ready for review.", 101, List.of()), APPLICATION_JSON),
                withSuccess(responseWithInsight("BEGIN_REVIEW", "The claim is ready for review.", 82, List.of("  ")), APPLICATION_JSON),
                withSuccess(responseWithContent(
                        outputTextContent("{\"action\":\"BEGIN_REVIEW\",\"explanation\":\"The claim is ready for review.\",\"confidence\":82,\"missingInformation\":[null]}")), APPLICATION_JSON));
    }

    private static String validResponse(String action) {
        return responseWithInsight(action, "The claim is ready for review.", 82, List.of("Damage photos"));
    }

    private static String responseWithInsight(String action, String explanation, int confidence, List<String> missingInformation) {
        String insight = "{\"action\":\"%s\",\"explanation\":\"%s\",\"confidence\":%d,\"missingInformation\":[%s]}"
                .formatted(action, explanation, confidence, missingInformation.stream().map(value -> "\"%s\"".formatted(value)).collect(java.util.stream.Collectors.joining(",")));
        return responseWithContent(outputTextContent(insight));
    }

    private static String validInsight(String action) {
        return "{\"action\":\"%s\",\"explanation\":\"The claim is ready for review.\",\"confidence\":82,\"missingInformation\":[\"Damage photos\"]}"
                .formatted(action);
    }

    private static String outputTextContent(String text) {
        return "[%s]".formatted(outputTextPart(text));
    }

    private static String outputTextPart(String text) {
        return "{\"type\":\"output_text\",\"text\":%s}"
                .formatted(new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(text));
    }

    private static String responseWithContent(String content) {
        return responseEnvelope("completed", "null", "null", "completed", content);
    }

    private static String responseEnvelope(
            String status,
            String error,
            String incompleteDetails,
            String messageStatus,
            String content) {
        return """
                {"status":"%s","error":%s,"incomplete_details":%s,"output":[{"type":"message","status":"%s","content":%s}]}
                """.formatted(status, error, incompleteDetails, messageStatus, content).trim();
    }
}
