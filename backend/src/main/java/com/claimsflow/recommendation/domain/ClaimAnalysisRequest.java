package com.claimsflow.recommendation.domain;

import com.claimsflow.claim.domain.*;
import java.util.List;

public record ClaimAnalysisRequest(ClaimStatus status, ClaimPriority priority, boolean assigned, int completenessPercentage, List<String> missingInformation) {}
