package com.example.labOdc.DTO;

import com.example.labOdc.Model.MemberContribution;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MemberContributionDTO {

    @NotBlank
    private String projectId;

    @NotBlank
    private String talentId;

    @NotNull
    private MemberContribution.ContributionType contributionType;

    private String description;
    private BigDecimal score;

}
