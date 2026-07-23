package com.claimsflow.recommendation.domain;

public interface ClaimInsightProvider {
    ClaimInsight analyze(ClaimAnalysisRequest request);
}
