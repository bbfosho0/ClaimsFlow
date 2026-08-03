package com.claimsflow.team.api;

import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.api.OperationalResponses.OperationalFilterOptions;
import java.time.Instant;
import java.util.*;

public final class TeamOperationsResponses {
    private TeamOperationsResponses() {}

    public record TeamOperationsSnapshot(
        Instant generatedAt,
        OperationalFilterOptions options,
        TeamKpis kpis,
        List<TeamWorkload> teams,
        List<AdjusterWorkload> adjusters,
        List<Escalation> escalations,
        List<Advisory> advisories,
        IntegrityScore integrity) {}

    public record TeamKpis(
        long activeClaims,
        long atRiskClaims,
        long overdueClaims,
        int slaCompliancePercentage,
        int evidenceReadinessPercentage,
        int assignmentCoveragePercentage,
        int overallUtilizationPercentage) {}

    public record TeamWorkload(
        String name,
        long activeClaims,
        int capacity,
        int utilizationPercentage,
        int evidenceReadinessPercentage,
        int slaCompliancePercentage) {}

    public record AdjusterWorkload(
        UUID adjusterId,
        String displayName,
        String team,
        long activeClaims,
        int capacity,
        int utilizationPercentage) {}

    public record Escalation(
        UUID claimId,
        String claimNumber,
        String claimantName,
        ClaimPriority priority,
        ClaimStatus status,
        Instant slaDeadline,
        String reason,
        String tone) {}

    public record Advisory(
        String title,
        String detail,
        String route,
        Map<String, String> queryParams,
        String tone) {}

    public record IntegrityScore(
        int overall,
        int slaCompliance,
        int evidenceReadiness,
        int assignmentCoverage,
        String label) {}
}
