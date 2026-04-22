package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.DTO.MentorCandidateReviewDTO;
import com.example.labOdc.DTO.Response.MentorCandidateReviewResponse;
import com.example.labOdc.Service.MentorCandidateReviewService;

@RestController
@RequestMapping("/api/mentor-candidate-reviews")
public class MentorCandidateReviewController {

    @Autowired
    private MentorCandidateReviewService service;

    /**
     * Chức năng: Tạo đánh giá Mentor cho ứng viên.
     * Service: MentorCandidateReviewService.create() - Xử lý logic tạo và lưu entity.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MENTOR', 'LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<MentorCandidateReviewResponse> create(@RequestBody MentorCandidateReviewDTO dto) {
        MentorCandidateReviewResponse response = service.create(dto);
        return ResponseEntity.ok(response);
    }

    /**
     * Chức năng: Lấy đánh giá theo ID.
     * Service: MentorCandidateReviewService.getById() - Truy vấn entity theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MENTOR', 'LAB_ADMIN', 'COMPANY', 'SYSTEM_ADMIN')")
    public ResponseEntity<MentorCandidateReviewResponse> getById(@PathVariable String id) {
        MentorCandidateReviewResponse response = service.getById(id);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    /**
     * Chức năng: Lấy danh sách đánh giá theo bộ lọc (mentorId, talentId, projectId).
     * Service: MentorCandidateReviewService.findByMentorId(), findByTalentId(), findByProjectId() - Truy vấn theo điều kiện.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('MENTOR', 'LAB_ADMIN', 'COMPANY', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<MentorCandidateReviewResponse>> list(
            @RequestParam(required = false) String mentorId,
            @RequestParam(required = false) String talentId,
            @RequestParam(required = false) String projectId
    ) {
        List<MentorCandidateReviewResponse> responses;
        if (mentorId != null) {
            responses = service.findByMentorId(mentorId);
        } else if (talentId != null) {
            responses = service.findByTalentId(talentId);
        } else if (projectId != null) {
            responses = service.findByProjectId(projectId);
        } else {
            responses = List.of();
        }
        return ResponseEntity.ok(responses);
    }

    /**
     * Chức năng: Cập nhật đánh giá theo ID.
     * Service: MentorCandidateReviewService.update() - Xử lý cập nhật entity.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MENTOR', 'LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ResponseEntity<MentorCandidateReviewResponse> update(@PathVariable String id, @RequestBody MentorCandidateReviewDTO dto) {
        MentorCandidateReviewResponse response = service.update(id, dto);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    /**
     * Chức năng: Xóa đánh giá theo ID.
     * Service: MentorCandidateReviewService.delete() - Xử lý xóa entity.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Chức năng: Cập nhật trạng thái tuyển chọn ứng viên.
     * Service: MentorCandidateReviewService.updateStatus() - Cập nhật status.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('MENTOR', 'LAB_ADMIN')")
    public ResponseEntity<MentorCandidateReviewResponse> updateStatus(@PathVariable String id, @RequestParam String status) {
        MentorCandidateReviewResponse response = service.updateStatus(id, status);
        if (response == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(response);
    }

    /**
     * Chức năng: Chấp nhận ứng viên.
     * Service: MentorCandidateReviewService.acceptCandidate() - Chấp nhận.
     */
    @PostMapping("/{id}/accept")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<Void> acceptCandidate(@PathVariable String id) {
        service.acceptCandidate(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Chức năng: Từ chối ứng viên.
     * Service: MentorCandidateReviewService.rejectCandidate() - Từ chối.
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('MENTOR')")
    public ResponseEntity<Void> rejectCandidate(@PathVariable String id, @RequestParam String reason) {
        service.rejectCandidate(id, reason);
        return ResponseEntity.ok().build();
    }

}
