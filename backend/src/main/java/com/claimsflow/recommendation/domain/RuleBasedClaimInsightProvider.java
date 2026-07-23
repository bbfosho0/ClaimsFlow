package com.claimsflow.recommendation.domain;

import com.claimsflow.claim.domain.ClaimStatus;
public class RuleBasedClaimInsightProvider implements ClaimInsightProvider {
    @Override
    public ClaimInsight analyze(ClaimAnalysisRequest request) {
        if (!request.missingInformation().isEmpty()) {
            return new ClaimInsight("REQUEST_INFORMATION", "Collect the required evidence before the claim advances.", 96, request.missingInformation());
        }
        if (!request.assigned()) {
            return new ClaimInsight("ASSIGN_ADJUSTER", "Assign an active adjuster so review can begin.", 94, request.missingInformation());
        }
        if (request.status() == ClaimStatus.NEW) {
            return new ClaimInsight("BEGIN_REVIEW", "Evidence is complete and the claim is ready for adjuster review.", 90, request.missingInformation());
        }
        return new ClaimInsight("PREPARE_DECISION", "The claim is assigned and complete; prepare the next valid decision step.", 86, request.missingInformation());
    }
}
