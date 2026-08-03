package com.claimsflow.claim.api;

import com.claimsflow.adjuster.api.AdjusterController.AdjusterResponse;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimStatus;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.domain.ClaimRegion;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;

public final class ClaimResponses {
    private static final Set<ClaimStatus> CLOSED = Set.of(ClaimStatus.RESOLVED, ClaimStatus.CLOSED);

    private ClaimResponses() {}

    public static ClaimDetail detail(Claim claim, ClaimApplicationService service) {
        var complete = service.completeness().evaluate(claim.getClaimType(), claim.isIncidentReportPresent(), claim.isPhotosPresent(), claim.isProofOfOwnershipPresent(), claim.isMedicalDocumentationPresent());
        var triage = service.priority().evaluate(claim.getClaimType(), claim.getEstimatedLoss(), claim.getIncidentDate(), complete.percentage(), claim.getSlaDeadline(), service.now());
        return new ClaimDetail(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getClaimantEmail(),
            claim.getClaimType(),
            claim.getRegion(),
            claim.getIncidentDate(),
            claim.getEstimatedLoss(),
            claim.getDescription(),
            new Evidence(claim.isIncidentReportPresent(), claim.isPhotosPresent(), claim.isProofOfOwnershipPresent(), claim.isMedicalDocumentationPresent()),
            claim.getCompletenessPercentage(),
            complete.missingEvidence(),
            claim.getPriority(),
            triage.factors(),
            claim.getStatus(),
            service.transitions().allowedNext(claim.getStatus()),
            claim.getAssignedAdjuster() == null ? null : AdjusterResponse.from(claim.getAssignedAdjuster()),
            claim.getSlaDeadline(),
            claim.getCreatedAt(),
            claim.getUpdatedAt(),
            claim.getResolvedAt(),
            claim.getVersion());
    }

    public static ClaimPage page(Page<Claim> page) {
        return new ClaimPage(
            page.getContent().stream().map(ClaimResponses::summary).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            null);
    }

    public static ClaimPage page(Page<Claim> page, List<Claim> allMatching, Instant now) {
        return new ClaimPage(
            page.getContent().stream().map(ClaimResponses::summary).toList(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            queueSummary(allMatching, now));
    }

    public static QueueSummary queueSummary(List<Claim> claims, Instant now) {
        List<Claim> open = claims.stream().filter(claim -> !CLOSED.contains(claim.getStatus())).toList();
        long atRisk = open.stream().filter(claim -> isAtRisk(claim, now)).count();
        long overdue = open.stream().filter(claim -> !claim.getSlaDeadline().isAfter(now)).count();
        long unassigned = open.stream().filter(claim -> claim.getAssignedAdjuster() == null).count();
        int readiness = open.isEmpty()
            ? 100
            : (int) Math.round(open.stream().mapToInt(Claim::getCompletenessPercentage).average().orElse(100));
        Map<ClaimPriority, Long> priorities = claims.stream().collect(Collectors.groupingBy(
            Claim::getPriority,
            () -> new EnumMap<>(ClaimPriority.class),
            Collectors.counting()));
        List<DistributionPoint> distribution = Arrays.stream(ClaimPriority.values())
            .map(priority -> new DistributionPoint(
                priority.name(),
                humanize(priority.name()),
                priorities.getOrDefault(priority, 0L),
                percent(priorities.getOrDefault(priority, 0L), claims.size())))
            .toList();
        return new QueueSummary(claims.size(), atRisk, overdue, unassigned, readiness, distribution);
    }

    private static boolean isAtRisk(Claim claim, Instant now) {
        Duration remaining = Duration.between(now, claim.getSlaDeadline());
        return !remaining.isNegative()
            && !remaining.isZero()
            && remaining.compareTo(Duration.ofHours(24)) <= 0;
    }

    private static int percent(long numerator, long denominator) {
        return denominator == 0 ? 0 : (int) Math.round(numerator * 100.0 / denominator);
    }

    private static String humanize(String value) {
        String text = value.toLowerCase(Locale.ROOT).replace('_', ' ');
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }

    private static ClaimSummary summary(Claim claim) {
        return new ClaimSummary(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getClaimType(),
            claim.getRegion(),
            claim.getPriority(),
            claim.getStatus(),
            claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getDisplayName(),
            claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getTeam(),
            claim.getSlaDeadline(),
            claim.getCompletenessPercentage(),
            claim.getCreatedAt(),
            claim.getUpdatedAt());
    }

    public record Evidence(boolean incidentReportPresent, boolean photosPresent, boolean proofOfOwnershipPresent, boolean medicalDocumentationPresent) {}
    public record ClaimSummary(
        UUID id,
        String claimNumber,
        String claimantName,
        ClaimType claimType,
        ClaimRegion region,
        ClaimPriority priority,
        ClaimStatus status,
        String assignedAdjusterName,
        String assignedTeam,
        Instant slaDeadline,
        int completenessPercentage,
        Instant createdAt,
        Instant updatedAt) {}
    public record DistributionPoint(String key, String label, long count, int percentage) {}
    public record QueueSummary(
        long totalMatching,
        long atRiskClaims,
        long overdueClaims,
        long unassignedClaims,
        int evidenceReadinessPercentage,
        List<DistributionPoint> priorityDistribution) {}
    public record ClaimPage(
        List<ClaimSummary> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        QueueSummary summary) {}
    public record ClaimDetail(
        UUID id,
        String claimNumber,
        String claimantName,
        String claimantEmail,
        ClaimType claimType,
        ClaimRegion region,
        LocalDate incidentDate,
        BigDecimal estimatedLoss,
        String description,
        Evidence evidence,
        int completenessPercentage,
        List<String> missingEvidence,
        ClaimPriority priority,
        List<String> priorityFactors,
        ClaimStatus status,
        Set<ClaimStatus> allowedNextStatuses,
        AdjusterResponse assignedAdjuster,
        Instant slaDeadline,
        Instant createdAt,
        Instant updatedAt,
        Instant resolvedAt,
        long version) {}
}
