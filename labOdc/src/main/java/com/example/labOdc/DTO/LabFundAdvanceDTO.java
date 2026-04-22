package com.example.labOdc.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabFundAdvanceDTO {

    private String projectId;

    private String paymentId; 

    @NotNull(message = "advanceAmount is required")
    @Positive(message = "advanceAmount must be positive")
    private BigDecimal advanceAmount;

    @NotBlank(message = "advanceReason is required")
    private String advanceReason;
}