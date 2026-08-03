package com.claimsflow.adjuster.persistence;

import com.claimsflow.adjuster.domain.Adjuster;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdjusterJpaRepository extends JpaRepository<Adjuster, UUID> {
    List<Adjuster> findByActiveTrueOrderByDisplayNameAsc();
    Optional<Adjuster> findByEmail(String email);
}
