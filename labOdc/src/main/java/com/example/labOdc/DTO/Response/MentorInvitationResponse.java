package com.example.labOdc.DTO.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.labOdc.Model.MentorInvitation;
import com.example.labOdc.Model.MentorInvitationStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MentorInvitationResponse {
    private String id;
    private String projectId;
    private String mentorId;
    private String invitedBy;
    private String invitationMessage;
    private BigDecimal proposedFeePercentage;
    private MentorInvitationStatus status;
    private LocalDateTime respondedAt;
    private LocalDateTime createdAt;

    public static MentorInvitationResponse fromMentorInvitation(MentorInvitation mi) {
        return MentorInvitationResponse.builder()
                .id(mi.getId())
                .projectId(mi.getProject() != null ? mi.getProject().getId() : null)
                .mentorId(mi.getMentor() != null ? mi.getMentor().getId() : null)
                .invitedBy(mi.getInvitedBy() != null ? mi.getInvitedBy().getId() : null)
                .invitationMessage(mi.getInvitationMessage())
                .proposedFeePercentage(mi.getProposedFeePercentage())
                .status(mi.getStatus())
                .respondedAt(mi.getRespondedAt())
                .createdAt(mi.getCreatedAt())
                .build();
    }
}