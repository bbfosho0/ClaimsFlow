package com.claimsflow.operations.application;

import com.claimsflow.claim.domain.*;
import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public final class OperationalFilterFactory {
    private final Clock clock;

    public OperationalFilterFactory(Clock clock) {
        this.clock = clock;
    }

    public OperationalFilters create(
            LocalDate from,
            LocalDate to,
            ClaimType claimType,
            ClaimPriority priority,
            ClaimStatus status,
            UUID adjusterId,
            String team,
            ClaimRegion region,
            boolean unassigned) {
        LocalDate effectiveTo = to == null ? LocalDate.now(clock) : to;
        LocalDate effectiveFrom = from == null ? effectiveTo.minusDays(29) : from;
        if (effectiveFrom.isAfter(effectiveTo)) {
            throw new IllegalArgumentException("from must not be after to");
        }
        if (ChronoUnit.DAYS.between(effectiveFrom, effectiveTo) > 366) {
            throw new IllegalArgumentException("date range must not exceed 366 days");
        }
        if (unassigned && adjusterId != null) {
            throw new IllegalArgumentException("unassigned and adjusterId cannot be combined");
        }
        String effectiveTeam = team == null || team.isBlank() ? null : team.trim();
        return new OperationalFilters(
            effectiveFrom,
            effectiveTo,
            claimType,
            priority,
            status,
            adjusterId,
            effectiveTeam,
            region,
            unassigned);
    }
}
