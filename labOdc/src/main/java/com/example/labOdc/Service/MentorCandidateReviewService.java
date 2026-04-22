package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.MentorCandidateReviewDTO;
import com.example.labOdc.DTO.Response.MentorCandidateReviewResponse;

public interface MentorCandidateReviewService {
    MentorCandidateReviewResponse create(MentorCandidateReviewDTO dto);

    MentorCandidateReviewResponse getById(String id);

    List<MentorCandidateReviewResponse> findByMentorId(String mentorId);

    List<MentorCandidateReviewResponse> findByTalentId(String talentId);

    List<MentorCandidateReviewResponse> findByProjectId(String projectId);

    MentorCandidateReviewResponse update(String id, MentorCandidateReviewDTO dto);

    void delete(String id);

    /**
     * Chức năng: Cập nhật trạng thái tuyển chọn ứng viên.
     * Service: MentorCandidateReviewService.updateStatus() - Cập nhật status (pending, shortlisted, interviewed, selected, rejected).
     */
    MentorCandidateReviewResponse updateStatus(String id, String status);

    /**
     * Chức năng: Chấp nhận ứng viên.
     * Service: MentorCandidateReviewService.acceptCandidate() - Cập nhật trạng thái thành selected.
     */
    void acceptCandidate(String id);

    /**
     * Chức năng: Từ chối ứng viên.
     * Service: MentorCandidateReviewService.rejectCandidate() - Cập nhật trạng thái thành rejected và ghi lý do.
     */
    void rejectCandidate(String id, String reason);

    
}
