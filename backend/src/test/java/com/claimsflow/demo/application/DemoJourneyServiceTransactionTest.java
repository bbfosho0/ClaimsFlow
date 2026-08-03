package com.claimsflow.demo.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.application.ClaimApplicationService.CreateClaimCommand;
import com.claimsflow.claim.domain.ClaimType;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import com.claimsflow.portal.application.PortalApplicationService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.flyway.enabled=true",
    "claimsflow.demo.enabled=true"
})
class DemoJourneyServiceTransactionTest {
    private static final UUID JORDAN_ID = UUID.fromString("00000000-0000-0000-0000-0000000000a1");

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired DemoJourneyService demo;
    @Autowired ClaimApplicationService claims;
    @Autowired ClaimJpaRepository repository;
    @Autowired PortalApplicationService portal;

    @Test
    void twoResetsLeaveOneReservedClaimAndPreserveUnrelatedData() {
        var unrelated = claims.create(new CreateClaimCommand(
            "Unrelated Policyholder",
            "unrelated.policyholder@example.test",
            ClaimType.AUTO,
            LocalDate.now().minusDays(30),
            new BigDecimal("4500.00"),
            "Unrelated seeded test claim that must survive the demo reset.",
            true,
            true,
            false,
            false));

        var first = demo.reset();
        var second = demo.reset();

        assertThat(first.claimId()).isNotEqualTo(second.claimId());
        assertThat(repository.findById(first.claimId())).isEmpty();
        assertThat(repository.findById(unrelated.getId())).isPresent();
        assertThat(repository.findAllByClaimantEmail(DemoJourneyService.CLAIMANT_EMAIL)).hasSize(1);

        var current = repository.findOneById(second.claimId()).orElseThrow();
        assertThat(current.getClaimantName()).isEqualTo("Taylor Reed");
        assertThat(current.getAssignedAdjuster()).isNotNull();
        assertThat(current.getAssignedAdjuster().getId()).isEqualTo(JORDAN_ID);
        assertThat(second.adjusterId()).isEqualTo(JORDAN_ID);
        assertThat(portal.messages(second.claimId())).hasSize(1);
        assertThat(portal.messages(second.claimId()).getFirst().body()).contains("Add photos");
    }
}
