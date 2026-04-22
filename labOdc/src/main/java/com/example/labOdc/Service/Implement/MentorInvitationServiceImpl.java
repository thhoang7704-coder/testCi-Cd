package com.example.labOdc.Service.Implement;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.labOdc.DTO.MentorInvitationDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.MentorInvitation;
import com.example.labOdc.Model.MentorInvitationStatus;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectMentor;
import com.example.labOdc.Model.ProjectMentorRole;
import com.example.labOdc.Model.ProjectMentorStatus;
import com.example.labOdc.Repository.MentorInvitationRepository;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectMentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Service.MentorInvitationService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MentorInvitationServiceImpl implements MentorInvitationService {

    private final MentorInvitationRepository mentorInvitationRepository;
    private final ProjectMentorRepository projectMentorRepository;

    // thêm để map id -> entity
    private final ProjectRepository projectRepository;
    private final MentorRepository mentorRepository;

    @Override
    public MentorInvitation createMentorInvitation(MentorInvitationDTO dto) {
        if (dto.getProjectId() == null || dto.getProjectId().isBlank()) {
            throw new IllegalArgumentException("projectId is required");
        }
        if (dto.getMentorId() == null || dto.getMentorId().isBlank()) {
            throw new IllegalArgumentException("mentorId is required");
        }

        // 1) validate project/mentor tồn tại
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));

        Mentor mentor = mentorRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", dto.getMentorId()));

        // 2) Không cho tạo mới nếu đã có invitation PENDING cho cùng project+mentor
        long pendingCount = mentorInvitationRepository.countByProjectIdAndMentorIdAndStatus(
                dto.getProjectId(), dto.getMentorId(), MentorInvitationStatus.PENDING);

        if (pendingCount > 0) {
            throw new IllegalStateException("A pending invitation already exists for this project and mentor");
        }

        // 3) Nếu mentor đã là mentor của project rồi thì khỏi mời
        if (projectMentorRepository.existsByProjectIdAndMentorId(dto.getProjectId(), dto.getMentorId())) {
            throw new IllegalStateException("Mentor already assigned to this project");
        }

        MentorInvitation mi = MentorInvitation.builder()
                .project(project)
                .mentor(mentor)
                // invitedBy không có trong DTO => không set ở đây
                .invitationMessage(dto.getInvitationMessage())
                .proposedFeePercentage(dto.getProposedFeePercentage())
                // status default PENDING ở entity
                // respondedAt chỉ set khi accept/reject
                .build();

        return mentorInvitationRepository.save(mi);
    }

    @Override
    public List<MentorInvitation> getAllMentorInvitation() {
        return mentorInvitationRepository.findAll();
    }

    @Override
    public MentorInvitation getMentorInvitationById(String id) {
        return mentorInvitationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MentorInvitation", "id", id));
    }

    @Override
    public MentorInvitation updateMentorInvitation(MentorInvitationDTO dto, String id) {
        MentorInvitation mi = getMentorInvitationById(id);

        // chỉ cho update khi PENDING
        if (mi.getStatus() != MentorInvitationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING invitation can be updated");
        }

        // theo DTO hiện tại chỉ update được message/fee
        if (dto.getInvitationMessage() != null) {
            mi.setInvitationMessage(dto.getInvitationMessage());
        }
        if (dto.getProposedFeePercentage() != null) {
            mi.setProposedFeePercentage(dto.getProposedFeePercentage());
        }

        // Không cho client đổi status ở CRUD update; status phải đi qua accept/reject
        return mentorInvitationRepository.save(mi);
    }

    @Override
    public void deleteMentorInvitation(String id) {
        mentorInvitationRepository.deleteById(id);
    }

    // ---------- workflow ----------

    @Override
    public List<MentorInvitation> getInvitationsByMentor(String mentorId) {
        return mentorInvitationRepository.findByMentorIdOrderByCreatedAtDesc(mentorId);
    }

    @Override
    public List<MentorInvitation> getInvitationsByProject(String projectId) {
        return mentorInvitationRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Override
    @Transactional
    public MentorInvitation acceptInvitation(String invitationId) {
        MentorInvitation mi = getMentorInvitationById(invitationId);

        if (mi.getStatus() != MentorInvitationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING invitation can be accepted");
        }

        String projectId = mi.getProject() != null ? mi.getProject().getId() : null;
        String mentorId = mi.getMentor() != null ? mi.getMentor().getId() : null;

        if (projectId == null || mentorId == null) {
            throw new IllegalStateException("Invitation is missing project/mentor");
        }

        // Nếu mentor đã được gán vào project trước đó -> coi như accept không hợp lệ
        if (projectMentorRepository.existsByProjectIdAndMentorId(projectId, mentorId)) {
            throw new IllegalStateException("Mentor already assigned to this project");
        }

        // Enforce: mỗi project chỉ có 1 MAIN_MENTOR
        boolean hasMainMentor = projectMentorRepository
                .findFirstByProjectIdAndRole(projectId, ProjectMentorRole.MAIN_MENTOR)
                .isPresent();

        ProjectMentorRole roleToAssign = hasMainMentor ? ProjectMentorRole.CO_MENTOR : ProjectMentorRole.MAIN_MENTOR;

        // 1) update invitation
        mi.setStatus(MentorInvitationStatus.ACCEPTED);
        mi.setRespondedAt(LocalDateTime.now());
        mentorInvitationRepository.save(mi);

        // 2) auto create project_mentors
        ProjectMentor pm = ProjectMentor.builder()
                .project(mi.getProject())
                .mentor(mi.getMentor())
                .role(roleToAssign)
                .status(ProjectMentorStatus.ACTIVE)
                .build();

        projectMentorRepository.save(pm);

        return mi;
    }

    @Override
    @Transactional
    public MentorInvitation rejectInvitation(String invitationId) {
        MentorInvitation mi = getMentorInvitationById(invitationId);

        if (mi.getStatus() != MentorInvitationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING invitation can be rejected");
        }

        mi.setStatus(MentorInvitationStatus.REJECTED);
        mi.setRespondedAt(LocalDateTime.now());

        mentorInvitationRepository.save(mi);
        return mi;
    }

    @Override
    public MentorInvitation updateProposedFee(String invitationId, BigDecimal proposedFeePercentage) {
        MentorInvitation mi = getMentorInvitationById(invitationId);

        if (mi.getStatus() != MentorInvitationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING invitation can update proposed fee");
        }
        if (proposedFeePercentage == null) {
            throw new IllegalArgumentException("proposedFeePercentage is required");
        }
        if (proposedFeePercentage.compareTo(BigDecimal.ZERO) < 0
                || proposedFeePercentage.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("proposedFeePercentage must be between 0 and 100");
        }

        mi.setProposedFeePercentage(proposedFeePercentage);
        mentorInvitationRepository.save(mi);
        return mi;
    }
}