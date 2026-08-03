package com.claimsflow.operations.application;

import com.claimsflow.adjuster.persistence.AdjusterJpaRepository;
import com.claimsflow.operations.api.OperationalResponses;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OperationalFilterOptionsService {
    private final AdjusterJpaRepository adjusters;

    public OperationalFilterOptionsService(AdjusterJpaRepository adjusters) {
        this.adjusters = adjusters;
    }

    @Transactional(readOnly = true)
    public OperationalResponses.OperationalFilterOptions options() {
        return OperationalResponses.options(adjusters.findByActiveTrueOrderByDisplayNameAsc());
    }
}
