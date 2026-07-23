# OpenAI Nano Recommendations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate advisory ClaimsFlow recommendations with `gpt-5-nano` when configured, while safely falling back to deterministic rules.

**Architecture:** Keep `ClaimInsightProvider` as the application boundary. A primary OpenAI provider sends only redacted operational facts to the Responses API and delegates every missing-key, transport, refusal, malformed-output, or validation failure to the existing rule-based provider. Recommendation persistence, audit logging, and human review are unchanged.

**Tech Stack:** Java 21, Spring Boot 3.5, Spring `RestClient`, Jackson, JUnit 5, AssertJ, MockRestServiceServer.

## Global Constraints

- Use `gpt-5-nano` by default and call `POST https://api.openai.com/v1/responses`.
- Read the secret only from `OPENAI_API_KEY`; do not persist or log it.
- Never send claimant name or claimant email to OpenAI.
- AI output is advisory only and must use the existing allowed action vocabulary.
- Fall back to deterministic rules on all AI unavailability or validation failures.
- Preserve human review and existing RFC 9457 error behavior.
- Run `mvn verify`, `npm ci`, `npm run test:ci`, and `npm run build` before handoff.

---

## File structure

- `backend/src/main/java/com/claimsflow/recommendation/config/OpenAiProperties.java`: non-secret external configuration and defaults.
- `backend/src/main/java/com/claimsflow/recommendation/config/RecommendationProviderConfiguration.java`: wires the single primary provider and HTTP client.
- `backend/src/main/java/com/claimsflow/recommendation/domain/ClaimAnalysisRequest.java`: immutable redacted operational inputs, expanded to include safe claim facts.
- `backend/src/main/java/com/claimsflow/recommendation/domain/OpenAiClaimInsightProvider.java`: Responses API request, structured-response extraction, validation, and fallback.
- `backend/src/main/resources/application.yml`: documents non-secret AI configuration defaults.
- `backend/src/test/java/com/claimsflow/recommendation/domain/OpenAiClaimInsightProviderTest.java`: contract tests for redaction, valid output, and fallback.
- `README.md`: local environment-variable setup and fallback behavior.

### Task 1: Model redacted analysis inputs and configuration

**Files:**
- Create: `backend/src/main/java/com/claimsflow/recommendation/config/OpenAiProperties.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/config/OpenAiApiKey.java`
- Modify: `backend/src/main/java/com/claimsflow/recommendation/domain/ClaimAnalysisRequest.java`
- Modify: `backend/src/main/java/com/claimsflow/recommendation/application/RecommendationService.java`
- Modify: `backend/src/main/resources/application.yml`
- Test: `backend/src/test/java/com/claimsflow/recommendation/domain/ClaimAnalysisRequestTest.java`

**Interfaces:**
- Consumes: `Claim` getters and `CompletenessResult` from the claims capability.
- Produces: `ClaimAnalysisRequest(ClaimType claimType, ClaimStatus status, ClaimPriority priority, boolean assigned, int completenessPercentage, List<String> missingInformation)` with no free text or claimant fields.
- Produces: `OpenAiProperties(String model, Duration timeout)` bound to non-secret `claimsflow.openai` properties and `OpenAiApiKey` read directly from the exact `OPENAI_API_KEY` process environment variable.

- [ ] **Step 1: Write failing redaction test**

```java
@Test
void analysisRequestContainsOperationalFactsButNoClaimantIdentity() {
    var request = ClaimAnalysisRequest.from(claim, completeness);
    assertThat(ClaimAnalysisRequest.class.getRecordComponents())
        .extracting(RecordComponent::getName)
        .containsExactly("claimType", "status", "priority", "assigned",
            "completenessPercentage", "missingInformation");
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd backend; mvn -Dtest=ClaimAnalysisRequestTest test`

Expected: FAIL because `from` and the expanded request shape do not exist.

- [ ] **Step 3: Implement the immutable input and properties**

```java
public record ClaimAnalysisRequest(
    ClaimType claimType, ClaimStatus status, ClaimPriority priority,
    boolean assigned, int completenessPercentage, List<String> missingInformation) {
  public static ClaimAnalysisRequest from(Claim claim, CompletenessResult completeness) { /* copy only safe fields */ }
}

@ConfigurationProperties("claimsflow.openai")
public record OpenAiProperties(String model, Duration timeout) {
  public OpenAiProperties { model = model == null || model.isBlank() ? "gpt-5-nano" : model; timeout = timeout == null ? Duration.ofSeconds(10) : timeout; }
}
```

Update `RecommendationService.generate` to call `ClaimAnalysisRequest.from(claim, completeness)`. Keep only `claimsflow.openai.model` and `timeout` in `application.yml`; obtain the API key directly from `System.getenv("OPENAI_API_KEY")` through the dedicated secret holder.

- [ ] **Step 4: Run the focused test**

Run: `cd backend; mvn -Dtest=ClaimAnalysisRequestTest test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/main/resources/application.yml backend/src/test/java
git commit -m "feat: add redacted AI analysis inputs"
```

### Task 2: Add the OpenAI provider with strict validation and fallback

