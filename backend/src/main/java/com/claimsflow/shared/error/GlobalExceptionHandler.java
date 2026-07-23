package com.claimsflow.shared.error;

import com.claimsflow.shared.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.util.*;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<ProblemDetail> notFound(ResourceNotFoundException exception, HttpServletRequest request) {
        return response(HttpStatus.NOT_FOUND, exception.getCode(), exception.getMessage(), request, null);
    }

    @ExceptionHandler({DomainConflictException.class, OptimisticLockingFailureException.class})
    ResponseEntity<ProblemDetail> conflict(Exception exception, HttpServletRequest request) {
        String code = exception instanceof DomainConflictException domain ? domain.getCode() : "OPTIMISTIC_LOCK_CONFLICT";
        return response(HttpStatus.CONFLICT, code, exception.getMessage(), request, null);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ProblemDetail> validation(MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, List<String>> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error ->
            fields.computeIfAbsent(error.getField(), ignored -> new ArrayList<>()).add(error.getDefaultMessage()));
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", "One or more fields are invalid.", request, fields);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ProblemDetail> constraint(ConstraintViolationException exception, HttpServletRequest request) {
        return response(HttpStatus.BAD_REQUEST, "VALIDATION_FAILED", exception.getMessage(), request, null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ProblemDetail> unexpected(Exception exception, HttpServletRequest request) {
        return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred.", request, null);
    }

    private ResponseEntity<ProblemDetail> response(HttpStatus status, String code, String detail, HttpServletRequest request, Object fieldErrors) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(status, detail == null ? status.getReasonPhrase() : detail);
        problem.setType(URI.create("https://claimsflow.local/problems/" + code.toLowerCase(Locale.ROOT).replace('_', '-')));
        problem.setTitle(status.getReasonPhrase());
        problem.setInstance(URI.create(request.getRequestURI()));
        problem.setProperty("code", code);
        problem.setProperty("requestId", request.getAttribute(RequestIdFilter.ATTRIBUTE));
        if (fieldErrors != null) problem.setProperty("fieldErrors", fieldErrors);
        return ResponseEntity.status(status).body(problem);
    }
}
