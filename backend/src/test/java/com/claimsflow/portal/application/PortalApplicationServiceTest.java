package com.claimsflow.portal.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
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
import com.claimsflow.portal.domain.ClaimMessage;
import com.claimsflow.portal.domain.EvidenceKind;
import com.claimsflow.portal.domain.MessageAudience;
import com.claimsflow.portal.persistence.ClaimMessageJpaRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class PortalApplicationServiceTest {
    @Test
    void evidenceChangeRecalculatesDerivedFieldsAndRecordsAudit() {
        TestContext context = context();
        Claim claim = propertyClaim();
        when(context.repository.findOneById(claim.getId())).thenReturn(Optional.of(claim));
        when(context.audit.forClaim(claim.getId())).thenReturn(List.of());
        Instant previousSla = claim.getSlaDeadline();

        var response = context.portal.updateEvidence(
            claim.getId(),
            EvidenceKind.PROOF_OF_OWNERSHIP,
            true,
            "Taylor Reed");

        assertThat(claim.isProofOfOwnershipPresent()).isTrue();
        assertThat(claim.getCompletenessPercentage()).isEqualTo(100);
        assertThat(claim.getPriority()).isEqualTo(ClaimPriority.LOW);
        assertThat(claim.getSlaDeadline()).isAfter(previousSla);
        assertThat(response.evidence().proofOfOwnershipPresent()).isTrue();
        assertThat(response.nextAction()).contains("ready for review");

        verify(context.audit).record(
            eq(claim),
            eq("Taylor Reed"),
            eq("EVIDENCE_UPDATED"),
            contains("Proof of ownership"),
            eq("PROOF_OF_OWNERSHIP=false"),
            eq("PROOF_OF_OWNERSHIP=true"),
            any(Instant.class));
    }

    @Test
    void portalMessagesExcludeInternalNotesEvenIfTheRepositoryReturnsOne() {
        TestContext context = context();
        Claim claim = propertyClaim();
        when(context.repository.findOneById(claim.getId())).thenReturn(Optional.of(claim));
        ClaimMessage claimant = ClaimMessage.create(
            claim,
            "Jordan Lee",
            MessageAudience.CLAIMANT,
            "Please upload photos of the damaged flooring.",
            Instant.parse("2026-08-02T15:00:00Z"));
        ClaimMessage internal = ClaimMessage.create(
            claim,
            "Jordan Lee",
            MessageAudience.INTERNAL,
            "Escalate if the repair estimate exceeds the reserve.",
            Instant.parse("2026-08-02T15:05:00Z"));
        when(context.messages.findByClaim_IdAndAudienceOrderByCreatedAtAsc(
            claim.getId(), MessageAudience.CLAIMANT))
            .thenReturn(List.of(claimant, internal));

        var visible = context.portal.messages(claim.getId());

        assertThat(visible).hasSize(1);
        assertThat(visible.getFirst().body()).contains("upload photos");
        assertThat(visible).noneMatch(message -> message.body().contains("reserve"));
    }

    @Test
    void addingAClaimantMessageTrimsContentAndRecordsAClaimantSafeAuditEvent() {
        TestContext context = context();
        Claim claim = propertyClaim();
        when(context.repository.findOneById(claim.getId())).thenReturn(Optional.of(claim));
        when(context.messages.save(any(ClaimMessage.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = context.portal.addMessage(
            claim.getId(),
            "  Jordan Lee  ",
            MessageAudience.CLAIMANT,
            "  Please upload a clear photo of the damaged flooring.  ");

        ArgumentCaptor<ClaimMessage> saved = ArgumentCaptor.forClass(ClaimMessage.class);
        verify(context.messages).save(saved.capture());
        assertThat(saved.getValue().getAuthor()).isEqualTo("Jordan Lee");
        assertThat(saved.getValue().getBody()).isEqualTo("Please upload a clear photo of the damaged flooring.");
        assertThat(response.author()).isEqualTo("Jordan Lee");
        assertThat(response.body()).doesNotStartWith(" ").doesNotEndWith(" ");

        verify(context.audit).record(
            eq(claim),
            eq("Jordan Lee"),
            eq("MESSAGE_ADDED"),
            eq("Message added to claimant portal"),
            isNull(),
            eq("CLAIMANT"),
            any(Instant.class));
    }

    private TestContext context() {
        ClaimJpaRepository repository = mock(ClaimJpaRepository.class);
        AdjusterService adjusters = mock(AdjusterService.class);
        AuditService audit = mock(AuditService.class);
        ClaimMessageJpaRepository messages = mock(ClaimMessageJpaRepository.class);
        ClaimApplicationService claims = new ClaimApplicationService(repository, adjusters, audit);
        return new TestContext(
            repository,
            audit,
            messages,
            new PortalApplicationService(claims, audit, messages));
    }

    private Claim propertyClaim() {
        Instant initialTime = Instant.parse("2026-01-10T12:00:00Z");
        return Claim.create(
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
    }

    private record TestContext(
        ClaimJpaRepository repository,
        AuditService audit,
        ClaimMessageJpaRepository messages,
        PortalApplicationService portal) {}
}
