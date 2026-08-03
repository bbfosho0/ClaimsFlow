package com.claimsflow.portal.api;

import com.claimsflow.audit.domain.AuditEvent;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.portal.domain.ClaimMessage;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public final class PortalResponses {
    private static final Set<String> CLAIMANT_VISIBLE_ACTIONS = Set.of(
        "CLAIM_CREATED",
        "EVIDENCE_UPDATED",
        "STATUS_CHANGED"
    );

    private PortalResponses() {}

    public static PortalClaim claim(Claim claim, List<AuditEvent> auditEvents) {
        List<PortalTimelineEvent> timeline = auditEvents.stream()
            .filter(event -> CLAIMANT_VISIBLE_ACTIONS.contains(event.getActionType()))
            .map(event -> new PortalTimelineEvent(
                event.getActionType(),
                event.getSummary(),
                event.getOccurredAt()))
            .toList();

        return new PortalClaim(
            claim.getId(),
            claim.getClaimNumber(),
            claim.getClaimantName(),
            claim.getClaimType().name(),
            claim.getStatus().name(),
            claim.getCompletenessPercentage(),
            claim.getSlaDeadline(),
            new PortalEvidence(
                claim.isIncidentReportPresent(),
                claim.isPhotosPresent(),
                claim.isProofOfOwnershipPresent(),
                claim.isMedicalDocumentationPresent()),
            timeline,
            nextAction(claim));
    }

    public static PortalMessage message(ClaimMessage message) {
        return new PortalMessage(
            message.getId(),
            message.getAuthor(),
            message.getBody(),
            message.getCreatedAt());
    }

    public static List<PortalMessage> messages(List<ClaimMessage> messages) {
        return messages.stream().map(PortalResponses::message).toList();
    }

    private static String nextAction(Claim claim) {
        if (claim.getCompletenessPercentage() < 100) {
            return "Add the requested evidence to keep your claim moving.";
        }
        return switch (claim.getStatus()) {
            case NEW -> "Your claim is ready for review by the claims team.";
            case UNDER_REVIEW, READY_FOR_DECISION -> "Your claims team is reviewing the information you provided.";
            case WAITING_FOR_INFORMATION -> "Review the requested information and add any missing evidence.";
            case RESOLVED -> "Your claims team has completed its decision review.";
            case CLOSED -> "This claim is closed. Contact support if you still need assistance.";
        };
    }

    public record PortalEvidence(
        boolean incidentReportPresent,
        boolean photosPresent,
        boolean proofOfOwnershipPresent,
        boolean medicalDocumentationPresent) {}

    public record PortalTimelineEvent(
        String actionType,
        String summary,
        Instant occurredAt) {}

    public record PortalClaim(
        UUID claimId,
        String claimNumber,
        String claimantName,
        String claimType,
        String status,
        int completenessPercentage,
        Instant slaDeadline,
        PortalEvidence evidence,
        List<PortalTimelineEvent> timeline,
        String nextAction) {}

    public record PortalMessage(
        UUID id,
        String author,
        String body,
        Instant createdAt) {}
}
