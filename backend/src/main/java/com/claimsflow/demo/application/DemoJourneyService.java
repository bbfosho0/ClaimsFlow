package com.claimsflow.demo.application;

import com.claimsflow.adjuster.application.AdjusterService;
import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.application.ClaimApplicationService.CreateClaimCommand;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import com.claimsflow.demo.api.DemoResponses;
import com.claimsflow.portal.application.PortalApplicationService;
import com.claimsflow.portal.domain.MessageAudience;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DemoJourneyService {
    public static final String CLAIMANT_EMAIL = "taylor.reed@example.com";
    public static final String ADJUSTER_EMAIL = "jordan.lee@example.com";

    private final ClaimJpaRepository repository;
    private final ClaimApplicationService claims;
    private final AdjusterService adjusters;
    private final PortalApplicationService portal;
    private final OperationalDemoDatasetService dataset;
    private final Clock clock;

    @Autowired
    public DemoJourneyService(
            ClaimJpaRepository repository,
            ClaimApplicationService claims,
            AdjusterService adjusters,
            PortalApplicationService portal,
            OperationalDemoDatasetService dataset,
            Clock clock) {
        this.repository = repository;
        this.claims = claims;
        this.adjusters = adjusters;
        this.portal = portal;
        this.dataset = dataset;
        this.clock = clock;
    }

    public DemoJourneyService(
            ClaimJpaRepository repository,
            ClaimApplicationService claims,
            AdjusterService adjusters,
            PortalApplicationService portal) {
        this(repository, claims, adjusters, portal, null, Clock.systemUTC());
    }

    @Transactional
    public DemoResponses.DemoJourneySnapshot reset() {
        if (dataset != null) dataset.ensureSeeded();
        repository.deleteByClaimantEmail(CLAIMANT_EMAIL);
        repository.flush();

        LocalDate incidentDate = LocalDate.now(clock).minusDays(4);
        var claim = claims.create(new CreateClaimCommand(
            "Taylor Reed",
            CLAIMANT_EMAIL,
            ClaimType.PROPERTY,
            incidentDate,
            new BigDecimal("24500.00"),
            "A supply-line leak damaged the kitchen flooring, lower cabinets, and adjacent drywall.",
            true,
            false,
            false,
            false));

        var adjuster = adjusters.requireActiveByEmail(ADJUSTER_EMAIL);
        claim = claims.assign(claim.getId(), adjuster.getId(), "demo reset");
        portal.addMessage(
            claim.getId(),
            "Jordan Lee",
            MessageAudience.CLAIMANT,
            "Your claim is ready. Add photos and proof of ownership so the review can continue.");

        String claimId = claim.getId().toString();
        return new DemoResponses.DemoJourneySnapshot(
            claim.getId(),
            claim.getClaimNumber(),
            adjuster.getId(),
            "/portal/claims/" + claimId,
            "/app/claims/" + claimId + "?role=adjuster",
            "/app/dashboard?role=manager",
            "/app/workflows?role=admin");
    }
}
