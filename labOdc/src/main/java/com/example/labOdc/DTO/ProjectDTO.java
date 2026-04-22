package com.example.labOdc.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectDTO {

    @NotBlank
    private String companyId; // NEW: bắt buộc cho create

    private String mentorId; // NEW: optional

    @NotBlank
    private String projectName;

    private String projectCode;
    private String description;
    private String requirements;

    private BigDecimal budget;
    private Integer durationMonths;

    private LocalDate startDate;
    private LocalDate endDate;

    private LocalDate actualEndDate; // NEW: optional

    private Integer maxTeamSize;
    private String requiredSkills;
}