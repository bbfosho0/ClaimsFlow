package com.claimsflow.recommendation.application;

import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.recommendation.domain.*;
import com.claimsflow.recommendation.persistence.RecommendationJpaRepository;
import com.claimsflow.shared.error.*;
import java.time.Clock;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecommendationService {
    private final RecommendationJpaRepository recommendations;
    private final ClaimApplicationService claims;
    private final ClaimInsightProvider provider;
    private final AuditService audit;
    private final Clock clock;

    public RecommendationService(RecommendationJpaRepository recommendations, ClaimApplicationService claims, ClaimInsightProvider provider, AuditService audit) {
        this.recommendations = recommendations;
        this.claims = claims;
        this.provider = provider;
        this.audit = audit;
        this.clock = Clock.systemUTC();
    }

    @Transactional
    public Recommendation generate(UUID claimId) {
        Claim claim = claims.get(claimId);
        var completeness = claims.completeness().evaluate(claim.getClaimType(), claim.isIncidentReportPresent(), claim.isPhotosPresent(), claim.isProofOfOwnershipPresent(), claim.isMedicalDocumentationPresent());
        ClaimInsight insight = provider.analyze(ClaimAnalysisRequest.from(claim, completeness));
        var recommendation = Recommendation.pending(claim, insight.action(), insight.explanation(), insight.confidence(), String.join("|", insight.missingInformation()), clock.instant());
        recommendations.save(recommendation);
        audit.record(claim, "system", "RECOMMENDATION_GENERATED", "Decision-support recommendation generated", null, insight.action(), clock.instant());
        return recommendation;
    }

    @Transactional
    public Recommendation review(UUID claimId, UUID recommendationId, RecommendationReviewState decision, String reviewer) {
        if (decision == RecommendationReviewState.PENDING) throw new DomainConflictException("INVALID_REVIEW_DECISION", "A recommendation must be approved or rejected.");
        Recommendation recommendation = recommendations.findByIdAndClaim_Id(recommendationId, claimId)
            .orElseThrow(() -> new ResourceNotFoundException("RECOMMENDATION_NOT_FOUND", "Recommendation was not found."));
        if (recommendation.getReviewState() != RecommendationReviewState.PENDING) throw new DomainConflictException("RECOMMENDATION_ALREADY_REVIEWED", "Only pending recommendations may be reviewed.");
        recommendation.review(decision, reviewer, clock.instant());
        audit.record(recommendation.getClaim(), reviewer, "RECOMMENDATION_REVIEWED", "Human review recorded", "PENDING", decision.name(), clock.instant());
        return recommendation;
    }
}
