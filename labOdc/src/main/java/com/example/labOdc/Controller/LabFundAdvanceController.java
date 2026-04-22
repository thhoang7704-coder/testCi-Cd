package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.LabFundAdvanceDTO;
import com.example.labOdc.Model.LabFundAdvance;
import com.example.labOdc.Service.LabFundAdvanceService;
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
@RequestMapping("/api/v1/lab-fund-advances")
public class LabFundAdvanceController {

    private final LabFundAdvanceService labFundAdvanceService;

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabFundAdvance> createAdvance(
            @Valid @RequestBody LabFundAdvanceDTO dto,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return ApiResponse.error(errors);
        }

        LabFundAdvance advance = labFundAdvanceService.createAdvance(dto);
        return ApiResponse.success(
                advance,
                "Lab fund advance created successfully",
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabFundAdvance> approveAdvance(
            @PathVariable String id,
            @RequestParam(required = false) String approvedByUserId) {

        LabFundAdvance advance =
                labFundAdvanceService.approveAdvance(id, approvedByUserId);

        return ApiResponse.success(
                advance,
                "Lab fund advance approved successfully",
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}/settle")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabFundAdvance> settleAdvance(
            @PathVariable String id,
            @RequestParam(required = false) String paymentId) {

        LabFundAdvance advance =
                labFundAdvanceService.settleAdvance(id, paymentId);

        return ApiResponse.success(
                advance,
                "Lab fund advance settled successfully",
                HttpStatus.OK
        );
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabFundAdvance> cancelAdvance(
            @PathVariable String id,
            @RequestParam(required = false) String reason) {

        LabFundAdvance advance =
                labFundAdvanceService.cancelAdvance(id, reason);

        return ApiResponse.success(
                advance,
                "Lab fund advance cancelled successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabFundAdvance> getById(@PathVariable String id) {
        return ApiResponse.success(
                labFundAdvanceService.getAdvanceById(id),
                "Lab fund advance retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<LabFundAdvance>> getByProject(
            @PathVariable String projectId) {

        return ApiResponse.success(
                labFundAdvanceService.getAdvancesByProject(projectId),
                "Lab fund advances by project retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/unsettled")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<LabFundAdvance>> getUnsettled() {
        return ApiResponse.success(
                labFundAdvanceService.getUnsettledAdvances(),
                "Unsettled lab fund advances retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/outstanding-total")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<BigDecimal> getTotalOutstanding() {
        return ApiResponse.success(
                labFundAdvanceService.getTotalOutstandingAdvance(),
                "Total outstanding lab fund advance retrieved successfully",
                HttpStatus.OK
        );
    }
}