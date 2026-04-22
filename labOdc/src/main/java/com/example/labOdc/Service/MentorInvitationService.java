package com.example.labOdc.Service;

import java.math.BigDecimal;
import java.util.List;

import com.example.labOdc.DTO.MentorInvitationDTO;
import com.example.labOdc.Model.MentorInvitation;

public interface MentorInvitationService {
    MentorInvitation createMentorInvitation(MentorInvitationDTO dto);

    List<MentorInvitation> getAllMentorInvitation();

    MentorInvitation getMentorInvitationById(String id);

    MentorInvitation updateMentorInvitation(MentorInvitationDTO dto, String id);

    void deleteMentorInvitation(String id);

    // workflow chuẩn
    List<MentorInvitation> getInvitationsByMentor(String mentorId);

    List<MentorInvitation> getInvitationsByProject(String projectId);

    MentorInvitation acceptInvitation(String invitationId); // accept -> auto create ProjectMentor

    MentorInvitation rejectInvitation(String invitationId); // reject -> update status + respondedAt

    MentorInvitation updateProposedFee(String invitationId, BigDecimal proposedFeePercentage); // only PENDING
}