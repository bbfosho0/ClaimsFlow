package com.claimsflow.dashboard.api;

import com.claimsflow.dashboard.application.DashboardService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping
    public DashboardService.DashboardSnapshot get() { return service.snapshot(); }
}
