package com.example.labOdc.APi;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success; // thanh cong
    private String message;
    private T data;
    private List<String> errors;
    private LocalDateTime timestamp;
    private int statusCode;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "completed", data, null, LocalDateTime.now(), HttpStatus.OK.value());
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, null, LocalDateTime.now(), HttpStatus.OK.value());
    }

    public static <T> ApiResponse<T> success(T data, String message, HttpStatus httpStatus) {
        return new ApiResponse<>(true, message, data, null, LocalDateTime.now(), httpStatus.value());
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, null, LocalDateTime.now(), HttpStatus.BAD_REQUEST.value());

    }

    public static <T> ApiResponse<T> error(List<String> errors) {
        return new ApiResponse<>(false, null, null, errors, LocalDateTime.now(), HttpStatus.BAD_REQUEST.value());

    }

    public static <T> ApiResponse<T> error(String message, HttpStatus httpStatus) {
        return new ApiResponse<>(false, message, null, null, LocalDateTime.now(), httpStatus.value());

    }

    public static <T> ApiResponse<T> error(String message, List<String> errors, HttpStatus httpStatus) {
        return new ApiResponse<>(false, message, null, errors, LocalDateTime.now(), httpStatus.value());

    }

    public static <T> ApiResponse<T> noContent(String message) {
        return new ApiResponse<>(false, message, null, null, LocalDateTime.now(), HttpStatus.NO_CONTENT.value());

    }

    public static <T> ApiResponse<T> notFound(String message) {
        return new ApiResponse<>(false, message, null, null, LocalDateTime.now(), HttpStatus.NOT_FOUND.value());

    }
}
