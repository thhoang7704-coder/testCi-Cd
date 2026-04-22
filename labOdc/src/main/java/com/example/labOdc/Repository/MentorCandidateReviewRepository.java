package com.example.labOdc.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.labOdc.Model.MentorCandidateReview;

public interface MentorCandidateReviewRepository extends JpaRepository<MentorCandidateReview, String> {
    List<MentorCandidateReview> findByMentorId(String mentorId);

    List<MentorCandidateReview> findByTalentId(String talentId);

    List<MentorCandidateReview> findByProjectId(String projectId);
}
