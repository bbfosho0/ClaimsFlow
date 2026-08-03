package com.claimsflow.operations.application;

import com.claimsflow.claim.domain.*;
import java.time.LocalDate;
import java.util.UUID;

public record OperationalFilters(
    LocalDate from,
    LocalDate to,
    ClaimType claimType,
    ClaimPriority priority,
    ClaimStatus status,
    UUID adjusterId,
    String team,
    ClaimRegion region,
    boolean unassigned) {}
