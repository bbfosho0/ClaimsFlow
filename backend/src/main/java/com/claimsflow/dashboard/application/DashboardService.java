package com.claimsflow.dashboard.application;

import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.domain.*;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {
    private static final List<ClaimStatus> CLOSED = List.of(ClaimStatus.RESOLVED, ClaimStatus.CLOSED);
    private final ClaimJpaRepository claims;
    private final AdjusterJpaRepository adjusters;
    private final AuditService audit;
    private final Clock clock = Clock.systemUTC();

    public DashboardService(ClaimJpaRepository claims, AdjusterJpaRepository adjusters, AuditService audit) {
        this.claims = claims;
        this.adjusters = adjusters;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public DashboardSnapshot snapshot() {
        Instant now = clock.instant();
        var workload = adjusters.findByActiveTrueOrderByDisplayNameAsc().stream()
            .map(adjuster -> new Workload(adjuster.getId(), adjuster.getDisplayName(), claims.countByAssignedAdjuster_IdAndStatusNotIn(adjuster.getId(), CLOSED), adjuster.getWorkloadCapacity()))
            .sorted(Comparator.comparingLong(Workload::activeClaims).reversed().thenComparing(Workload::displayName))
            .toList();
        var recent = audit.recent().stream().map(event -> new Activity(event.getActor(), event.getActionType(), event.getSummary(), event.getOccurredAt())).toList();
        return new DashboardSnapshot(
            claims.countByStatusNotIn(CLOSED),
            claims.countByPriorityInAndStatusNotIn(List.of(ClaimPriority.HIGH, ClaimPriority.CRITICAL), CLOSED),
            claims.countBySlaDeadlineBetweenAndStatusNotIn(now, now.plus(Duration.ofHours(24)), CLOSED),
            claims.countByAssignedAdjusterIsNullAndStatusNotIn(CLOSED),
            claims.countByCompletenessPercentageLessThanAndStatusNotIn(100, CLOSED),
            workload,
            recent);
    }

    public record Workload(UUID adjusterId, String displayName, long activeClaims, int capacity) {}
    public record Activity(String actor, String actionType, String summary, Instant occurredAt) {}
    public record DashboardSnapshot(long openClaims, long highPriorityClaims, long slaRiskClaims, long unassignedClaims, long incompleteClaims, List<Workload> workload, List<Activity> recentActivity) {}
}
