package com.claimsflow.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.claim.persistence.ClaimJpaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = "spring.flyway.enabled=true")
class SchemaIntegrationTest {
    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired AdjusterJpaRepository adjusters;
    @Autowired ClaimJpaRepository claims;
    @Autowired JdbcTemplate jdbc;

    @Test
    void flywayCreatesSchemaAndSeedData() {
        assertThat(adjusters.count()).isGreaterThan(0);
        assertThat(claims.count()).isGreaterThan(0);
        assertThat(adjusters.findByEmail("jordan.lee@example.com")).isPresent();

        Integer messageTables = jdbc.queryForObject(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'claim_messages'",
            Integer.class);
        Integer messageIndexes = jdbc.queryForObject(
            "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_claim_messages_claim_time'",
            Integer.class);

        assertThat(messageTables).isEqualTo(1);
        assertThat(messageIndexes).isEqualTo(1);
    }
}
