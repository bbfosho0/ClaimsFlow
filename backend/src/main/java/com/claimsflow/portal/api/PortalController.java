package com.claimsflow.portal.api;

import com.claimsflow.portal.application.PortalApplicationService;
import com.claimsflow.portal.domain.EvidenceKind;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portal/claims")
public class PortalController {
    private final PortalApplicationService service;

    public PortalController(PortalApplicationService service) {
        this.service = service;
    }

    @GetMapping("/{claimId}")
    public PortalResponses.PortalClaim get(@PathVariable UUID claimId) {
        return service.get(claimId);
    }

    @PatchMapping("/{claimId}/evidence")
    public PortalResponses.PortalClaim updateEvidence(
            @PathVariable UUID claimId,
            @Valid @RequestBody UpdateEvidenceRequest request) {
        return service.updateEvidence(claimId, request.kind(), request.present(), request.actor());
    }

    @GetMapping("/{claimId}/messages")
    public List<PortalResponses.PortalMessage> messages(@PathVariable UUID claimId) {
        return service.messages(claimId);
    }

    public record UpdateEvidenceRequest(
        @NotNull EvidenceKind kind,
        boolean present,
        @NotBlank @Size(max = 160) String actor) {}
}
