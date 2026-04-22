package com.example.labOdc.Service.Implement;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.labOdc.DTO.ProjectDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Company;
import com.example.labOdc.Model.LabAdmin;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectStatus;
import com.example.labOdc.Model.ProjectTeam;
import com.example.labOdc.Model.ValidationStatus;
import com.example.labOdc.Model.User;
import com.example.labOdc.Repository.CompanyRepository;
import com.example.labOdc.Repository.LabAdminRepository;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.ProjectTeamRepository;
import com.example.labOdc.Repository.ProjectMentorRepository;
import com.example.labOdc.Repository.TaskRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.NotificationService;
import com.example.labOdc.Service.ProjectService;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;
    private final MentorRepository mentorRepository;
    private final LabAdminRepository labAdminRepository;
    private final UserRepository userRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final ProjectMentorRepository projectMentorRepository;
    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    private User getCurrentUserOrThrow() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Unauthenticated request");
        }

        String usernameOrEmail = auth.getName();
        return userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Company getCurrentCompanyOrThrow() {
        User user = getCurrentUserOrThrow();
        return companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private void assertOwnedByCurrentCompany(Project project) {
        Company currentCompany = getCurrentCompanyOrThrow();
        if (project.getCompany() == null || project.getCompany().getId() == null
                || !project.getCompany().getId().equals(currentCompany.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Project does not belong to your company");
        }
    }

    @Override
    public Project createProject(ProjectDTO dto) {
        if (dto.getProjectCode() != null && !dto.getProjectCode().isBlank()) {
            if (projectRepository.existsByProjectCode(dto.getProjectCode())) {
                throw new IllegalArgumentException("projectCode already exists");
            }
        }

        if (dto.getCompanyId() == null || dto.getCompanyId().isBlank()) {
            throw new IllegalArgumentException("companyId is required");
        }

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", dto.getCompanyId()));

        Mentor mentor = null;
        if (dto.getMentorId() != null && !dto.getMentorId().isBlank()) {
            mentor = mentorRepository.findById(dto.getMentorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", dto.getMentorId()));
        }

        Project project = Project.builder()
                .company(company)
                .mentor(mentor)
                .projectName(dto.getProjectName())
                .projectCode(dto.getProjectCode())
                .description(dto.getDescription())
                .requirements(dto.getRequirements())
                .budget(dto.getBudget())
                .durationMonths(dto.getDurationMonths())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .actualEndDate(dto.getActualEndDate())
                // status + validationStatus để default theo entity
                .maxTeamSize(dto.getMaxTeamSize() != null ? dto.getMaxTeamSize() : 5)
                .requiredSkills(dto.getRequiredSkills())
                .build();

        return projectRepository.save(project);
    }

    @Override
    public List<Project> getAllProject() {
        return projectRepository.findAll();
    }

    @Override
    public Project getProjectById(String id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", id));
    }

    @Override
    public Project updateProject(ProjectDTO dto, String id) {
        Project project = getProjectById(id);

        if (!(project.getStatus() == ProjectStatus.DRAFT
                || project.getValidationStatus() == ValidationStatus.REJECTED)) {
            throw new IllegalStateException("Only DRAFT or REJECTED projects can be edited");
        }

        if (dto.getProjectCode() != null && !dto.getProjectCode().isBlank()) {
            if (!dto.getProjectCode().equals(project.getProjectCode())
                    && projectRepository.existsByProjectCode(dto.getProjectCode())) {
                throw new IllegalArgumentException("projectCode already exists");
            }
            project.setProjectCode(dto.getProjectCode());
        }

        if (dto.getCompanyId() != null && !dto.getCompanyId().isBlank()) {
            Company company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Company", "id", dto.getCompanyId()));
            project.setCompany(company);
        }

        if (dto.getMentorId() != null) {
            if (dto.getMentorId().isBlank()) {
                project.setMentor(null);
            } else {
                Mentor mentor = mentorRepository.findById(dto.getMentorId())
                        .orElseThrow(() -> new ResourceNotFoundException("Mentor", "id", dto.getMentorId()));
                project.setMentor(mentor);
            }
        }

        if (dto.getProjectName() != null)
            project.setProjectName(dto.getProjectName());
        if (dto.getDescription() != null)
            project.setDescription(dto.getDescription());
        if (dto.getRequirements() != null)
            project.setRequirements(dto.getRequirements());

        if (dto.getBudget() != null)
            project.setBudget(dto.getBudget());
        if (dto.getDurationMonths() != null)
            project.setDurationMonths(dto.getDurationMonths());
        if (dto.getStartDate() != null)
            project.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            project.setEndDate(dto.getEndDate());
        if (dto.getActualEndDate() != null)
            project.setActualEndDate(dto.getActualEndDate());

        if (dto.getMaxTeamSize() != null)
            project.setMaxTeamSize(dto.getMaxTeamSize());
        if (dto.getRequiredSkills() != null)
            project.setRequiredSkills(dto.getRequiredSkills());

        return projectRepository.save(project);
    }

    @Override
    public void deleteProject(String id) {
        projectRepository.deleteById(id);
    }

    // ---------- workflow ----------

    @Override
    @Transactional
    public Project submitProject(String projectId) {
        Project project = getProjectById(projectId);

        assertOwnedByCurrentCompany(project);

        if (project.getStatus() != ProjectStatus.DRAFT) {
            throw new IllegalStateException("Only DRAFT project can be submitted");
        }

        project.setStatus(ProjectStatus.SUBMITTED);
        project.setValidationStatus(ValidationStatus.PENDING);
        project.setRejectionReason(null);

        return projectRepository.save(project);
    }

    @Override
    @Transactional
    public Project completeProject(String projectId) {
        Project project = getProjectById(projectId);
        assertOwnedByCurrentCompany(project);

        if (project.getStatus() != ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only IN_PROGRESS projects can be completed");
        }

        project.setStatus(ProjectStatus.COMPLETED);
        if (project.getActualEndDate() == null) {
            project.setActualEndDate(LocalDate.now());
        }

        Project saved = projectRepository.save(project);

        // ===== Notifications: mentor + lab admins + talents =====
        String projectName = saved.getProjectName() != null ? saved.getProjectName() : saved.getId();

        if (saved.getMentor() != null && saved.getMentor().getUser() != null) {
            notificationService.createForUser(
                    saved.getMentor().getUser(),
                    "Project completed",
                    "Project '" + projectName + "' has been marked COMPLETED by the company.",
                    "PROJECT_COMPLETED");
        }

        for (LabAdmin la : labAdminRepository.findAll()) {
            if (la != null && la.getUser() != null) {
                notificationService.createForUser(
                        la.getUser(),
                        "Project completed",
                        "Project '" + projectName + "' has been marked COMPLETED by the company.",
                        "PROJECT_COMPLETED");
            }
        }

        List<ProjectTeam> team = projectTeamRepository.findByProjectIdOrderByCreatedAtDesc(saved.getId());
        for (ProjectTeam pt : team) {
            if (pt == null || pt.getTalent() == null || pt.getTalent().getUser() == null) continue;
            // optionally notify only ACTIVE members
            if (pt.getStatus() != null && pt.getStatus().name() != null && !pt.getStatus().name().equals("ACTIVE")) {
                continue;
            }

            notificationService.createForUser(
                    pt.getTalent().getUser(),
                    "Project completed",
                    "Project '" + projectName + "' has been marked COMPLETED.",
                    "PROJECT_COMPLETED");
        }

        return saved;
    }

    @Override
    @Transactional
    public Project requestCompleteProject(String projectId) {
        Project project = getProjectById(projectId);

        // verify current user is a mentor associated with the project
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Unauthenticated request");
        }

        String usernameOrEmail = auth.getName();
        User currentUser = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var currentMentor = mentorRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("You are not a mentor"));

        boolean isAssigned = false;
        if (project.getMentor() != null && project.getMentor().getId() != null
                && project.getMentor().getId().equals(currentMentor.getId())) {
            isAssigned = true;
        }

        if (!isAssigned) {
            // check project_mentors table
            isAssigned = projectMentorRepository.existsByProjectIdAndMentorId(projectId, currentMentor.getId());
        }

        if (!isAssigned) {
            throw new org.springframework.security.access.AccessDeniedException("You are not assigned to this project");
        }

        // verify tasks all completed
        long totalTasks = taskRepository.countByProjectId(projectId);
        long completed = taskRepository.countByProjectIdAndStatus(projectId, com.example.labOdc.Model.Task.Status.DONE);

        if (totalTasks == 0) {
            throw new IllegalStateException("Project has no tasks to complete");
        }

        if (completed != totalTasks) {
            throw new IllegalStateException("All tasks must be completed before requesting project completion");
        }

        project.setStatus(ProjectStatus.COMPLETED);
        if (project.getActualEndDate() == null) project.setActualEndDate(LocalDate.now());

        Project saved = projectRepository.save(project);

        // notify company & lab admins & talents (same as completeProject)
        String projectName = saved.getProjectName() != null ? saved.getProjectName() : saved.getId();

        if (saved.getMentor() != null && saved.getMentor().getUser() != null) {
            notificationService.createForUser(
                    saved.getMentor().getUser(),
                    "Project completed",
                    "Project '" + projectName + "' has been marked COMPLETED by the mentor.",
                    "PROJECT_COMPLETED");
        }

        for (LabAdmin la : labAdminRepository.findAll()) {
            if (la != null && la.getUser() != null) {
                notificationService.createForUser(
                        la.getUser(),
                        "Project completed",
                        "Project '" + projectName + "' has been marked COMPLETED by the mentor.",
                        "PROJECT_COMPLETED");
            }
        }

        List<ProjectTeam> team = projectTeamRepository.findByProjectIdOrderByCreatedAtDesc(saved.getId());
        for (ProjectTeam pt : team) {
            if (pt == null || pt.getTalent() == null || pt.getTalent().getUser() == null) continue;
            if (pt.getStatus() != null && pt.getStatus().name() != null && !pt.getStatus().name().equals("ACTIVE")) {
                continue;
            }

            notificationService.createForUser(
                    pt.getTalent().getUser(),
                    "Project completed",
                    "Project '" + projectName + "' has been marked COMPLETED.",
                    "PROJECT_COMPLETED");
        }

        return saved;
    }

    @Override
    public Project approveProject(String projectId, String validatedById) {
        Project project = getProjectById(projectId);

        if (project.getStatus() != ProjectStatus.SUBMITTED) {
            throw new IllegalStateException("Project must be SUBMITTED before approval");
        }

        if (validatedById == null || validatedById.isBlank()) {
            throw new IllegalArgumentException("validatedBy is required");
        }

        LabAdmin validatedBy = labAdminRepository.findById(validatedById)
                .orElseThrow(() -> new ResourceNotFoundException("LabAdmin", "id", validatedById));

        project.setValidationStatus(ValidationStatus.APPROVED);
        project.setValidatedBy(validatedBy);
        project.setValidatedAt(LocalDateTime.now());
        project.setRejectionReason(null);

        project.setStatus(ProjectStatus.IN_PROGRESS);

        return projectRepository.save(project);
    }

    @Override
    public Project rejectProject(String projectId, String validatedById, String rejectionReason) {
        Project project = getProjectById(projectId);

        if (project.getStatus() != ProjectStatus.SUBMITTED) {
            throw new IllegalStateException("Project must be SUBMITTED before rejection");
        }
        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("rejectionReason is required");
        }
        if (validatedById == null || validatedById.isBlank()) {
            throw new IllegalArgumentException("validatedBy is required");
        }

        LabAdmin validatedBy = labAdminRepository.findById(validatedById)
                .orElseThrow(() -> new ResourceNotFoundException("LabAdmin", "id", validatedById));

        project.setValidationStatus(ValidationStatus.REJECTED);
        project.setValidatedBy(validatedBy);
        project.setValidatedAt(LocalDateTime.now());
        project.setRejectionReason(rejectionReason);

        project.setStatus(ProjectStatus.DRAFT);

        return projectRepository.save(project);
    }

    @Override
    public Project updateProjectStatus(String projectId, ProjectStatus status) {
        Project project = getProjectById(projectId);

        if (status == null)
            throw new IllegalArgumentException("status is required");

        project.setStatus(status);

        return projectRepository.save(project);
    }
}