package com.claimsflow.recommendation.domain;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.domain.CompletenessPolicy.CompletenessResult;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ClaimAnalysisRequest(
        ClaimType claimType,
        ClaimStatus status,
        ClaimPriority priority,
        boolean assigned,
        int completenessPercentage,
        List<String> missingInformation,
        BigDecimal estimatedLoss,
        LocalDate incidentDate,
        String description) {

    public ClaimAnalysisRequest {
        missingInformation = List.copyOf(missingInformation);
    }

    public static ClaimAnalysisRequest from(Claim claim, CompletenessResult completeness) {
        return new ClaimAnalysisRequest(
                claim.getClaimType(),
                claim.getStatus(),
                claim.getPriority(),
                claim.getAssignedAdjuster() != null,
                completeness.percentage(),
                completeness.missingEvidence(),
                claim.getEstimatedLoss(),
                claim.getIncidentDate(),
                claim.getDescription());
    }
}
