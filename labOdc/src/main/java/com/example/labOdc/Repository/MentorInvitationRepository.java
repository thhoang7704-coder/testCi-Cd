package com.example.labOdc.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.MentorInvitation;
import com.example.labOdc.Model.MentorInvitationStatus;

@Repository
public interface MentorInvitationRepository extends JpaRepository<MentorInvitation, String> {
    boolean existsByProjectIdAndMentorId(String projectId, String mentorId);

    List<MentorInvitation> findByMentorIdOrderByCreatedAtDesc(String mentorId);

    List<MentorInvitation> findByProjectIdOrderByCreatedAtDesc(String projectId);

    long countByProjectIdAndMentorIdAndStatus(String projectId, String mentorId, MentorInvitationStatus status);
}