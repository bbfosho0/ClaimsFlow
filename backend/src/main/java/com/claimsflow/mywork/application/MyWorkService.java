package com.claimsflow.mywork.application;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.operations.application.OperationalFilters;
import com.claimsflow.operations.application.OperationalMetrics;
import com.claimsflow.operations.application.OperationalMetrics.SlaState;
import com.claimsflow.operations.application.OperationalQueryService;
import com.claimsflow.mywork.api.MyWorkResponses.MyWorkClaim;
import com.claimsflow.mywork.api.MyWorkResponses.MyWorkSnapshot;
import com.claimsflow.mywork.api.MyWorkResponses.MyWorkTimelineItem;
import com.claimsflow.mywork.api.MyWorkResponses.WorkloadPoint;
import com.claimsflow.shared.error.ResourceNotFoundException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MyWorkService {
    private final OperationalQueryService query;
    private final AdjusterJpaRepository adjusters;
    private final Clock clock;

    public MyWorkService(
            OperationalQueryService query,
            AdjusterJpaRepository adjusters,
            Clock clock) {
        this.query = query;
        this.adjusters = adjusters;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public MyWorkSnapshot snapshot(UUID adjusterId) {
        Instant now = clock.instant();
        LocalDate today = LocalDate.ofInstant(now, ZoneOffset.UTC);
        Adjuster adjuster = adjusters.findById(adjusterId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "ADJUSTER_NOT_FOUND",
                "Adjuster was not found."));
        OperationalFilters filters = new OperationalFilters(
            today.minusDays(365),
            today,
            null,
            null,
            null,
            adjusterId,
            null,
            null,
            false);
        List<Claim> claims = query.find(filters);
        List<Claim> open = claims.stream()
            .filter(OperationalMetrics::isOpen)
            .sorted(Comparator
                .comparingInt((Claim claim) -> rank(claim, now))
                .thenComparing(Claim::getSlaDeadline)
                .thenComparing(Claim::getClaimNumber))
            .toList();

        long dueWithin24Hours = open.stream()
            .filter(claim -> OperationalMetrics.slaState(claim, now) == SlaState.AT_RISK)
            .count();
        long overdue = open.stream()
            .filter(claim -> OperationalMetrics.slaState(claim, now) == SlaState.OVERDUE)
            .count();
        long evidenceBlocked = open.stream()
            .filter(claim -> claim.getCompletenessPercentage() < 100)
            .count();
        int utilization = Math.min(100, OperationalMetrics.percent(open.size(), adjuster.getWorkloadCapacity()));

        return new MyWorkSnapshot(
            now,
            adjuster.getId(),
            adjuster.getDisplayName(),
            adjuster.getTeam(),
            adjuster.getWorkloadCapacity(),
            open.size(),
            dueWithin24Hours,
            overdue,
            evidenceBlocked,
            utilization,
            workloadTrend(claims, today, now),
            open.stream().map(claim -> timeline(claim, now)).toList(),
            open.stream().map(this::summary).toList());
    }

    private List<WorkloadPoint> workloadTrend(List<Claim> claims, LocalDate today, Instant now) {
        return today.minusDays(6).datesUntil(today.plusDays(1)).map(date -> {
            Instant asOf = date.equals(today)
                ? now
                : date.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant().minusNanos(1);
            long active = claims.stream()
                .filter(claim -> !claim.getCreatedAt().isAfter(asOf))
                .filter(claim -> claim.getResolvedAt() == null || claim.getResolvedAt().isAfter(asOf))
                .count();
            return new WorkloadPoint(date, active);
        }).toList();
    }

    private MyWorkTimelineItem timeline(Claim claim, Instant now) {
        SlaState state = OperationalMetrics.slaState(claim, now);
        String group = switch (state) {
            case OVERDUE, AT_RISK -> "NOW";
            case CURRENT -> LocalDate.ofInstant(claim.getSlaDeadline(), ZoneOffset.UTC)
                .equals(LocalDate.ofInstant(now, ZoneOffset.UTC)) ? "TODAY" : "LATER";
            case CLOSED -> "LATER";
        };
        String reason = switch (state) {
            case OVERDUE -> "Service-level deadline has passed";
            case AT_RISK -> "Service-level deadline is due within 24 hours";
            case CURRENT -> claim.getCompletenessPercentage() < 100
                ? "Evidence remains incomplete"
                : "Continue scheduled claim review";
            case CLOSED -> "Resolved claim";
        };
        String tone = switch (state) {
            case OVERDUE -> "critical";
            case AT_RISK -> "warning";
            case CURRENT -> claim.getCompletenessPercentage() < 100 ? "advisory" : "live";
            case CLOSED -> "healthy";
        };
        return new MyWorkTimelineItem(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getPriority(),
            claim.getStatus(),
            claim.getSlaDeadline(),
            claim.getCompletenessPercentage(),
            group,
            reason,
            tone);
    }

    private MyWorkClaim summary(Claim claim) {
        return new MyWorkClaim(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getClaimType(),
            claim.getRegion(),
            claim.getPriority(),
            claim.getStatus(),
            claim.getSlaDeadline(),
            claim.getCompletenessPercentage(),
            claim.getCreatedAt(),
            claim.getUpdatedAt());
    }

    private int rank(Claim claim, Instant now) {
        return switch (OperationalMetrics.slaState(claim, now)) {
            case OVERDUE -> 0;
            case AT_RISK -> 1;
            case CURRENT -> claim.getCompletenessPercentage() < 100 ? 2 : 3;
            case CLOSED -> 4;
        };
    }
}
