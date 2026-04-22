package com.example.labOdc.DTO;

import com.example.labOdc.Model.CompanyRiskType;
import com.example.labOdc.Model.RiskSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRiskRecordDTO {

    private String companyId;

    private String projectId;

    @NotNull
    private CompanyRiskType riskType;

    @NotNull
    private RiskSeverity severity;

    @NotBlank
    private String description;

    private String recordedById;
}