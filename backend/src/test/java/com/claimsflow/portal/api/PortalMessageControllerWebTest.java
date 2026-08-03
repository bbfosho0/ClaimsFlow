package com.claimsflow.portal.api;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.claimsflow.portal.application.PortalApplicationService;
import com.claimsflow.portal.domain.MessageAudience;
import com.claimsflow.shared.error.GlobalExceptionHandler;
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

@WebMvcTest({PortalController.class, ClaimMessageController.class})
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
class PortalMessageControllerWebTest {
    private static final UUID CLAIM_ID = UUID.fromString("00000000-0000-0000-0000-000000000111");
    private static final UUID MESSAGE_ID = UUID.fromString("00000000-0000-0000-0000-000000000222");

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private PortalApplicationService service;

    @Test
    void returnsOnlyTheClaimantMessageProjection() throws Exception {
        when(service.messages(CLAIM_ID)).thenReturn(List.of(message()));

        mvc.perform(get("/api/portal/claims/{claimId}/messages", CLAIM_ID))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(MESSAGE_ID.toString()))
            .andExpect(jsonPath("$[0].author").value("Jordan Lee"))
            .andExpect(jsonPath("$[0].body").value("Please upload photos of the damaged flooring."));
    }

    @Test
    void createsABoundedClaimMessage() throws Exception {
        when(service.addMessage(
            eq(CLAIM_ID),
            eq("Jordan Lee"),
            eq(MessageAudience.CLAIMANT),
            eq("Please upload photos of the damaged flooring.")))
            .thenReturn(message());

        mvc.perform(post("/api/claims/{claimId}/messages", CLAIM_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "author": "Jordan Lee",
                      "audience": "CLAIMANT",
                      "body": "Please upload photos of the damaged flooring."
                    }
                    """))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.author").value("Jordan Lee"))
            .andExpect(jsonPath("$.body").value("Please upload photos of the damaged flooring."));
    }

    @Test
    void rejectsMessagesLongerThanTwelveHundredCharacters() throws Exception {
        String body = "x".repeat(1201);

        mvc.perform(post("/api/claims/{claimId}/messages", CLAIM_ID)
                .header(RequestIdFilter.HEADER, "message-length")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "author": "Jordan Lee",
                      "audience": "CLAIMANT",
                      "body": "%s"
                    }
                    """.formatted(body)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"))
            .andExpect(jsonPath("$.fieldErrors.body").isArray());
    }

    @Test
    void rejectsUnsupportedAudienceValues() throws Exception {
        mvc.perform(post("/api/claims/{claimId}/messages", CLAIM_ID)
                .header(RequestIdFilter.HEADER, "message-audience")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "author": "Jordan Lee",
                      "audience": "PUBLIC_SOCIAL",
                      "body": "This value is not supported."
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("MALFORMED_REQUEST"));
    }

    private PortalResponses.PortalMessage message() {
        return new PortalResponses.PortalMessage(
            MESSAGE_ID,
            "Jordan Lee",
            "Please upload photos of the damaged flooring.",
            Instant.parse("2026-08-02T15:00:00Z"));
    }
}
