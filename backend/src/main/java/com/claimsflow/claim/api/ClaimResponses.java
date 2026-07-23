package com.claimsflow.claim.api;

import com.claimsflow.adjuster.api.AdjusterController.AdjusterResponse;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.domain.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.springframework.data.domain.Page;

public final class ClaimResponses {
    private ClaimResponses() {}

    public static ClaimDetail detail(Claim claim, ClaimApplicationService service) {
        var complete = service.completeness().evaluate(claim.getClaimType(), claim.isIncidentReportPresent(), claim.isPhotosPresent(), claim.isProofOfOwnershipPresent(), claim.isMedicalDocumentationPresent());
        var triage = service.priority().evaluate(claim.getClaimType(), claim.getEstimatedLoss(), claim.getIncidentDate(), complete.percentage(), claim.getSlaDeadline(), service.now());
        return new ClaimDetail(claim.getId(), claim.getClaimNumber(), claim.getClaimantName(), claim.getClaimantEmail(), claim.getClaimType(), claim.getIncidentDate(), claim.getEstimatedLoss(), claim.getDescription(), new Evidence(claim.isIncidentReportPresent(), claim.isPhotosPresent(), claim.isProofOfOwnershipPresent(), claim.isMedicalDocumentationPresent()), claim.getCompletenessPercentage(), complete.missingEvidence(), claim.getPriority(), triage.factors(), claim.getStatus(), service.transitions().allowedNext(claim.getStatus()), claim.getAssignedAdjuster() == null ? null : AdjusterResponse.from(claim.getAssignedAdjuster()), claim.getSlaDeadline(), claim.getCreatedAt(), claim.getUpdatedAt(), claim.getVersion());
    }

    public static ClaimPage page(Page<Claim> page) {
        return new ClaimPage(page.getContent().stream().map(ClaimResponses::summary).toList(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    private static ClaimSummary summary(Claim claim) {
        return new ClaimSummary(claim.getId(), claim.getClaimNumber(), claim.getClaimantName(), claim.getClaimType(), claim.getPriority(), claim.getStatus(), claim.getAssignedAdjuster() == null ? null : claim.getAssignedAdjuster().getDisplayName(), claim.getSlaDeadline(), claim.getCompletenessPercentage());
    }

    public record Evidence(boolean incidentReportPresent, boolean photosPresent, boolean proofOfOwnershipPresent, boolean medicalDocumentationPresent) {}
    public record ClaimSummary(UUID id, String claimNumber, String claimantName, ClaimType claimType, ClaimPriority priority, ClaimStatus status, String assignedAdjusterName, Instant slaDeadline, int completenessPercentage) {}
    public record ClaimPage(List<ClaimSummary> content, int page, int size, long totalElements, int totalPages) {}
    public record ClaimDetail(UUID id, String claimNumber, String claimantName, String claimantEmail, ClaimType claimType, LocalDate incidentDate, BigDecimal estimatedLoss, String description, Evidence evidence, int completenessPercentage, List<String> missingEvidence, ClaimPriority priority, List<String> priorityFactors, ClaimStatus status, Set<ClaimStatus> allowedNextStatuses, AdjusterResponse assignedAdjuster, Instant slaDeadline, Instant createdAt, Instant updatedAt, long version) {}
}
