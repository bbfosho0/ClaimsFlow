package com.claimsflow.claim.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.claimsflow.claim.application.ClaimApplicationService;
import com.claimsflow.shared.error.GlobalExceptionHandler;
import com.claimsflow.shared.web.RequestIdFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(ClaimController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class ClaimControllerWebTest {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ClaimApplicationService service;

    @Test
    void invalidClaimReturnsProblemDetailsWithFieldErrors() throws Exception {
        mvc.perform(post("/api/claims")
                .header(RequestIdFilter.HEADER, "request-validation")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "claimantName": "",
                      "claimantEmail": "not-an-email",
                      "claimType": "AUTO",
                      "incidentDate": "2999-01-01",
                      "estimatedLoss": -1,
                      "description": "short",
                      "incidentReportPresent": false,
                      "photosPresent": false,
                      "proofOfOwnershipPresent": false,
                      "medicalDocumentationPresent": false
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.requestId").value("request-validation"))
            .andExpect(jsonPath("$.fieldErrors.claimantName").isArray())
            .andExpect(jsonPath("$.fieldErrors.claimantEmail").isArray())
            .andExpect(jsonPath("$.fieldErrors.incidentDate").isArray())
            .andExpect(jsonPath("$.fieldErrors.estimatedLoss").isArray())
            .andExpect(jsonPath("$.fieldErrors.description").isArray());
    }

    @Test
    void malformedJsonReturnsBadRequestProblemDetails() throws Exception {
        mvc.perform(post("/api/claims")
                .header(RequestIdFilter.HEADER, "request-malformed")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{not-json}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"))
            .andExpect(jsonPath("$.requestId").value("request-malformed"));
    }
}
