package com.claimsflow.demo.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.claimsflow.adjuster.application.AdjusterService;
import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.application.ClaimApplicationService.CreateClaimCommand;
import com.claimsflow.claim.domain.Claim;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import com.claimsflow.portal.application.PortalApplicationService;
import com.claimsflow.portal.domain.MessageAudience;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class DemoJourneyServiceTest {
    @Test
    void resetDeletesOnlyTheReservedEmailAndBuildsTheApprovedJourney() {
        ClaimJpaRepository repository = mock(ClaimJpaRepository.class);
        ClaimApplicationService claims = mock(ClaimApplicationService.class);
        AdjusterService adjusters = mock(AdjusterService.class);
        PortalApplicationService portal = mock(PortalApplicationService.class);
        DemoJourneyService service = new DemoJourneyService(repository, claims, adjusters, portal);

        Claim claim = mock(Claim.class);
        UUID claimId = UUID.fromString("00000000-0000-0000-0000-000000000111");
        when(claim.getId()).thenReturn(claimId);
        when(claim.getClaimNumber()).thenReturn("CLM-2026-DEMO01");
        when(claims.create(any(CreateClaimCommand.class))).thenReturn(claim);
        when(claims.assign(eq(claimId), any(UUID.class), eq("demo reset"))).thenReturn(claim);

        Adjuster adjuster = mock(Adjuster.class);
        UUID adjusterId = UUID.fromString("00000000-0000-0000-0000-0000000000a1");
        when(adjuster.getId()).thenReturn(adjusterId);
        when(adjusters.requireActiveByEmail(DemoJourneyService.ADJUSTER_EMAIL)).thenReturn(adjuster);

        var snapshot = service.reset();

        verify(repository).deleteByClaimantEmail("taylor.reed@example.com");
        verify(repository).flush();
        ArgumentCaptor<CreateClaimCommand> command = ArgumentCaptor.forClass(CreateClaimCommand.class);
        verify(claims).create(command.capture());
        assertThat(command.getValue().claimantName()).isEqualTo("Taylor Reed");
        assertThat(command.getValue().claimantEmail()).isEqualTo("taylor.reed@example.com");
        assertThat(command.getValue().photosPresent()).isFalse();
        assertThat(command.getValue().proofOfOwnershipPresent()).isFalse();
        verify(claims).assign(claimId, adjusterId, "demo reset");
        verify(portal).addMessage(
            eq(claimId),
            eq("Jordan Lee"),
            eq(MessageAudience.CLAIMANT),
            any(String.class));

        assertThat(snapshot.claimId()).isEqualTo(claimId);
        assertThat(snapshot.adjusterId()).isEqualTo(adjusterId);
        assertThat(snapshot.claimantRoute()).isEqualTo("/portal/claims/" + claimId);
        assertThat(snapshot.adjusterRoute()).isEqualTo("/app/claims/" + claimId + "?role=adjuster");
        assertThat(snapshot.managerRoute()).isEqualTo("/app/dashboard?role=manager");
        assertThat(snapshot.administratorRoute()).isEqualTo("/app/workflows?role=admin");
    }

    @Test
    void repeatedCallsAlwaysRunTheSameScopedReplacementSequence() {
        ClaimJpaRepository repository = mock(ClaimJpaRepository.class);
        ClaimApplicationService claims = mock(ClaimApplicationService.class);
        AdjusterService adjusters = mock(AdjusterService.class);
        PortalApplicationService portal = mock(PortalApplicationService.class);
        DemoJourneyService service = new DemoJourneyService(repository, claims, adjusters, portal);

        Claim claim = mock(Claim.class);
        UUID claimId = UUID.randomUUID();
        when(claim.getId()).thenReturn(claimId);
        when(claim.getClaimNumber()).thenReturn("CLM-2026-DEMO02");
        when(claims.create(any(CreateClaimCommand.class))).thenReturn(claim);
        when(claims.assign(eq(claimId), any(UUID.class), eq("demo reset"))).thenReturn(claim);
        Adjuster adjuster = mock(Adjuster.class);
        when(adjuster.getId()).thenReturn(UUID.randomUUID());
        when(adjusters.requireActiveByEmail(DemoJourneyService.ADJUSTER_EMAIL)).thenReturn(adjuster);

        service.reset();
        service.reset();

        verify(repository, times(2)).deleteByClaimantEmail(DemoJourneyService.CLAIMANT_EMAIL);
        verify(repository, times(2)).flush();
        verify(claims, times(2)).create(any(CreateClaimCommand.class));
    }
}
