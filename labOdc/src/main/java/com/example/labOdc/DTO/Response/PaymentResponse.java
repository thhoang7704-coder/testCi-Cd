package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.Payment;
import com.example.labOdc.Model.PaymentStatus;
import com.example.labOdc.Model.PaymentType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private String id;

    private String projectName;
    private String projectCode;

    private String companyName;

    private BigDecimal amount;

    private PaymentType paymentType;
    private PaymentStatus status;

    private String transactionId;
    private LocalDate paymentDate;
    private LocalDate dueDate;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PaymentResponse fromEntity(Payment p) {
        if (p == null)
            return null;

        return PaymentResponse.builder()
                .id(p.getId())
                .projectName(
                        p.getProject() != null ? p.getProject().getProjectName() : null)
                .projectCode(
                        p.getProject() != null ? p.getProject().getProjectCode() : null)
                .companyName(
                        p.getCompany() != null ? p.getCompany().getCompanyName() : null)
                .amount(p.getAmount())
                .paymentType(p.getPaymentType())
                .status(p.getStatus())
                .transactionId(p.getTransactionId())
                .paymentDate(p.getPaymentDate())
                .dueDate(p.getDueDate())
                .notes(p.getNotes())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}