**Files:**
- Create: `backend/src/main/java/com/claimsflow/recommendation/config/RecommendationProviderConfiguration.java`
- Create: `backend/src/main/java/com/claimsflow/recommendation/domain/OpenAiClaimInsightProvider.java`
- Modify: `backend/src/main/java/com/claimsflow/recommendation/domain/RuleBasedClaimInsightProvider.java`
- Test: `backend/src/test/java/com/claimsflow/recommendation/domain/OpenAiClaimInsightProviderTest.java`

**Interfaces:**
- Consumes: `ClaimInsightProvider.analyze(ClaimAnalysisRequest)`, `OpenAiProperties`, `RestClient`, and `RuleBasedClaimInsightProvider`.
- Produces: one primary `ClaimInsightProvider`; `OpenAiClaimInsightProvider` delegates to `RuleBasedClaimInsightProvider` for all unsafe or unavailable model outcomes.

- [ ] **Step 1: Write failing provider tests**

```java
@Test
void sendsRedactedStructuredRequestAndReturnsValidatedInsight() {
    server.expect(requestTo("https://api.openai.com/v1/responses"))
        .andExpect(header("Authorization", "Bearer test-key"))
        .andExpect(content().string(not(containsString("claimant@example.test"))))
        .andRespond(withSuccess(validResponse("BEGIN_REVIEW"), APPLICATION_JSON));
    assertThat(provider.analyze(request).action()).isEqualTo("BEGIN_REVIEW");
}

@ParameterizedTest
@MethodSource("invalidOrFailedResponses")
void fallsBackForInvalidOrUnavailableModelOutput(ClientHttpResponse response) {
    assertThat(provider.analyze(request)).isEqualTo(ruleBased.analyze(request));
}
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd backend; mvn -Dtest=OpenAiClaimInsightProviderTest test`

Expected: FAIL because the provider and configuration do not exist.

- [ ] **Step 3: Implement strict Responses API handling**

Build a request with `model`, redacted `input`, and `text.format` set to:

```json
{"type":"json_schema","name":"claim_insight","strict":true,"schema":{"type":"object","properties":{"action":{"type":"string","enum":["REQUEST_INFORMATION","ASSIGN_ADJUSTER","BEGIN_REVIEW","PREPARE_DECISION"]},"explanation":{"type":"string","minLength":1,"maxLength":500},"confidence":{"type":"integer","minimum":0,"maximum":100},"missingInformation":{"type":"array","items":{"type":"string"}}},"required":["action","explanation","confidence","missingInformation"],"additionalProperties":false}}
```

Require a completed response envelope with null `error` and `incomplete_details`, exactly one completed message, and exactly one `output_text` content part. Parse its text with Jackson, validate the allow-listed action, explanation bounds, confidence range, and missing-information values. Catch `RestClientException`, parsing/validation exceptions, and non-2xx responses; call `fallback.analyze(request)` in each case. Do not log headers, prompt, raw response, or exception body.

Wire the provider with a `RestClient` rooted at `https://api.openai.com`, and make it the injected `ClaimInsightProvider`; when the key is blank it must immediately delegate without making HTTP requests.

- [ ] **Step 4: Run provider tests**

Run: `cd backend; mvn -Dtest=OpenAiClaimInsightProviderTest test`

Expected: PASS, including no-key, timeout/error, refusal, malformed JSON, unsupported action, and redaction cases.

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java backend/src/test/java
git commit -m "feat: add OpenAI nano recommendation provider"
```

### Task 3: Document and verify the integration

**Files:**
- Modify: `README.md`
- Modify: `docs/architecture.md`
- Test: existing backend and frontend suites

**Interfaces:**
- Consumes: `OPENAI_API_KEY` environment variable and the provider configuration from Tasks 1-2.
- Produces: repeatable local setup instructions that never include a real secret.

- [ ] **Step 1: Update setup documentation**

Add a PowerShell example using a placeholder only:

```powershell
$env:OPENAI_API_KEY = 'your-api-key'
cd backend
mvn spring-boot:run
```

Document that AI calls are redacted, advisory, and automatically fall back to deterministic recommendations when no key is configured or the provider fails.

- [ ] **Step 2: Run backend verification**

Run: `cd backend; mvn verify`

Expected: `BUILD SUCCESS` with all tests passing.

- [ ] **Step 3: Run frontend verification**

Run:

```bash
cd frontend
npm ci
npm run test:ci
npm run build
```

Expected: ChromeHeadless tests pass and the production build succeeds.

- [ ] **Step 4: Review final diff and commit**

Run: `git diff --check; git status --short`

Expected: no whitespace errors and only intended source, test, and documentation changes.

```bash
git add README.md docs/architecture.md
git commit -m "docs: describe AI recommendation setup"
```

## Plan self-review

- Spec coverage: Tasks 1-2 cover opt-in configuration, redacted facts, strict structured output, action validation, and all fallback paths. Task 3 covers documentation and full required verification.
- Placeholder scan: no unresolved requirements are left; all file paths, interfaces, request schema, and commands are explicit.
- Type consistency: `ClaimAnalysisRequest`, `OpenAiProperties`, and `ClaimInsightProvider` are defined once and used consistently throughout the tasks.
