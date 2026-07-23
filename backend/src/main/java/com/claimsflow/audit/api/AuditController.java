package com.claimsflow.audit.api;

import com.claimsflow.audit.application.AuditService;
import com.claimsflow.audit.domain.AuditEvent;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/claims/{claimId}/audit")
public class AuditController {
    private final AuditService service;
    public AuditController(AuditService service) { this.service = service; }

    @GetMapping
    public List<AuditResponse> list(@PathVariable UUID claimId) {
        return service.forClaim(claimId).stream().map(AuditResponse::from).toList();
    }

    public record AuditResponse(UUID id, String actor, String actionType, String summary, String previousValue, String newValue, Instant occurredAt) {
        static AuditResponse from(AuditEvent event) {
            return new AuditResponse(event.getId(), event.getActor(), event.getActionType(), event.getSummary(), event.getPreviousValue(), event.getNewValue(), event.getOccurredAt());
        }
    }
}
