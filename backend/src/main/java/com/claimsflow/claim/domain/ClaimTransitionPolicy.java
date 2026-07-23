package com.claimsflow.claim.domain;

import java.util.*;

public final class ClaimTransitionPolicy {
    private static final Map<ClaimStatus, Set<ClaimStatus>> ALLOWED = Map.of(
        ClaimStatus.NEW, Set.of(ClaimStatus.UNDER_REVIEW, ClaimStatus.WAITING_FOR_INFORMATION),
        ClaimStatus.UNDER_REVIEW, Set.of(ClaimStatus.WAITING_FOR_INFORMATION, ClaimStatus.READY_FOR_DECISION),
        ClaimStatus.WAITING_FOR_INFORMATION, Set.of(ClaimStatus.UNDER_REVIEW),
        ClaimStatus.READY_FOR_DECISION, Set.of(ClaimStatus.RESOLVED),
        ClaimStatus.RESOLVED, Set.of(ClaimStatus.CLOSED),
        ClaimStatus.CLOSED, Set.of()
    );

    public boolean canTransition(ClaimStatus current, ClaimStatus next) {
        return ALLOWED.getOrDefault(current, Set.of()).contains(next);
    }

    public Set<ClaimStatus> allowedNext(ClaimStatus current) {
        return Set.copyOf(ALLOWED.getOrDefault(current, Set.of()));
    }
}
