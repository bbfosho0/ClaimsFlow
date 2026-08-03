package com.claimsflow.demo.application;

import com.claimsflow.claim.domain.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

public record OperationalSeedScenario(
    String key,
    int createdDaysAgo,
    int incidentDaysBeforeCreation,
    ClaimType claimType,
    ClaimRegion region,
    BigDecimal estimatedLoss,
    ClaimStatus status,
    ClaimPriority priority,
    int completeness,
    String adjusterEmail,
    int slaOffsetHours,
    Integer resolvedHoursAfterCreation) {

    public UUID stableId() {
        return UUID.nameUUIDFromBytes(("claimsflow:" + key).getBytes(StandardCharsets.UTF_8));
    }
}
