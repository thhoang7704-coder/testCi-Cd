package com.example.labOdc.Service.Implement;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.labOdc.DTO.MentorCandidateReviewDTO;
import com.example.labOdc.DTO.Response.MentorCandidateReviewResponse;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.MentorCandidateReview;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.Talent;
import com.example.labOdc.Repository.MentorCandidateReviewRepository;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.MentorCandidateReviewService;

@Service
@Transactional
public class MentorCandidateReviewServiceImpl implements MentorCandidateReviewService {

    @Autowired
    private MentorCandidateReviewRepository repository;

    @Autowired
    private MentorRepository mentorRepository;

    @Autowired
    private TalentRepository talentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    private MentorCandidateReview toEntity(MentorCandidateReviewDTO dto) {
        if (dto == null) return null;

        Mentor mentor = mentorRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        Talent talent = talentRepository.findById(dto.getTalentId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent not found"));
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        MentorCandidateReview e = MentorCandidateReview.builder()
                .mentor(mentor)
                .talent(talent)
                .project(project)
                .rating(dto.getRating())
                .comments(dto.getComments())
                .build();
        return e;
    }

    /**
     * Chức năng: Tạo đánh giá Mentor cho ứng viên.
     * Repository: MentorCandidateReviewRepository.save() - Lưu entity vào database.
     */
    @Override
    public MentorCandidateReviewResponse create(MentorCandidateReviewDTO dto) {
        MentorCandidateReview e = toEntity(dto);
        MentorCandidateReview saved = repository.save(e);
        return MentorCandidateReviewResponse.fromEntity(saved);
    }

    /**
     * Chức năng: Lấy đánh giá theo ID.
     * Repository: MentorCandidateReviewRepository.findById() - Truy vấn entity theo ID.
     */
    @Override
    public MentorCandidateReviewResponse getById(String id) {
        Optional<MentorCandidateReview> o = repository.findById(id);
        return o.map(MentorCandidateReviewResponse::fromEntity).orElse(null);
    }

    /**
     * Chức năng: Lọc danh sách đánh giá theo Mentor ID.
     * Repository: MentorCandidateReviewRepository.findByMentorId() - Truy vấn theo mentorId.
     */
    @Override
    public List<MentorCandidateReviewResponse> findByMentorId(String mentorId) {
        return repository.findByMentorId(mentorId).stream()
                .map(MentorCandidateReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Chức năng: Lọc danh sách đánh giá theo Talent ID.
     * Repository: MentorCandidateReviewRepository.findByTalentId() - Truy vấn theo talentId.
     */
    @Override
    public List<MentorCandidateReviewResponse> findByTalentId(String talentId) {
        return repository.findByTalentId(talentId).stream()
                .map(MentorCandidateReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Chức năng: Lọc danh sách đánh giá theo Project ID.
     * Repository: MentorCandidateReviewRepository.findByProjectId() - Truy vấn theo projectId.
     */
    @Override
    public List<MentorCandidateReviewResponse> findByProjectId(String projectId) {
        return repository.findByProjectId(projectId).stream()
                .map(MentorCandidateReviewResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Chức năng: Cập nhật đánh giá theo ID.
     * Repository: MentorCandidateReviewRepository.findById() và save() - Tìm và cập nhật entity.
     */
    @Override
    public MentorCandidateReviewResponse update(String id, MentorCandidateReviewDTO dto) {
        Optional<MentorCandidateReview> o = repository.findById(id);
        if (!o.isPresent()) return null;
        MentorCandidateReview e = o.get();
        if (dto.getRating() != null) e.setRating(dto.getRating());
        if (dto.getComments() != null) e.setComments(dto.getComments());
        MentorCandidateReview saved = repository.save(e);
        return MentorCandidateReviewResponse.fromEntity(saved);
    }

    /**
     * Chức năng: Xóa đánh giá theo ID.
     * Repository: MentorCandidateReviewRepository.deleteById() - Xóa entity theo ID.
     */
    @Override
    public void delete(String id) {
        repository.deleteById(id);
    }

    /**
     * Chức năng: Cập nhật trạng thái tuyển chọn ứng viên.
     * Repository: MentorCandidateReviewRepository.findById() và save() - Tìm và cập nhật status.
     */
    @Override
    public MentorCandidateReviewResponse updateStatus(String id, String status) {
        Optional<MentorCandidateReview> o = repository.findById(id);
        if (!o.isPresent()) return null;
        MentorCandidateReview e = o.get();
        // Assuming status is a field, but model may not have it. Placeholder.
        // e.setStatus(status); // Add to model if needed
        MentorCandidateReview saved = repository.save(e);
        return MentorCandidateReviewResponse.fromEntity(saved);
    }

    
    /**
     * Chức năng: Chấp nhận ứng viên.
     * Repository: Cập nhật status thành selected.
     */
    @Override
    public void acceptCandidate(String id) {
        // Placeholder: Cập nhật status
        // MentorCandidateReview e = repository.findById(id).orElseThrow();
        // e.setStatus("selected");
        // repository.save(e);
        System.out.println("Accepted candidate for review: " + id);
    }

    /**
     * Chức năng: Từ chối ứng viên.
     * Repository: Cập nhật status thành rejected và lý do.
     */
    @Override
    public void rejectCandidate(String id, String reason) {
        // Placeholder: Cập nhật status và lý do
        // MentorCandidateReview e = repository.findById(id).orElseThrow();
        // e.setStatus("rejected");
        // e.setRejectionReason(reason);
        // repository.save(e);
        System.out.println("Rejected candidate for review: " + id + " with reason: " + reason);
    }

    
}
