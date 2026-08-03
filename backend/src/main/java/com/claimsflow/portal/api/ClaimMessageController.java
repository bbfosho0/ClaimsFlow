package com.claimsflow.portal.api;

import com.claimsflow.portal.application.PortalApplicationService;
import com.claimsflow.portal.domain.MessageAudience;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/claims/{claimId}/messages")
public class ClaimMessageController {
    private final PortalApplicationService service;

    public ClaimMessageController(PortalApplicationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PortalResponses.PortalMessage add(
            @PathVariable UUID claimId,
            @Valid @RequestBody CreateMessageRequest request) {
        return service.addMessage(
            claimId,
            request.author(),
            request.audience(),
            request.body());
    }

    public record CreateMessageRequest(
        @NotBlank @Size(max = 160) String author,
        @NotNull MessageAudience audience,
        @NotBlank @Size(max = 1200) String body) {}
}
