package com.claimsflow.adjuster.api;

import com.claimsflow.adjuster.application.AdjusterService;
import com.claimsflow.adjuster.domain.Adjuster;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adjusters")
public class AdjusterController {
    private final AdjusterService service;
    public AdjusterController(AdjusterService service) { this.service = service; }

    @GetMapping
    public List<AdjusterResponse> list() { return service.active().stream().map(AdjusterResponse::from).toList(); }

    public record AdjusterResponse(UUID id, String displayName, String email, String role, int workloadCapacity) {
        public static AdjusterResponse from(Adjuster adjuster) {
            return new AdjusterResponse(adjuster.getId(), adjuster.getDisplayName(), adjuster.getEmail(), adjuster.getRole(), adjuster.getWorkloadCapacity());
        }
    }
}
