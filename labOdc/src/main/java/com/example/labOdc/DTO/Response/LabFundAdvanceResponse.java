package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.LabFundAdvance;
import com.example.labOdc.Model.LabFundAdvanceStatus;
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
public class LabFundAdvanceResponse {

    private String id;

    private String projectId;
    private String projectName;
    private String projectCode;

    private BigDecimal advanceAmount;
    private String advanceReason;

    private LabFundAdvanceStatus status;

    private String approvedById;
    private String approvedByName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LabFundAdvanceResponse fromEntity(LabFundAdvance entity) {
        if (entity == null)
            return null;

        return LabFundAdvanceResponse.builder()
                .id(entity.getId())

                .projectId(
                        entity.getProject() != null
                                ? entity.getProject().getId()
                                : null)
                .projectName(
                        entity.getProject() != null
                                ? entity.getProject().getProjectName()
                                : null)
                .projectCode(
                        entity.getProject() != null
                                ? entity.getProject().getProjectCode()
                                : null)

                .advanceAmount(entity.getAdvanceAmount())
                .advanceReason(entity.getAdvanceReason())
                .status(entity.getStatus())

                .approvedById(
                        entity.getApprovedBy() != null
                                ? entity.getApprovedBy().getId()
                                : null)
                .approvedByName(
                        entity.getApprovedBy() != null
                                ? entity.getApprovedBy().getFullName()
                                : null)

                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
