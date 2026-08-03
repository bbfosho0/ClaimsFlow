package com.claimsflow.demo.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.claimsflow.demo.application.DemoJourneyService;
import com.claimsflow.shared.error.GlobalExceptionHandler;
import com.claimsflow.shared.web.RequestIdFilter;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DemoController.class)
@Import({GlobalExceptionHandler.class, RequestIdFilter.class})
@TestPropertySource(properties = "claimsflow.demo.enabled=true")
class DemoControllerWebTest {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private DemoJourneyService service;

    @Test
    void resetReturnsActualJourneyIdentifiersAndRoutes() throws Exception {
        UUID claimId = UUID.fromString("00000000-0000-0000-0000-000000000111");
        UUID adjusterId = UUID.fromString("00000000-0000-0000-0000-0000000000a1");
        when(service.reset()).thenReturn(new DemoResponses.DemoJourneySnapshot(
            claimId,
            "CLM-2026-DEMO01",
            adjusterId,
            "/portal/claims/" + claimId,
            "/app/claims/" + claimId + "?role=adjuster",
            "/app/dashboard?role=manager",
            "/app/workflows?role=admin"));

        mvc.perform(post("/api/demo/reset"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.claimId").value(claimId.toString()))
            .andExpect(jsonPath("$.adjusterId").value(adjusterId.toString()))
            .andExpect(jsonPath("$.claimantRoute").value("/portal/claims/" + claimId))
            .andExpect(jsonPath("$.adjusterRoute").value("/app/claims/" + claimId + "?role=adjuster"))
            .andExpect(jsonPath("$.managerRoute").value("/app/dashboard?role=manager"))
            .andExpect(jsonPath("$.administratorRoute").value("/app/workflows?role=admin"));
    }
}
