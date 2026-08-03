package com.claimsflow.operations.application;

import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimStatus;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

public final class OperationalMetrics {
    private static final Set<ClaimStatus> CLOSED_STATUSES = EnumSet.of(ClaimStatus.RESOLVED, ClaimStatus.CLOSED);
    private static final Duration AT_RISK_WINDOW = Duration.ofHours(24);

    private OperationalMetrics() {}

    public enum SlaState {
        CURRENT,
        AT_RISK,
        OVERDUE,
        CLOSED
    }

    public static boolean isOpen(Claim claim) {
        return !CLOSED_STATUSES.contains(claim.getStatus());
    }

    public static int percent(long numerator, long denominator) {
        if (denominator <= 0) return 0;
        return (int) Math.round(numerator * 100.0 / denominator);
    }

    public static int averageCompleteness(List<Claim> claims) {
        if (claims.isEmpty()) return 0;
        return (int) Math.round(
            claims.stream()
                .mapToInt(Claim::getCompletenessPercentage)
                .average()
                .orElse(0));
    }

    public static int slaCompliance(List<Claim> claims) {
        List<Claim> resolved = claims.stream()
            .filter(claim -> claim.getResolvedAt() != null)
            .toList();
        if (resolved.isEmpty()) return 100;
        long within = resolved.stream()
            .filter(claim -> !claim.getResolvedAt().isAfter(claim.getSlaDeadline()))
            .count();
        return percent(within, resolved.size());
    }

    public static SlaState slaState(Claim claim, Instant now) {
        if (!isOpen(claim)) return SlaState.CLOSED;
        if (claim.getSlaDeadline().isBefore(now)) return SlaState.OVERDUE;
        if (!claim.getSlaDeadline().isAfter(now.plus(AT_RISK_WINDOW))) return SlaState.AT_RISK;
        return SlaState.CURRENT;
    }

    public static long ageDays(Claim claim, Instant now) {
        return Math.max(0, Duration.between(claim.getCreatedAt(), now).toDays());
    }
}
