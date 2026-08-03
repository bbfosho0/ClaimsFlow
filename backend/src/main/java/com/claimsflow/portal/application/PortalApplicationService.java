package com.claimsflow.portal.application;

import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.portal.api.PortalResponses;
import com.claimsflow.portal.domain.ClaimMessage;
import com.claimsflow.portal.domain.EvidenceKind;
import com.claimsflow.portal.domain.MessageAudience;
import com.claimsflow.portal.persistence.ClaimMessageJpaRepository;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PortalApplicationService {
    private final ClaimApplicationService claims;
    private final AuditService audit;
    private final ClaimMessageJpaRepository messages;
    private final Clock clock = Clock.systemUTC();

    public PortalApplicationService(
            ClaimApplicationService claims,
            AuditService audit,
            ClaimMessageJpaRepository messages) {
        this.claims = claims;
        this.audit = audit;
        this.messages = messages;
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

    @Transactional(readOnly = true)
    public List<PortalResponses.PortalMessage> messages(UUID claimId) {
        claims.get(claimId);
        var visibleMessages = messages.findByClaim_IdAndAudienceOrderByCreatedAtAsc(
                claimId,
                MessageAudience.CLAIMANT)
            .stream()
            .filter(message -> message.getAudience() == MessageAudience.CLAIMANT)
            .toList();
        return PortalResponses.messages(visibleMessages);
    }

    @Transactional
    public PortalResponses.PortalMessage addMessage(
            UUID claimId,
            String author,
            MessageAudience audience,
            String body) {
        var claim = claims.get(claimId);
        Instant now = clock.instant();
        var message = messages.save(ClaimMessage.create(
            claim,
            author.trim(),
            audience,
            body.trim(),
            now));

        String summary = audience == MessageAudience.CLAIMANT
            ? "Message added to claimant portal"
            : "Internal claim note added";
        audit.record(
            claim,
            author.trim(),
            "MESSAGE_ADDED",
            summary,
            null,
            audience.name(),
            now);
        return PortalResponses.message(message);
    }
}
