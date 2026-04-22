package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.FundDistribution;
import com.example.labOdc.Model.FundDistributionStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FundDistributionResponse {

    private String id;

    private String fundAllocationId;

    private String projectId;
    private String projectName;
    private String projectCode;

    private String talentId;
    private String talentName;
    private String talentStudentCode;

    private BigDecimal amount;
    private BigDecimal percentage;

    private FundDistributionStatus status;

    private String approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;

    private LocalDate paidDate;
    private String paymentMethod;
    private String transactionReference;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Mapper: Entity → Response
     */
    public static FundDistributionResponse fromEntity(FundDistribution fd) {
        if (fd == null)
            return null;

        return FundDistributionResponse.builder()
                .id(fd.getId())

                // Fund Allocation
                .fundAllocationId(
                        fd.getFundAllocation() != null
                                ? fd.getFundAllocation().getId()
                                : null)

                // Project (đi qua FundAllocation → Project)
                .projectId(
                        fd.getFundAllocation() != null
                                && fd.getFundAllocation().getProject() != null
                                        ? fd.getFundAllocation().getProject().getId()
                                        : null)
                .projectName(
                        fd.getFundAllocation() != null
                                && fd.getFundAllocation().getProject() != null
                                        ? fd.getFundAllocation().getProject().getProjectName()
                                        : null)
                .projectCode(
                        fd.getFundAllocation() != null
                                && fd.getFundAllocation().getProject() != null
                                        ? fd.getFundAllocation().getProject().getProjectCode()
                                        : null)

                // Talent
                .talentId(
                        fd.getTalent() != null
                                ? fd.getTalent().getId()
                                : null)
                .talentName(
                        fd.getTalent() != null
                                ? fd.getTalent().getUser().getFullName()
                                : null)
                .talentStudentCode(
                        fd.getTalent() != null
                                ? fd.getTalent().getStudentCode()
                                : null)

                // Amount
                .amount(fd.getAmount())
                .percentage(fd.getPercentage())

                // Status
                .status(fd.getStatus())

                // Approved by
                .approvedById(
                        fd.getApprovedBy() != null
                                ? fd.getApprovedBy().getId()
                                : null)
                .approvedByName(
                        fd.getApprovedBy() != null
                                ? fd.getApprovedBy().getFullName()
                                : null)
                .approvedAt(fd.getApprovedAt())

                // Payment info
                .paidDate(fd.getPaidDate())
                .paymentMethod(fd.getPaymentMethod())
                .transactionReference(fd.getTransactionReference())

                .notes(fd.getNotes())

                .createdAt(fd.getCreatedAt())
                .updatedAt(fd.getUpdatedAt())

                .build();
    }
}
