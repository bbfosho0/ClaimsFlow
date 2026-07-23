package com.claimsflow.shared.error;

import static org.assertj.core.api.Assertions.assertThat;
import com.claimsflow.shared.web.RequestIdFilter;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;

class GlobalExceptionHandlerTest {
    @Test
    void notFoundIncludesStableCodeAndRequestId() {
        var request = new MockHttpServletRequest();
        request.setRequestURI("/api/claims/missing");
        request.setAttribute(RequestIdFilter.ATTRIBUTE, "request-123");
        var response = new GlobalExceptionHandler().notFound(new ResourceNotFoundException("CLAIM_NOT_FOUND", "Claim was not found."), request);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody().getProperties()).containsEntry("code", "CLAIM_NOT_FOUND").containsEntry("requestId", "request-123");
    }
}
