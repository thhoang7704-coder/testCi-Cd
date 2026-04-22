package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.FundAllocation;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FundAllocationResponse {

    private String id;

    private String paymentId;

    private String projectId;
    private String projectName;
    private String projectCode;

    private BigDecimal totalAmount;

    private BigDecimal teamAmount;
    private BigDecimal mentorAmount;
    private BigDecimal labAmount;

    private BigDecimal teamPercentage;
    private BigDecimal mentorPercentage;
    private BigDecimal labPercentage;

    private String status;

    private String allocatedById;
    private String allocatedByName;

    private LocalDateTime allocatedAt;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Mapper từ Entity → Response
     */
    public static FundAllocationResponse fromEntity(FundAllocation fa) {
        if (fa == null)
            return null;

        return FundAllocationResponse.builder()
                .id(fa.getId())

                // Payment
                .paymentId(
                        fa.getPayment() != null
                                ? fa.getPayment().getId()
                                : null)

                // Project
                .projectId(
                        fa.getProject() != null
                                ? fa.getProject().getId()
                                : null)
                .projectName(
                        fa.getProject() != null
                                ? fa.getProject().getProjectName()
                                : null)
                .projectCode(
                        fa.getProject() != null
                                ? fa.getProject().getProjectCode()
                                : null)

                // Amount
                .totalAmount(fa.getTotalAmount())
                .teamAmount(fa.getTeamAmount())
                .mentorAmount(fa.getMentorAmount())
                .labAmount(fa.getLabAmount())

                // Percentage
                .teamPercentage(fa.getTeamPercentage())
                .mentorPercentage(fa.getMentorPercentage())
                .labPercentage(fa.getLabPercentage())

                // Status
                .status(
                        fa.getStatus() != null
                                ? fa.getStatus().name()
                                : null)

                // Allocated by
                .allocatedById(
                        fa.getAllocatedBy() != null
                                ? fa.getAllocatedBy().getId()
                                : null)
                .allocatedByName(
                        fa.getAllocatedBy() != null
                                ? fa.getAllocatedBy().getFullName()
                                : null)

                .allocatedAt(fa.getAllocatedAt())
                .notes(fa.getNotes())

                .createdAt(fa.getCreatedAt())
                .updatedAt(fa.getUpdatedAt())

                .build();
    }
}
