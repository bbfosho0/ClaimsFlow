package com.claimsflow.recommendation.domain;

import com.claimsflow.recommendation.config.OpenAiApiKey;
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
    private static final String MISSING_INFORMATION_DELIMITER = "|";
    private static final int MAX_MISSING_INFORMATION_LENGTH = 1000;
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
    private final OpenAiApiKey apiKey;
    private final OpenAiProperties properties;
    private final ClaimInsightProvider fallback;
    private final ObjectMapper objectMapper;

    public OpenAiClaimInsightProvider(
            RestClient restClient,
            OpenAiApiKey apiKey,
            OpenAiProperties properties,
            ClaimInsightProvider fallback,
            ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.apiKey = apiKey;
        this.properties = properties;
        this.fallback = fallback;
        this.objectMapper = objectMapper;
    }

    @Override
    public ClaimInsight analyze(ClaimAnalysisRequest request) {
        if (!apiKey.isConfigured()) {
            return fallback.analyze(request);
        }

        try {
            String response = restClient.post()
                    .uri("/v1/responses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", apiKey.authorizationHeader())
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

        JsonNode responseNode = objectMapper.readTree(response);
        JsonNode insight = objectMapper.readTree(outputText(responseNode));
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

    private String outputText(JsonNode responseNode) {
        if (!responseNode.isObject()
                || !"completed".equals(responseNode.path("status").asText())
                || responseNode.hasNonNull("error")
                || responseNode.hasNonNull("incomplete_details")) {
            throw new IllegalArgumentException("Response envelope is not completed.");
        }

        JsonNode output = responseNode.path("output");
        if (!output.isArray()) {
            throw new IllegalArgumentException("Response does not contain output.");
        }

        String outputText = null;
        int messageCount = 0;
        for (JsonNode item : output) {
            if ("reasoning".equals(item.path("type").asText())) {
                continue;
            }
            if (!"message".equals(item.path("type").asText())) {
                throw new IllegalArgumentException("Response contains unsupported output.");
            }
            messageCount++;
            if (!"completed".equals(item.path("status").asText())) {
                throw new IllegalArgumentException("Response message is not completed.");
            }
            JsonNode content = item.path("content");
            if (!content.isArray() || content.size() != 1) {
                throw new IllegalArgumentException("Response message content is invalid.");
            }
            JsonNode part = content.get(0);
            if (!"output_text".equals(part.path("type").asText()) || !part.path("text").isTextual()) {
                throw new IllegalArgumentException("Response message content is invalid.");
            }
            outputText = part.path("text").textValue();
        }
        if (messageCount != 1 || outputText == null || outputText.isBlank()) {
            throw new IllegalArgumentException("Response does not contain output text.");
        }
        return outputText;
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
        int serializedLength = 0;
        for (JsonNode value : missingInformation) {
            if (!value.isTextual() || value.textValue().isBlank() || value.textValue().length() > 500) {
                throw new IllegalArgumentException("Response missing information is invalid.");
            }
            String text = value.textValue();
            if (text.contains(MISSING_INFORMATION_DELIMITER)) {
                throw new IllegalArgumentException("Response missing information contains an unsupported delimiter.");
            }
            serializedLength += text.length() + (values.isEmpty() ? 0 : MISSING_INFORMATION_DELIMITER.length());
            if (serializedLength > MAX_MISSING_INFORMATION_LENGTH) {
                throw new IllegalArgumentException("Response missing information exceeds the persistence limit.");
            }
            values.add(text);
        }
        return List.copyOf(values);
    }
}
