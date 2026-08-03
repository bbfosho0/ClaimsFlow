package com.claimsflow.adjuster.application;

import com.claimsflow.adjuster.domain.Adjuster;
import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.shared.error.ResourceNotFoundException;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdjusterService {
    private final AdjusterJpaRepository repository;
    public AdjusterService(AdjusterJpaRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<Adjuster> active() { return repository.findByActiveTrueOrderByDisplayNameAsc(); }

    @Transactional(readOnly = true)
    public Adjuster requireActive(UUID id) {
        Adjuster adjuster = repository.findById(id).orElseThrow(() -> notFound());
        if (!adjuster.isActive()) throw notFound();
        return adjuster;
    }

    @Transactional(readOnly = true)
    public Adjuster requireActiveByEmail(String email) {
        Adjuster adjuster = repository.findByEmail(email).orElseThrow(() -> notFound());
        if (!adjuster.isActive()) throw notFound();
        return adjuster;
    }

    private ResourceNotFoundException notFound() {
        return new ResourceNotFoundException("ADJUSTER_NOT_FOUND", "Adjuster was not found or is not active.");
    }
}
