package com.claimsflow.demo.application;

import com.claimsflow.adjuster.application.AdjusterService;
import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.audit.application.AuditService;
import com.claimsflow.claim.domain.*;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationalDemoDatasetService {
    public static final String DATASET_KEY = "EMPLOYER_MVP";
    public static final int DATASET_SIZE = 48;

    private static final String[] ADJUSTER_EMAILS = {
        "maya.chen@example.test",
        "daniel.brooks@example.test",
        "priya.shah@example.test",
        "jordan.lee@example.com"
    };

    private static final String[] GIVEN_NAMES = {
        "Avery", "Jordan", "Morgan", "Taylor", "Casey", "Riley", "Cameron", "Quinn",
        "Drew", "Parker", "Reese", "Skyler"
    };

    private static final String[] FAMILY_NAMES = {
        "Morgan", "Ellis", "Diaz", "Reed", "Patel", "Brooks", "Chen", "Rivera"
    };

    private final ClaimJpaRepository claims;
    private final AdjusterService adjusters;
    private final AuditService audit;
    private final Clock clock;

    public OperationalDemoDatasetService(
            ClaimJpaRepository claims,
            AdjusterService adjusters,
            AuditService audit,
            Clock clock) {
        this.claims = claims;
        this.adjusters = adjusters;
        this.audit = audit;
        this.clock = clock;
    }

    @Transactional
    public void ensureSeeded() {
        if (claims.countByDemoDatasetKey(DATASET_KEY) != DATASET_SIZE) {
            resetHistoricalDataset();
        }
    }

    @Transactional
    public void resetHistoricalDataset() {
        claims.deleteByDemoDatasetKey(DATASET_KEY);
        claims.flush();

        Instant anchor = anchor();
        Map<String, Adjuster> people = new HashMap<>();
        for (String email : ADJUSTER_EMAILS) {
            people.put(email, adjusters.requireActiveByEmail(email));
        }

        for (OperationalSeedScenario scenario : scenarios()) {
            Instant createdAt = anchor.minus(Duration.ofDays(scenario.createdDaysAgo()));
            Instant updatedAt = createdAt.plus(Duration.ofHours(8L + scenario.createdDaysAgo() % 36L));
            Instant resolvedAt = scenario.resolvedHoursAfterCreation() == null
                ? null
                : createdAt.plus(Duration.ofHours(scenario.resolvedHoursAfterCreation()));
            Instant slaDeadline = anchor.plus(Duration.ofHours(scenario.slaOffsetHours()));
            if (resolvedAt != null) {
                long complianceSkew = scenario.key().hashCode() % 3 == 0 ? -8L : 10L;
                slaDeadline = resolvedAt.plus(Duration.ofHours(complianceSkew));
            }

            EvidenceFlags evidence = evidenceFor(scenario.completeness());
            String claimantName = claimantName(scenario.key());
            Claim claim = Claim.createSeeded(
                scenario.stableId(),
                "CLM-DEMO-" + scenario.key(),
                claimantName,
                claimantName.toLowerCase(Locale.ROOT).replace(' ', '.') + "@example.test",
                scenario.claimType(),
                scenario.region(),
                LocalDate.ofInstant(createdAt, ZoneOffset.UTC).minusDays(scenario.incidentDaysBeforeCreation()),
                scenario.estimatedLoss(),
                descriptionFor(scenario.claimType()),
                evidence.incidentReport(),
                evidence.photos(),
                evidence.proofOfOwnership(),
                evidence.medicalDocumentation(),
                scenario.completeness(),
                scenario.priority(),
                scenario.status(),
                scenario.adjusterEmail() == null ? null : people.get(scenario.adjusterEmail()),
                slaDeadline,
                createdAt,
                resolvedAt == null ? updatedAt : resolvedAt,
                resolvedAt,
                DATASET_KEY);

            claims.save(claim);
            audit.record(
                claim,
                "demo-seed",
                "CLAIM_CREATED",
                "Deterministic portfolio claim created",
                null,
                scenario.priority().name(),
                createdAt);
            if (scenario.status() != ClaimStatus.NEW) {
                audit.record(
                    claim,
                    scenario.adjusterEmail() == null ? "operations" : people.get(scenario.adjusterEmail()).getDisplayName(),
                    "STATUS_CHANGED",
                    "Claim advanced through the deterministic operating history",
                    ClaimStatus.NEW.name(),
                    scenario.status().name(),
                    resolvedAt == null ? updatedAt : resolvedAt);
            }
        }
        claims.flush();
    }

    private Instant anchor() {
        return LocalDate.now(clock)
            .atStartOfDay(ZoneOffset.UTC)
            .toInstant()
            .plus(Duration.ofHours(12));
    }

    private List<OperationalSeedScenario> scenarios() {
        List<OperationalSeedScenario> result = new ArrayList<>(DATASET_SIZE);
        ClaimType[] types = ClaimType.values();
        ClaimRegion[] regions = ClaimRegion.values();
        ClaimStatus[] statuses = ClaimStatus.values();
        ClaimPriority[] priorities = ClaimPriority.values();
        int[] completeness = {25, 50, 75, 100};

        for (int index = 0; index < DATASET_SIZE; index++) {
            String key = String.format(Locale.ROOT, "%04d", index + 1);
            ClaimStatus status = statuses[index % statuses.length];
            boolean closed = status == ClaimStatus.RESOLVED || status == ClaimStatus.CLOSED;
            String adjuster = index % 7 == 0 ? null : ADJUSTER_EMAILS[index % ADJUSTER_EMAILS.length];
            int slaOffset = switch (index % 5) {
                case 0 -> -4 - (index % 12);
                case 1 -> 4 + (index % 16);
                default -> 36 + (index % 72);
            };
            result.add(new OperationalSeedScenario(
                key,
                1 + (index * 3) % 90,
                1 + index % 12,
                types[index % types.length],
                regions[index % regions.length],
                BigDecimal.valueOf(3_500L + index * 1_425L),
                status,
                priorities[index % priorities.length],
                completeness[index % completeness.length],
                adjuster,
                slaOffset,
                closed ? 14 + (index * 7) % 110 : null));
        }
        return List.copyOf(result);
    }

    private String claimantName(String key) {
        int number = Integer.parseInt(key);
        return GIVEN_NAMES[number % GIVEN_NAMES.length] + " " + FAMILY_NAMES[number % FAMILY_NAMES.length];
    }

    private String descriptionFor(ClaimType type) {
        return switch (type) {
            case AUTO -> "Vehicle collision with documented exterior damage and a pending repair assessment.";
            case PROPERTY -> "Property loss with documented damage, evidence follow-up, and an active coverage review.";
            case PERSONAL_INJURY -> "Personal injury claim with incident context, medical evidence, and an active review timeline.";
        };
    }

    private EvidenceFlags evidenceFor(int completeness) {
        return switch (completeness) {
            case 100 -> new EvidenceFlags(true, true, true, true);
            case 75 -> new EvidenceFlags(true, true, true, false);
            case 50 -> new EvidenceFlags(true, true, false, false);
            default -> new EvidenceFlags(true, false, false, false);
        };
    }

    private record EvidenceFlags(
        boolean incidentReport,
        boolean photos,
        boolean proofOfOwnership,
        boolean medicalDocumentation) {}
}
