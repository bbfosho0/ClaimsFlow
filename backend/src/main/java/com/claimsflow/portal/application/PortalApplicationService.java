package com.claimsflow.portal.application;

import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.portal.api.PortalResponses;
import com.claimsflow.portal.domain.EvidenceKind;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortalApplicationService {
    private final ClaimApplicationService claims;
    private final AuditService audit;

    public PortalApplicationService(ClaimApplicationService claims, AuditService audit) {
        this.claims = claims;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public PortalResponses.PortalClaim get(UUID claimId) {
        return PortalResponses.claim(claims.get(claimId), audit.forClaim(claimId));
    }

    @Transactional
    public PortalResponses.PortalClaim updateEvidence(
            UUID claimId,
            EvidenceKind kind,
            boolean present,
            String actor) {
        var claim = claims.updateEvidence(claimId, kind, present, actor);
        return PortalResponses.claim(claim, audit.forClaim(claimId));
    }
}
