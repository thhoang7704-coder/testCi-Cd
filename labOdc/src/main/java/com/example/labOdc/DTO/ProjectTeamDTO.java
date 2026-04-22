package com.example.labOdc.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.labOdc.Model.ProjectTeamStatus;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectTeamDTO {

    @NotBlank
    private String projectId;

    @NotBlank
    private String talentId;

    private Boolean isLeader;
    private LocalDate joinedDate;
    private LocalDate leftDate;

    private ProjectTeamStatus status;

    private BigDecimal performanceRating;
}