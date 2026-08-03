package com.claimsflow.team.api;

import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.application.*;
import com.claimsflow.team.application.TeamOperationsService;
import com.claimsflow.team.api.TeamOperationsResponses.TeamOperationsSnapshot;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/team-operations")
public class TeamOperationsController {
    private final TeamOperationsService service;
    private final OperationalFilterFactory filters;

    public TeamOperationsController(
            TeamOperationsService service,
            OperationalFilterFactory filters) {
        this.service = service;
        this.filters = filters;
    }

    @GetMapping
    public TeamOperationsSnapshot get(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) ClaimType claimType,
            @RequestParam(required = false) ClaimPriority priority,
            @RequestParam(required = false) ClaimStatus status,
            @RequestParam(required = false) UUID adjusterId,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) ClaimRegion region) {
        return service.snapshot(filters.create(
            from, to, claimType, priority, status,
            adjusterId, team, region, false));
    }
}
