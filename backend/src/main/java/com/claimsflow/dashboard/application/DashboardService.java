package com.claimsflow.dashboard.application;

import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.application.OperationalQueryService;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private static final Set<ClaimStatus> CLOSED = EnumSet.of(ClaimStatus.RESOLVED, ClaimStatus.CLOSED);

    private final OperationalQueryService operational;
    private final AdjusterJpaRepository adjusters;
    private final AuditService audit;
    private final Clock clock;

    public DashboardService(
            OperationalQueryService operational,
            AdjusterJpaRepository adjusters,
            AuditService audit,
            Clock clock) {
        this.operational = operational;
        this.adjusters = adjusters;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public DashboardSnapshot snapshot() {
        Instant now = clock.instant();
        List<Claim> all = operational.findAllForDashboard();
        List<Claim> open = all.stream().filter(this::isOpen).toList();

        long high = open.stream().filter(this::isHighPriority).count();
        long atRisk = open.stream().filter(claim -> isWithin24Hours(claim, now)).count();
        long overdue = open.stream().filter(claim -> claim.getSlaDeadline().isBefore(now)).count();
        long unassigned = open.stream().filter(claim -> claim.getAssignedAdjuster() == null).count();
        long incomplete = open.stream().filter(claim -> claim.getCompletenessPercentage() < 100).count();
        int readiness = open.isEmpty()
            ? 100
            : (int) Math.round(open.stream().mapToInt(Claim::getCompletenessPercentage).average().orElse(100));
        int activePercent = percent(open.size(), all.size());

        Map<UUID, Long> activeByAdjuster = new HashMap<>();
        for (Claim claim : open) {
            if (claim.getAssignedAdjuster() != null) {
                activeByAdjuster.merge(claim.getAssignedAdjuster().getId(), 1L, Long::sum);
            }
        }

        List<Workload> workload = adjusters.findByActiveTrueOrderByDisplayNameAsc().stream()
            .map(adjuster -> new Workload(
                adjuster.getId(),
                adjuster.getDisplayName(),
                adjuster.getTeam(),
                activeByAdjuster.getOrDefault(adjuster.getId(), 0L),
                adjuster.getWorkloadCapacity()))
            .sorted(Comparator.comparingLong(Workload::activeClaims).reversed().thenComparing(Workload::displayName))
            .toList();

        List<Activity> recent = audit.recent().stream()
            .map(event -> new Activity(
                event.getClaim().getId(),
                event.getActor(),
                event.getActionType(),
                event.getSummary(),
                event.getOccurredAt()))
            .toList();

        List<SignalCount> signals = List.of(
            new SignalCount("SLA", "critical", atRisk + overdue),
            new SignalCount("EVIDENCE", "warning", incomplete),
            new SignalCount("OWNERSHIP", "live", unassigned),
            new SignalCount("PRIORITY", "advisory", high),
            new SignalCount("ADVISORY", "healthy", Math.max(0, open.size() - high)));

        return new DashboardSnapshot(
            now,
            all.size(),
            open.size(),
            high,
            atRisk,
            overdue,
            unassigned,
            incomplete,
            readiness,
            activePercent,
            signals,
            workload,
            recent);
    }

    private boolean isOpen(Claim claim) {
        return !CLOSED.contains(claim.getStatus());
    }

    private boolean isHighPriority(Claim claim) {
        return claim.getPriority() == ClaimPriority.HIGH || claim.getPriority() == ClaimPriority.CRITICAL;
    }

    private boolean isWithin24Hours(Claim claim, Instant now) {
        return !claim.getSlaDeadline().isBefore(now)
            && !claim.getSlaDeadline().isAfter(now.plus(Duration.ofHours(24)));
    }

    private int percent(long numerator, long denominator) {
        if (denominator == 0) return 0;
        return (int) Math.round(numerator * 100.0 / denominator);
    }

    public record SignalCount(String category, String tone, long count) {}
    public record Workload(UUID adjusterId, String displayName, String team, long activeClaims, int capacity) {}
    public record Activity(UUID claimId, String actor, String actionType, String summary, Instant occurredAt) {}
    public record DashboardSnapshot(
        Instant generatedAt,
        long totalClaims,
        long openClaims,
        long highPriorityClaims,
        long slaRiskClaims,
        long overdueClaims,
        long unassignedClaims,
        long incompleteClaims,
        int evidenceReadinessPercentage,
        int activePortfolioPercentage,
        List<SignalCount> signalCounts,
        List<Workload> workload,
        List<Activity> recentActivity) {}
}
