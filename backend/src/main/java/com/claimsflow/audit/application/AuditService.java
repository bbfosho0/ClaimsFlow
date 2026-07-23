package com.claimsflow.audit.application;

import com.claimsflow.audit.domain.AuditEvent;
import com.claimsflow.audit.persistence.AuditEventJpaRepository;
import com.claimsflow.claim.domain.Claim;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    private final AuditEventJpaRepository repository;

    public AuditService(AuditEventJpaRepository repository) { this.repository = repository; }

    public AuditEvent record(Claim claim, String actor, String action, String summary, String previousValue, String newValue, Instant now) {
        return repository.save(AuditEvent.record(claim, actor, action, summary, previousValue, newValue, now));
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> forClaim(UUID claimId) { return repository.findByClaim_IdOrderByOccurredAtDesc(claimId); }

    @Transactional(readOnly = true)
    public List<AuditEvent> recent() { return repository.findTop10ByOrderByOccurredAtDesc(); }
}
