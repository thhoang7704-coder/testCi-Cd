package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.FundDistributionDTO;
import com.example.labOdc.DTO.Response.FundDistributionResponse;
import com.example.labOdc.Service.FundDistributionService;
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
@RequestMapping("/api/v1/fund-distributions")
public class FundDistributionController {

    private final FundDistributionService fundDistributionService;

    /* ================= CREATE ================= */

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundDistributionResponse> createDistribution(
            @Valid @RequestBody FundDistributionDTO dto,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errors = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());

            return ApiResponse.error(errors);
        }

        FundDistributionResponse response =
                fundDistributionService.createDistribution(dto);

        return ApiResponse.success(
                response,
                "Fund distribution created successfully",
                HttpStatus.CREATED
        );
    }

    /* ================= STATUS FLOW ================= */

    /**
     * Approve / Reject / Pending distribution
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundDistributionResponse> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String approvedById,
            @RequestParam(required = false) String notes) {

        FundDistributionResponse response =
                fundDistributionService.updateStatus(id, status, approvedById, notes);

        return ApiResponse.success(
                response,
                "Fund distribution status updated successfully",
                HttpStatus.OK
        );
    }

    /**
     * Mark distribution as PAID
     */
    @PatchMapping("/{id}/paid")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<FundDistributionResponse> markAsPaid(
            @PathVariable String id,
            @RequestParam String paymentMethod,
            @RequestParam String transactionReference) {

        FundDistributionResponse response =
                fundDistributionService.markAsPaid(id, paymentMethod, transactionReference);

        return ApiResponse.success(
                response,
                "Fund distribution marked as paid successfully",
                HttpStatus.OK
        );
    }

    /* ================= QUERY ================= */

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'TALENT')")
    public ApiResponse<FundDistributionResponse> getById(@PathVariable String id) {

        FundDistributionResponse response =
                fundDistributionService.getById(id);

        return ApiResponse.success(
                response,
                "Fund distribution retrieved successfully",
                HttpStatus.OK
        );
    }

    /**
     * 1 FundAllocation → N FundDistribution
     */
    @GetMapping("/allocation/{fundAllocationId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<FundDistributionResponse>> getByAllocation(
            @PathVariable String fundAllocationId) {

        List<FundDistributionResponse> list =
                fundDistributionService.getByFundAllocationId(fundAllocationId);

        return ApiResponse.success(
                list,
                "Fund distributions by allocation retrieved successfully",
                HttpStatus.OK
        );
    }

    /**
     * 1 Talent → N FundDistribution
     */
    @GetMapping("/talent/{talentId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'TALENT')")
    public ApiResponse<List<FundDistributionResponse>> getByTalent(
            @PathVariable String talentId) {

        List<FundDistributionResponse> list =
                fundDistributionService.getByTalentId(talentId);

        return ApiResponse.success(
                list,
                "Fund distributions by talent retrieved successfully",
                HttpStatus.OK
        );
    }
}