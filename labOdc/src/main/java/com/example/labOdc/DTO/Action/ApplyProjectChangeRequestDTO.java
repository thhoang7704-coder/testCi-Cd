package com.example.labOdc.DTO.Action;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApplyProjectChangeRequestDTO {
    private BigDecimal budget;
    private Integer durationMonths;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String requirements;
    private String requiredSkills;
    private Integer maxTeamSize;
}
