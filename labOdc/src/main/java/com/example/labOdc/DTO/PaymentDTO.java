package com.example.labOdc.DTO;

import com.example.labOdc.Model.PaymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {

    private String projectId;

    private String companyId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be greater than 0")
    private BigDecimal amount;

    private PaymentType paymentType;

    private String transactionId;

    private LocalDate dueDate;

    private String notes;

    @Builder.Default
    private Boolean usePayOS = true;
}