package com.claimsflow.recommendation.domain;

import com.claimsflow.claim.domain.Claim;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recommendations")
public class Recommendation {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;

    @Column(nullable = false, length = 80)
    private String recommendedAction;

    @Column(nullable = false, length = 1200)
    private String explanation;

    @Column(nullable = false)
    private int confidence;

    @Column(length = 1000)
    private String missingInformation;

    @Column(nullable = false)
    private Instant generatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RecommendationReviewState reviewState;

    @Column(length = 160)
    private String reviewerName;

    private Instant reviewedAt;

    protected Recommendation() {}

    public static Recommendation pending(Claim claim, String action, String explanation, int confidence, String missingInformation, Instant now) {
        Recommendation recommendation = new Recommendation();
        recommendation.id = UUID.randomUUID();
        recommendation.claim = claim;
        recommendation.recommendedAction = action;
        recommendation.explanation = explanation;
        recommendation.confidence = confidence;
        recommendation.missingInformation = missingInformation;
        recommendation.generatedAt = now;
        recommendation.reviewState = RecommendationReviewState.PENDING;
        return recommendation;
    }

    public void review(RecommendationReviewState decision, String reviewerName, Instant now) {
        this.reviewState = decision;
        this.reviewerName = reviewerName;
        this.reviewedAt = now;
    }

    public UUID getId() { return id; }
    public Claim getClaim() { return claim; }
    public String getRecommendedAction() { return recommendedAction; }
    public String getExplanation() { return explanation; }
    public int getConfidence() { return confidence; }
    public String getMissingInformation() { return missingInformation; }
    public Instant getGeneratedAt() { return generatedAt; }
    public RecommendationReviewState getReviewState() { return reviewState; }
    public String getReviewerName() { return reviewerName; }
    public Instant getReviewedAt() { return reviewedAt; }
}
