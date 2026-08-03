package com.claimsflow.analytics.api;

import com.claimsflow.analytics.application.AnalyticsService;
import com.claimsflow.analytics.api.AnalyticsResponses.AnalyticsSnapshot;
import com.claimsflow.claim.domain.*;
import com.claimsflow.operations.application.*;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService service;
    private final OperationalFilterFactory filters;

    public AnalyticsController(AnalyticsService service, OperationalFilterFactory filters) {
        this.service = service;
        this.filters = filters;
    }

    @GetMapping
    public AnalyticsSnapshot get(
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
