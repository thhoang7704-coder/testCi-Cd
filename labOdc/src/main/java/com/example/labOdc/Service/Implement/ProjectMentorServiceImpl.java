package com.example.labOdc.Service.Implement;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.labOdc.DTO.ProjectMentorDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectMentor;
import com.example.labOdc.Model.ProjectMentorRole;
import com.example.labOdc.Model.ProjectMentorStatus;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectMentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Service.ProjectMentorService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProjectMentorServiceImpl implements ProjectMentorService {

    private final ProjectMentorRepository projectMentorRepository;
    private final ProjectRepository projectRepository;
    private final MentorRepository mentorRepository;

    @Override
    public ProjectMentor createProjectMentor(ProjectMentorDTO dto) {
        if (dto.getProjectId() == null || dto.getProjectId().isBlank()) {
            throw new IllegalArgumentException("projectId is required");
        }
        if (dto.getMentorId() == null || dto.getMentorId().isBlank()) {
            throw new IllegalArgumentException("mentorId is required");
        }

        if (projectMentorRepository.existsByProjectIdAndMentorId(dto.getProjectId(), dto.getMentorId())) {
            throw new IllegalArgumentException("Mentor already assigned to this project");
        }

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));

        Mentor mentor = mentorRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", dto.getMentorId()));

        ProjectMentorStatus status = parseStatusOrDefault(dto.getStatus(), ProjectMentorStatus.ACTIVE);

        ProjectMentor pm = ProjectMentor.builder()
                .project(project)
                .mentor(mentor)
                .role(dto.getRole() != null ? dto.getRole() : ProjectMentorRole.MAIN_MENTOR)
                .status(status)
                .build();

        return projectMentorRepository.save(pm);
    }

    @Override
    public List<ProjectMentor> getAllProjectMentor() {
        return projectMentorRepository.findAll();
    }

    @Override
    public ProjectMentor getProjectMentorById(String id) {
        return projectMentorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectMentor", "id", id));
    }

    @Override
    public ProjectMentor updateProjectMentor(ProjectMentorDTO dto, String id) {
        ProjectMentor pm = getProjectMentorById(id);

        // đổi project (nếu có)
        if (dto.getProjectId() != null && !dto.getProjectId().isBlank()) {
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", dto.getProjectId()));
            pm.setProject(project);
        }

        // đổi mentor (nếu có)
        if (dto.getMentorId() != null && !dto.getMentorId().isBlank()) {
            Mentor mentor = mentorRepository.findById(dto.getMentorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", dto.getMentorId()));
            pm.setMentor(mentor);
        }

        // status
        if (dto.getStatus() != null) {
            pm.setStatus(parseStatus(dto.getStatus()));
        }

        // role: không cho set MAIN_MENTOR trực tiếp, bắt buộc dùng setMainMentor()
        if (dto.getRole() != null) {
            if (dto.getRole() == ProjectMentorRole.MAIN_MENTOR) {
                throw new IllegalStateException("Use /set-main endpoint to set MAIN_MENTOR");
            }
            pm.setRole(dto.getRole());
        }

        return projectMentorRepository.save(pm);
    }

    @Override
    public void deleteProjectMentor(String id) {
        projectMentorRepository.deleteById(id);
    }

    @Override
    public List<ProjectMentor> getProjectMentorsByProjectId(String projectId) {
        return projectMentorRepository.findByProjectIdOrderByAssignedAtDesc(projectId);
    }

    @Override
    public ProjectMentor getMainMentorByProjectId(String projectId) {
        return projectMentorRepository.findFirstByProjectIdAndRole(projectId, ProjectMentorRole.MAIN_MENTOR)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectMentor", "projectId", projectId));
    }

    @Override
    @Transactional
    public ProjectMentor setMainMentor(String projectMentorId) {
        ProjectMentor target = getProjectMentorById(projectMentorId);

        String projectId = target.getProject() != null ? target.getProject().getId() : null;
        if (projectId == null) {
            throw new IllegalStateException("ProjectMentor is missing project");
        }

        // demote main mentor hiện tại (nếu có)
        projectMentorRepository.findFirstByProjectIdAndRole(projectId, ProjectMentorRole.MAIN_MENTOR)
                .ifPresent(currentMain -> {
                    if (!currentMain.getId().equals(target.getId())) {
                        currentMain.setRole(ProjectMentorRole.CO_MENTOR);
                        projectMentorRepository.save(currentMain);
                    }
                });

        target.setRole(ProjectMentorRole.MAIN_MENTOR);
        return projectMentorRepository.save(target);
    }

    private ProjectMentorStatus parseStatus(String statusStr) {
        try {
            return ProjectMentorStatus.valueOf(statusStr.trim().toUpperCase());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid ProjectMentorStatus: " + statusStr);
        }
    }

    private ProjectMentorStatus parseStatusOrDefault(String statusStr, ProjectMentorStatus defaultValue) {
        if (statusStr == null || statusStr.isBlank())
            return defaultValue;
        return parseStatus(statusStr);
    }
}