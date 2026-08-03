package com.claimsflow.evidence.api;

import com.claimsflow.claim.domain.*;
import com.claimsflow.evidence.application.EvidenceOperationsService;
import com.claimsflow.evidence.api.EvidenceOperationsResponses.EvidenceOperationsSnapshot;
import com.claimsflow.operations.application.*;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/evidence-operations")
public class EvidenceOperationsController {
    private final EvidenceOperationsService service;
    private final OperationalFilterFactory filters;

    public EvidenceOperationsController(
            EvidenceOperationsService service,
            OperationalFilterFactory filters) {
        this.service = service;
        this.filters = filters;
    }

    @GetMapping
    public EvidenceOperationsSnapshot get(
            @RequestParam(required = false) UUID selectedClaimId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) ClaimType claimType,
            @RequestParam(required = false) ClaimPriority priority,
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(required = false) UUID adjusterId,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) ClaimRegion region) {
        return service.snapshot(
            filters.create(
                from, to, claimType, priority, status,
                adjusterId, team, region, false),
            selectedClaimId);
    }
}
