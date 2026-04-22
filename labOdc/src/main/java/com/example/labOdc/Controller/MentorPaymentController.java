package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.MentorPaymentDTO;
import com.example.labOdc.Model.MentorPayment;
import com.example.labOdc.Model.MentorPaymentStatus;
import com.example.labOdc.Service.MentorPaymentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/mentor-payments")
public class MentorPaymentController {

    private final MentorPaymentService mentorPaymentService;

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<MentorPayment> createMentorPayment(
            @Valid @RequestBody MentorPaymentDTO dto,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return ApiResponse.error(errors);
        }

        MentorPayment payment = mentorPaymentService.createMentorPayment(dto);
        return ApiResponse.success(
                payment,
                "Mentor payment created successfully",
                HttpStatus.CREATED
        );
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<MentorPayment> approveMentorPayment(
            @PathVariable String id,
            @RequestParam String approvedByUserId) {

        MentorPayment payment =
                mentorPaymentService.approveMentorPayment(id, approvedByUserId);

        return ApiResponse.success(
                payment,
                "Mentor payment approved successfully",
                HttpStatus.OK
        );
    }

    @PatchMapping("/{id}/paid")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<MentorPayment> markAsPaid(
            @PathVariable String id,
            @RequestParam String paymentMethod,
            @RequestParam(required = false) String transactionReference) {

        MentorPayment payment =
                mentorPaymentService.markAsPaid(id, paymentMethod, transactionReference);

        return ApiResponse.success(
                payment,
                "Mentor payment marked as PAID",
                HttpStatus.OK
        );
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<MentorPayment> cancelMentorPayment(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {

        MentorPayment payment =
                mentorPaymentService.cancelMentorPayment(id, reason);

        return ApiResponse.success(
                payment,
                "Mentor payment cancelled successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'MENTOR')")
    public ApiResponse<MentorPayment> getById(@PathVariable String id) {
        return ApiResponse.success(
                mentorPaymentService.getById(id),
                "Mentor payment retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/mentor/{mentorId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'MENTOR')")
    public ApiResponse<List<MentorPayment>> getByMentor(@PathVariable String mentorId) {
        return ApiResponse.success(
                mentorPaymentService.getByMentor(mentorId),
                "Mentor payments retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<MentorPayment>> getByProject(@PathVariable String projectId) {
        return ApiResponse.success(
                mentorPaymentService.getByProject(projectId),
                "Project mentor payments retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<MentorPayment>> getByStatus(
            @PathVariable MentorPaymentStatus status) {

        return ApiResponse.success(
                mentorPaymentService.getByStatus(status),
                "Mentor payments by status retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/mentor/{mentorId}/total")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'MENTOR')")
    public ApiResponse<BigDecimal> getTotalAmountByMentor(
            @PathVariable String mentorId) {

        return ApiResponse.success(
                mentorPaymentService.getTotalAmountByMentor(mentorId),
                "Total mentor payment amount retrieved successfully",
                HttpStatus.OK
        );
    }
}