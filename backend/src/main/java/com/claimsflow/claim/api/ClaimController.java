package com.claimsflow.claim.api;

import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.claim.application.ClaimApplicationService.CreateClaimCommand;
import com.claimsflow.claim.domain.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private final ClaimApplicationService service;
    public ClaimController(ClaimApplicationService service) { this.service = service; }

    @GetMapping
    public ClaimResponses.ClaimPage list(
        @RequestParam(required = false) String q,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
        @RequestParam(required = false) ClaimType claimType,
        @RequestParam(required = false) ClaimStatus status,
        @RequestParam(required = false) ClaimPriority priority,
        @RequestParam(required = false) String assignment,
        @RequestParam(required = false) UUID adjusterId,
        @RequestParam(required = false) String team,
        @RequestParam(required = false) ClaimRegion region,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        var page = service.list(
            q, from, to, claimType, status, priority, assignment,
            adjusterId, team, region, pageable);
        var allMatching = service.listAllMatching(
            q, from, to, claimType, status, priority, assignment,
            adjusterId, team, region);
        return ClaimResponses.page(page, allMatching, service.now());
    }

    @PostMapping
    public ResponseEntity<ClaimResponses.ClaimDetail> create(@Valid @RequestBody CreateClaimRequest request) {
        var claim = service.create(request.toCommand());
        return ResponseEntity.status(HttpStatus.CREATED).body(ClaimResponses.detail(claim, service));
    }

    @GetMapping("/{claimId}")
    public ClaimResponses.ClaimDetail get(@PathVariable UUID claimId) { return ClaimResponses.detail(service.get(claimId), service); }

    @PatchMapping("/{claimId}/assignment")
    public ClaimResponses.ClaimDetail assign(@PathVariable UUID claimId, @Valid @RequestBody AssignmentRequest request) {
        return ClaimResponses.detail(service.assign(claimId, request.adjusterId(), request.actor()), service);
    }

    @PatchMapping("/{claimId}/status")
    public ClaimResponses.ClaimDetail status(@PathVariable UUID claimId, @Valid @RequestBody StatusRequest request) {
        return ClaimResponses.detail(service.updateStatus(claimId, request.status(), request.actor()), service);
    }

    public record CreateClaimRequest(
        @NotBlank @Size(max = 160) String claimantName,
        @NotBlank @Email @Size(max = 200) String claimantEmail,
        @NotNull ClaimType claimType,
        @NotNull @PastOrPresent LocalDate incidentDate,
        @NotNull @DecimalMin("0.00") BigDecimal estimatedLoss,
        @NotBlank @Size(min = 20, max = 2000) String description,
        boolean incidentReportPresent,
        boolean photosPresent,
        boolean proofOfOwnershipPresent,
        boolean medicalDocumentationPresent) {
        CreateClaimCommand toCommand() { return new CreateClaimCommand(claimantName, claimantEmail, claimType, incidentDate, estimatedLoss, description, incidentReportPresent, photosPresent, proofOfOwnershipPresent, medicalDocumentationPresent); }
    }

    public record AssignmentRequest(@NotNull UUID adjusterId, @NotBlank @Size(max = 160) String actor) {}
    public record StatusRequest(@NotNull ClaimStatus status, @NotBlank @Size(max = 160) String actor) {}
}
