package com.example.labOdc.Service.Implement;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.labOdc.DTO.ProjectTeamDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectTeam;
import com.example.labOdc.Model.ProjectTeamStatus;
import com.example.labOdc.Model.Talent;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.ProjectTeamRepository;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Service.ProjectTeamService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProjectTeamServiceImpl implements ProjectTeamService {

    private final ProjectTeamRepository projectTeamRepository;
    private final ProjectRepository projectRepository;
    private final TalentRepository talentRepository;

    @Override
    public ProjectTeam createProjectTeam(ProjectTeamDTO dto) {
        if (dto.getProjectId() == null || dto.getProjectId().isBlank()) {
            throw new IllegalArgumentException("projectId is required");
        }
        if (dto.getTalentId() == null || dto.getTalentId().isBlank()) {
            throw new IllegalArgumentException("talentId is required");
        }

        if (projectTeamRepository.existsByProjectIdAndTalentId(dto.getProjectId(), dto.getTalentId())) {
            throw new IllegalArgumentException("Talent already in this project team");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));

        Talent talent = talentRepository.findById(dto.getTalentId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent", "id", dto.getTalentId()));

        ProjectTeam pt = ProjectTeam.builder()
                .project(project)
                .talent(talent)
                .isLeader(dto.getIsLeader() != null ? dto.getIsLeader() : false)
                .joinedDate(dto.getJoinedDate())
                .leftDate(dto.getLeftDate())
                .status(dto.getStatus() != null ? dto.getStatus() : ProjectTeamStatus.ACTIVE)
                .performanceRating(dto.getPerformanceRating())
                .build();

        pt = projectTeamRepository.save(pt);

        // Nếu tạo với isLeader=true => enforce 1 leader ngay
        if (Boolean.TRUE.equals(pt.getIsLeader())) {
            pt = setLeader(pt.getId());
        }

        return pt;
    }

    @Override
    public List<ProjectTeam> getAllProjectTeam() {
        return projectTeamRepository.findAll();
    }

    @Override
    public ProjectTeam getProjectTeamById(String id) {
        return projectTeamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectTeam", "id", id));
    }

    @Override
    public ProjectTeam updateProjectTeam(ProjectTeamDTO dto, String id) {
        ProjectTeam pt = getProjectTeamById(id);

        // đổi project/talent (không khuyến khích vì đụng unique, nhưng giữ theo CRUD)
        if (dto.getProjectId() != null && !dto.getProjectId().isBlank()) {
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));
            pt.setProject(project);
        }
        if (dto.getTalentId() != null && !dto.getTalentId().isBlank()) {
            Talent talent = talentRepository.findById(dto.getTalentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Talent", "id", dto.getTalentId()));
            pt.setTalent(talent);
        }

        if (dto.getJoinedDate() != null)
            pt.setJoinedDate(dto.getJoinedDate());
        if (dto.getLeftDate() != null)
            pt.setLeftDate(dto.getLeftDate());
        if (dto.getStatus() != null)
            pt.setStatus(dto.getStatus());
        if (dto.getPerformanceRating() != null)
            pt.setPerformanceRating(dto.getPerformanceRating());

        // leader phải đi qua workflow setLeader để enforce 1 leader
        if (dto.getIsLeader() != null && dto.getIsLeader()) {
            projectTeamRepository.save(pt);
            return setLeader(pt.getId());
        }
        if (dto.getIsLeader() != null && !dto.getIsLeader()) {
            pt.setIsLeader(false);
        }

        return projectTeamRepository.save(pt);
    }

    @Override
    public void deleteProjectTeam(String id) {
        projectTeamRepository.deleteById(id);
    }

    // ---------- workflow ----------

    @Override
    public List<ProjectTeam> getProjectTeamsByProjectId(String projectId) {
        return projectTeamRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Override
    @Transactional
    public ProjectTeam setLeader(String projectTeamId) {
        ProjectTeam target = getProjectTeamById(projectTeamId);

        if (target.getStatus() == ProjectTeamStatus.REMOVED) {
            throw new IllegalStateException("Cannot set leader for REMOVED member");
        }

        String projectId = target.getProject() != null ? target.getProject().getId() : null;
        if (projectId == null) {
            throw new IllegalStateException("ProjectTeam is missing project");
        }

        projectTeamRepository.findFirstByProjectIdAndIsLeaderTrue(projectId)
                .ifPresent(currentLeader -> {
                    if (!currentLeader.getId().equals(target.getId())) {
                        currentLeader.setIsLeader(false);
                        projectTeamRepository.save(currentLeader);
                    }
                });

        target.setIsLeader(true);
        return projectTeamRepository.save(target);
    }

    @Override
    public ProjectTeam removeMember(String projectTeamId, LocalDate leftDate) {
        ProjectTeam pt = getProjectTeamById(projectTeamId);

        pt.setStatus(ProjectTeamStatus.REMOVED);
        pt.setIsLeader(false);
        pt.setLeftDate(leftDate != null ? leftDate : LocalDate.now());

        return projectTeamRepository.save(pt);
    }
}