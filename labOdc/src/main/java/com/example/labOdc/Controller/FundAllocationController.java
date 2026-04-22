package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.FundAllocationDTO;
import com.example.labOdc.DTO.Response.FundAllocationResponse;
import com.example.labOdc.Model.FundAllocationStatus;
import com.example.labOdc.Service.FundAllocationService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/fund-allocations")
public class FundAllocationController {

    private final FundAllocationService fundAllocationService;

    /* ================= CREATE ================= */

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundAllocationResponse> createAllocation(
            @Valid @RequestBody FundAllocationDTO dto,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return ApiResponse.error(errors);
        }

        FundAllocationResponse response =
                fundAllocationService.createAllocation(dto);

        return ApiResponse.success(
                response,
                "Fund allocated successfully (70% team / 20% mentor / 10% lab)",
                HttpStatus.CREATED
        );
    }

    /* ================= UPDATE STATUS ================= */

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundAllocationResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {

        FundAllocationStatus allocationStatus =
                FundAllocationStatus.valueOf(status.toUpperCase());

        FundAllocationResponse response =
                fundAllocationService.updateStatus(id, allocationStatus, notes);

        return ApiResponse.success(
                response,
                "Fund allocation status updated successfully",
                HttpStatus.OK
        );
    }

    /* ================= QUERY ================= */

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundAllocationResponse> getById(@PathVariable String id) {
        return ApiResponse.success(
                fundAllocationService.getById(id),
                "Fund allocation retrieved successfully",
                HttpStatus.OK
        );
    }

    @GetMapping("/payment/{paymentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundAllocationResponse> getByPaymentId(
            @PathVariable String paymentId) {

        return ApiResponse.success(
                fundAllocationService.getByPaymentId(paymentId),
                "Fund allocation by payment retrieved successfully",
                HttpStatus.OK
        );
    }

        @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<FundAllocationResponse>> getByProject(
            @PathVariable String projectId) {

        List<FundAllocationResponse> list =
                fundAllocationService.getByProjectId(projectId);

        return ApiResponse.success(
                list,
                "Fund allocations by project retrieved successfully",
                HttpStatus.OK
        );
    }
}