package com.claimsflow.portal.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.claimsflow.portal.application.PortalApplicationService;
import com.claimsflow.portal.domain.EvidenceKind;
import com.claimsflow.shared.error.GlobalExceptionHandler;
import com.claimsflow.shared.error.ResourceNotFoundException;
import com.claimsflow.shared.web.RequestIdFilter;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(PortalController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class PortalControllerWebTest {
    private static final UUID CLAIM_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private PortalApplicationService service;

    @Test
    void returnsTheClaimantSafeProjection() throws Exception {
        when(service.get(CLAIM_ID)).thenReturn(claim());

        mvc.perform(get("/api/portal/claims/{claimId}", CLAIM_ID))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.claimId").value(CLAIM_ID.toString()))
            .andExpect(jsonPath("$.claimNumber").value("CLM-2026-DEMO01"))
            .andExpect(jsonPath("$.claimantName").value("Taylor Reed"))
            .andExpect(jsonPath("$.completenessPercentage").value(100))
            .andExpect(jsonPath("$.nextAction").value("Your claim is ready for review by the claims team."));
    }

    @Test
    void updatesOneEvidenceKindWithoutAcceptingDerivedValues() throws Exception {
        when(service.updateEvidence(eq(CLAIM_ID), eq(EvidenceKind.PHOTOS), eq(true), eq("Taylor Reed")))
            .thenReturn(claim());

        mvc.perform(patch("/api/portal/claims/{claimId}/evidence", CLAIM_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind": "PHOTOS",
                      "present": true,
                      "actor": "Taylor Reed"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.evidence.photosPresent").value(true))
            .andExpect(jsonPath("$.completenessPercentage").value(100));
    }

    @Test
    void missingClaimReturnsProblemDetails() throws Exception {
        when(service.get(CLAIM_ID)).thenThrow(
            new ResourceNotFoundException("CLAIM_NOT_FOUND", "Claim was not found."));

        mvc.perform(get("/api/portal/claims/{claimId}", CLAIM_ID)
                .header(RequestIdFilter.HEADER, "portal-missing"))
            .andExpect(status().isNotFound())
            .andExpect(jsonPath("$.code").value("CLAIM_NOT_FOUND"))
            .andExpect(jsonPath("$.requestId").value("portal-missing"));
    }

    @Test
    void unsupportedEvidenceKindReturnsMalformedRequest() throws Exception {
        mvc.perform(patch("/api/portal/claims/{claimId}/evidence", CLAIM_ID)
                .header(RequestIdFilter.HEADER, "portal-kind")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind": "VIDEO_UPLOAD",
                      "present": true,
                      "actor": "Taylor Reed"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
            .andExpect(jsonPath("$.requestId").value("portal-kind"));
    }

    @Test
    void blankActorReturnsValidationProblemDetails() throws Exception {
        mvc.perform(patch("/api/portal/claims/{claimId}/evidence", CLAIM_ID)
                .header(RequestIdFilter.HEADER, "portal-validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "kind": "PHOTOS",
                      "present": true,
                      "actor": ""
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.fieldErrors.actor").isArray());
    }

    private PortalResponses.PortalClaim claim() {
        return new PortalResponses.PortalClaim(
            CLAIM_ID,
            "CLM-2026-DEMO01",
            "Taylor Reed",
            "PROPERTY",
            "NEW",
            100,
            Instant.parse("2026-08-10T12:00:00Z"),
            new PortalResponses.PortalEvidence(true, true, true, false),
            List.of(),
            "Your claim is ready for review by the claims team.");
    }
}
