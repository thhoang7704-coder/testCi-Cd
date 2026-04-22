package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.CompanyRiskRecord;
import com.example.labOdc.Model.CompanyRiskType;
import com.example.labOdc.Model.RiskSeverity;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRiskRecordResponse {

    private String id;

    private String companyName;
    private String companyTaxCode;

    private String projectName;
    private String projectCode;

    private CompanyRiskType riskType;
    private RiskSeverity severity;

    private String description;

    private String recordedByName;
    private LocalDateTime recordedAt;

    public static CompanyRiskRecordResponse fromEntity(CompanyRiskRecord e) {
        if (e == null)
            return null;

        return CompanyRiskRecordResponse.builder()
                .id(e.getId())

                // Company
                .companyName(
                        e.getCompany() != null
                                ? e.getCompany().getCompanyName()
                                : null)
                .companyTaxCode(
                        e.getCompany() != null
                                ? e.getCompany().getTaxCode()
                                : null)

                // Project
                .projectName(
                        e.getProject() != null
                                ? e.getProject().getProjectName()
                                : null)
                .projectCode(
                        e.getProject() != null
                                ? e.getProject().getProjectCode()
                                : null)

                // Risk info
                .riskType(e.getRiskType())
                .severity(e.getSeverity())
                .description(e.getDescription())

                // User
                .recordedByName(
                        e.getRecordedBy() != null
                                ? e.getRecordedBy().getFullName()
                                : null)
                .recordedAt(e.getRecordedAt())

                .build();
    }
}
