package com.example.labOdc.DTO;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MentorInvitationDTO {
    @NotBlank
    private String projectId;

    @NotBlank
    private String mentorId;

    private String invitationMessage;
    private BigDecimal proposedFeePercentage;
}