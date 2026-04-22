package com.example.labOdc.Exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.example.labOdc.APi.ApiResponse;

@ControllerAdvice
public class GlobalExceptionHandle {
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(BadCredentialsException ex, WebRequest request) {
        ApiResponse<Void> apiResponse = new ApiResponse<>(false, ex.getMessage(), null, null, LocalDateTime.now(),
                HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(apiResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handlerResourceNotFoundException(
            ResourceNotFoundException ex, WebRequest request) {
        ApiResponse<Void> apiResponse = new ApiResponse<>(false, ex.getMessage(), null, null, LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(apiResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler({ IllegalStateException.class, IllegalArgumentException.class })
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(RuntimeException ex, WebRequest request) {
        ApiResponse<Void> apiResponse = new ApiResponse<>(false, ex.getMessage(), null, null, LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(apiResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({ AccessDeniedException.class, SecurityException.class })
    public ResponseEntity<ApiResponse<Void>> handleForbidden(RuntimeException ex, WebRequest request) {
        ApiResponse<Void> apiResponse = new ApiResponse<>(false, ex.getMessage(), null, null, LocalDateTime.now(),
                HttpStatus.FORBIDDEN.value());
        return new ResponseEntity<>(apiResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntime(RuntimeException ex, WebRequest request) {
        ApiResponse<Void> apiResponse = new ApiResponse<>(false, ex.getMessage(), null, null, LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(apiResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

}
