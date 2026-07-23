package com.claimsflow.recommendation.domain;

import com.claimsflow.recommendation.config.OpenAiProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

public class OpenAiClaimInsightProvider implements ClaimInsightProvider {
    private static final Set<String> ALLOWED_ACTIONS = Set.of(
            "REQUEST_INFORMATION", "ASSIGN_ADJUSTER", "BEGIN_REVIEW", "PREPARE_DECISION");
    private static final Set<String> REQUIRED_FIELDS = Set.of(
            "action", "explanation", "confidence", "missingInformation");
    private static final Map<String, Object> RESPONSE_SCHEMA = Map.of(
            "type", "object",
            "properties", Map.of(
                    "action", Map.of("type", "string", "enum", ALLOWED_ACTIONS),
                    "explanation", Map.of("type", "string", "minLength", 1, "maxLength", 500),
                    "confidence", Map.of("type", "integer", "minimum", 0, "maximum", 100),
                    "missingInformation", Map.of("type", "array", "items", Map.of("type", "string"))),
            "required", REQUIRED_FIELDS,
            "additionalProperties", false);

    private final RestClient restClient;
    private final OpenAiProperties properties;
    private final ClaimInsightProvider fallback;
    private final ObjectMapper objectMapper;

    public OpenAiClaimInsightProvider(
            RestClient restClient,
            OpenAiProperties properties,
            ClaimInsightProvider fallback,
            ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.properties = properties;
        this.fallback = fallback;
        this.objectMapper = objectMapper;
    }

    @Override
    public ClaimInsight analyze(ClaimAnalysisRequest request) {
        if (properties.apiKey() == null || properties.apiKey().isBlank()) {
            return fallback.analyze(request);
        }

        try {
            String response = restClient.post()
                    .uri("/v1/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .body(requestBody(request))
                    .retrieve()
                    .body(String.class);
            return validatedInsight(response);
        } catch (RestClientException | JsonProcessingException | IllegalArgumentException exception) {
            return fallback.analyze(request);
        }
    }

    private Map<String, Object> requestBody(ClaimAnalysisRequest request) {
        return Map.of(
                "model", properties.model(),
                "input", operationalSummary(request),
                "text", Map.of(
                        "format", Map.of(
                                "type", "json_schema",
                                "name", "claim_insight",
                                "strict", true,
                                "schema", RESPONSE_SCHEMA)));
    }

    private String operationalSummary(ClaimAnalysisRequest request) {
        return """
                Provide decision-support only. Do not make a final claim decision.
                Return the requested JSON object using only these operational claim fields:
                claimType: %s
                status: %s
                priority: %s
                assigned: %s
                completenessPercentage: %d
                missingInformation: %s
                """.formatted(
                request.claimType(),
                request.status(),
                request.priority(),
                request.assigned(),
                request.completenessPercentage(),
                String.join(", ", request.missingInformation()));
    }

    private ClaimInsight validatedInsight(String response) throws JsonProcessingException {
        if (response == null || response.isBlank()) {
            throw new IllegalArgumentException("Response must contain output text.");
        }

        JsonNode insight = objectMapper.readTree(outputText(response));
        if (!insight.isObject() || insight.size() != REQUIRED_FIELDS.size()) {
            throw new IllegalArgumentException("Response is not a complete insight.");
        }

        var fieldNames = new java.util.HashSet<String>();
        insight.fieldNames().forEachRemaining(fieldNames::add);
        if (!fieldNames.equals(REQUIRED_FIELDS)) {
            throw new IllegalArgumentException("Response has unsupported fields.");
        }

        String action = requiredText(insight, "action", 1, 100);
        String explanation = requiredText(insight, "explanation", 1, 500);
        JsonNode confidenceNode = insight.get("confidence");
        if (confidenceNode == null || !confidenceNode.isInt() || confidenceNode.intValue() < 0 || confidenceNode.intValue() > 100) {
            throw new IllegalArgumentException("Response confidence is invalid.");
        }
        if (!ALLOWED_ACTIONS.contains(action)) {
            throw new IllegalArgumentException("Response action is invalid.");
        }

        return new ClaimInsight(action, explanation, confidenceNode.intValue(), missingInformation(insight.get("missingInformation")));
    }

    private String outputText(String response) throws JsonProcessingException {
        JsonNode responseNode = objectMapper.readTree(response);
        JsonNode output = responseNode.path("output");
        if (!output.isArray()) {
            throw new IllegalArgumentException("Response does not contain output.");
        }

        var outputText = new StringBuilder();
        for (JsonNode item : output) {
            JsonNode content = item.path("content");
            if (!content.isArray()) {
                continue;
            }
            for (JsonNode part : content) {
                if ("output_text".equals(part.path("type").asText()) && part.path("text").isTextual()) {
                    outputText.append(part.path("text").textValue());
                }
            }
        }
        if (outputText.isEmpty()) {
            throw new IllegalArgumentException("Response does not contain output text.");
        }
        return outputText.toString();
    }

    private String requiredText(JsonNode insight, String field, int minimumLength, int maximumLength) {
        JsonNode value = insight.get(field);
        if (value == null || !value.isTextual() || value.textValue().isBlank() || value.textValue().length() < minimumLength || value.textValue().length() > maximumLength) {
            throw new IllegalArgumentException("Response text is invalid.");
        }
        return value.textValue();
    }

    private List<String> missingInformation(JsonNode missingInformation) {
        if (missingInformation == null || !missingInformation.isArray()) {
            throw new IllegalArgumentException("Response missing information is invalid.");
        }

        var values = new ArrayList<String>();
        for (JsonNode value : missingInformation) {
            if (!value.isTextual() || value.textValue().isBlank() || value.textValue().length() > 500) {
                throw new IllegalArgumentException("Response missing information is invalid.");
            }
            values.add(value.textValue());
        }
        return List.copyOf(values);
    }
}
