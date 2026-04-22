package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.MentorPayment;
import com.example.labOdc.Model.MentorPaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorPaymentResponse {

    private String id;

    private String projectName;
    private String projectCode;

    private String mentorName;
    private String mentorEmail;

    private BigDecimal amount;
    private MentorPaymentStatus status;

    private String approvedByName;
    private LocalDateTime approvedAt;

    private LocalDate paidDate;
    private String paymentMethod;
    private String transactionReference;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MentorPaymentResponse fromEntity(MentorPayment mp) {
        if (mp == null)
            return null;

        return MentorPaymentResponse.builder()
                .id(mp.getId())
                .projectName(
                        mp.getProject() != null ? mp.getProject().getProjectName() : null)
                .projectCode(
                        mp.getProject() != null ? mp.getProject().getProjectCode() : null)
                .mentorName(
                        mp.getMentor() != null && mp.getMentor().getUser() != null
                                ? mp.getMentor().getUser().getFullName()
                                : null)
                .mentorEmail(
                        mp.getMentor() != null && mp.getMentor().getUser() != null
                                ? mp.getMentor().getUser().getEmail()
                                : null)
                .amount(mp.getAmount())
                .status(mp.getStatus())
                .approvedByName(
                        mp.getApprovedBy() != null ? mp.getApprovedBy().getFullName() : null)
                .approvedAt(mp.getApprovedAt())
                .paidDate(mp.getPaidDate())
                .paymentMethod(mp.getPaymentMethod())
                .transactionReference(mp.getTransactionReference())
                .notes(mp.getNotes())
                .createdAt(mp.getCreatedAt())
                .updatedAt(mp.getUpdatedAt())
                .build();
    }
}
