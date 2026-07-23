package com.claimsflow.audit.persistence;

import com.claimsflow.audit.domain.AuditEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditEventJpaRepository extends JpaRepository<AuditEvent, UUID> {
    List<AuditEvent> findByClaim_IdOrderByOccurredAtDesc(UUID claimId);
    List<AuditEvent> findTop10ByOrderByOccurredAtDesc();
}
