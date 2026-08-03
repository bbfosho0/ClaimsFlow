package com.claimsflow.portal.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.claimsflow.adjuster.application.AdjusterService;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.domain.ClaimPriority;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import com.claimsflow.portal.domain.EvidenceKind;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class PortalApplicationServiceTest {
    @Test
    void evidenceChangeRecalculatesDerivedFieldsAndRecordsAudit() {
        ClaimJpaRepository repository = mock(ClaimJpaRepository.class);
        AdjusterService adjusters = mock(AdjusterService.class);
        AuditService audit = mock(AuditService.class);
        ClaimApplicationService claims = new ClaimApplicationService(repository, adjusters, audit);
        PortalApplicationService portal = new PortalApplicationService(claims, audit);

        Instant initialTime = Instant.parse("2026-01-10T12:00:00Z");
        Claim claim = Claim.create(
            "CLM-2026-DEMO01",
            "Taylor Reed",
            "taylor.reed@example.com",
            ClaimType.PROPERTY,
            LocalDate.of(2025, 12, 1),
            new BigDecimal("6000.00"),
            "Water damage affected the kitchen cabinets and flooring.",
            true,
            true,
            false,
            false,
            50,
            ClaimPriority.MEDIUM,
            initialTime.plusSeconds(72 * 3600),
            initialTime);

        when(repository.findOneById(claim.getId())).thenReturn(Optional.of(claim));
        when(audit.forClaim(claim.getId())).thenReturn(List.of());
        Instant previousSla = claim.getSlaDeadline();

        var response = portal.updateEvidence(
            claim.getId(),
            EvidenceKind.PROOF_OF_OWNERSHIP,
            true,
            "Taylor Reed");

        assertThat(claim.isProofOfOwnershipPresent()).isTrue();
        assertThat(claim.getCompletenessPercentage()).isEqualTo(100);
        assertThat(claim.getPriority()).isEqualTo(ClaimPriority.LOW);
        assertThat(claim.getSlaDeadline()).isAfter(previousSla);
        assertThat(claim.getUpdatedAt()).isAfter(initialTime);
        assertThat(response.completenessPercentage()).isEqualTo(100);
        assertThat(response.evidence().proofOfOwnershipPresent()).isTrue();
        assertThat(response.nextAction()).contains("ready for review");

        verify(audit).record(
            eq(claim),
            eq("Taylor Reed"),
            eq("EVIDENCE_UPDATED"),
            contains("Proof of ownership"),
            eq("PROOF_OF_OWNERSHIP=false"),
            eq("PROOF_OF_OWNERSHIP=true"),
            any(Instant.class));
    }
}
