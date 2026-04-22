package com.example.labOdc.DTO.Action;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class UpdateProposedFeeDTO {
    private BigDecimal proposedFeePercentage;
}
