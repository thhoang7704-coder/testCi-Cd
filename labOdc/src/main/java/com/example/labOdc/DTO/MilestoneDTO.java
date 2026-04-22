package com.example.labOdc.DTO;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MilestoneDTO {
    @NotBlank
    private String projectId;

    @NotBlank
    private String milestoneName;

    private String description;

    private LocalDate dueDate;

    @Positive
    private BigDecimal paymentPercentage;

    private String deliverables;
}