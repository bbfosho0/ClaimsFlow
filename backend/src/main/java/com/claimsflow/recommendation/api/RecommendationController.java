package com.claimsflow.recommendation.api;

import com.claimsflow.recommendation.application.RecommendationService;
import com.claimsflow.recommendation.domain.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/claims/{claimId}/recommendations")
public class RecommendationController {
    private final RecommendationService service;
    public RecommendationController(RecommendationService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecommendationResponse generate(@PathVariable UUID claimId) { return RecommendationResponse.from(service.generate(claimId)); }

    @PatchMapping("/{recommendationId}")
    public RecommendationResponse review(@PathVariable UUID claimId, @PathVariable UUID recommendationId, @Valid @RequestBody ReviewRequest request) {
        return RecommendationResponse.from(service.review(claimId, recommendationId, request.decision(), request.reviewer()));
    }

    public record ReviewRequest(@NotNull RecommendationReviewState decision, @NotBlank @Size(max = 160) String reviewer) {}

    public record RecommendationResponse(UUID id, String recommendedAction, String explanation, int confidence, List<String> missingInformation, Instant generatedAt, RecommendationReviewState reviewState, String reviewerName, Instant reviewedAt) {
        static RecommendationResponse from(Recommendation recommendation) {
            List<String> missing = recommendation.getMissingInformation() == null || recommendation.getMissingInformation().isBlank() ? List.of() : Arrays.asList(recommendation.getMissingInformation().split("\\|"));
            return new RecommendationResponse(recommendation.getId(), recommendation.getRecommendedAction(), recommendation.getExplanation(), recommendation.getConfidence(), missing, recommendation.getGeneratedAt(), recommendation.getReviewState(), recommendation.getReviewerName(), recommendation.getReviewedAt());
        }
    }
}
