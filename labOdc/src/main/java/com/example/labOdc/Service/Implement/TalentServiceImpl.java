package com.example.labOdc.Service.Implement;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.Response.FundDistributionResponse;
import com.example.labOdc.DTO.Response.ProjectApplicationResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.DTO.Response.TalentResponse;
import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TalentDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.FundDistribution;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectApplication;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.Talent;
import com.example.labOdc.Model.Task;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Model.ValidationStatus;
import com.example.labOdc.Repository.FundAllocationRepository;
import com.example.labOdc.Repository.FundDistributionRepository;
import com.example.labOdc.Repository.ProjectApplicationRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.ProjectTeamRepository;
import com.example.labOdc.Repository.RoleRepository;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Repository.TaskRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.TalentService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class TalentServiceImpl implements TalentService {

    private static final Logger logger = LoggerFactory.getLogger(TalentServiceImpl.class);
    private final TalentRepository talentRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final ProjectApplicationRepository projectApplicationRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final TaskRepository taskRepository;
    private final FundAllocationRepository fundAllocationRepository;
    private final FundDistributionRepository fundDistributionRepository;

    @Override
    @Transactional
    public TalentResponse createTalent(TalentDTO talentDTO) {
        logger.info("Creating or updating talent profile");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated user");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if talent profile already exists
        Talent talent = talentRepository.findByUserId(user.getId())
                .orElseGet(() -> Talent.builder()
                        .user(user)
                        .status(Talent.Status.AVAILABLE)
                        .build()
                );

        // Update talent fields from DTO
        updateTalentFields(talent, talentDTO);

        Talent savedTalent = talentRepository.save(talent);

        // Update user role to TALENT
        RoleEntity talentRole = roleRepository.findByRole(UserRole.TALENT)
                .orElseThrow(() -> new ResourceNotFoundException("TALENT role not found"));

        user.getRoles().clear();
        user.getRoles().add(talentRole);
        userRepository.save(user);
        logger.info("User role updated to TALENT: {}", username);

        logger.info("Talent profile created/updated successfully for user: {}", username);
        return TalentResponse.fromTalent(savedTalent);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public TalentResponse getMyTalent() {
        Talent talent = getCurrentTalent();
        return TalentResponse.fromTalent(talent);
    }

    @Override
    @Transactional
    public TalentResponse updateMyTalent(TalentDTO talentDTO) {
        Talent talent = getCurrentTalent();
        updateTalentFields(talent, talentDTO);
        Talent updated = talentRepository.save(talent);
        return TalentResponse.fromTalent(updated);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public TalentResponse getTalentById(String id) {
        logger.debug("Fetching talent with ID: {}", id);
        Talent talent = talentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Talent not found"));
        return TalentResponse.fromTalent(talent);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TalentResponse> getAllTalents() {
        logger.debug("Fetching all talents");
        return talentRepository.findAll().stream()
                .map(TalentResponse::fromTalent)
                .toList();
    }

    @Override
    @Transactional
    public void deleteTalent(String id) {
        logger.info("Deleting talent with ID: {}", id);
        Talent talent = talentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Talent not found"));
        talentRepository.delete(talent);
        logger.info("Talent deleted successfully");
    }

    @Override
    @Transactional
    public TalentResponse updateTalent(TalentDTO talentDTO, String id) {
        logger.info("Updating talent with ID: {}", id);
        Talent talent = talentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Talent not found"));

        updateTalentFields(talent, talentDTO);

        Talent updatedTalent = talentRepository.save(talent);
        logger.info("Talent updated successfully");
        return TalentResponse.fromTalent(updatedTalent);
    }

    /**
     * Helper method to update talent fields from DTO
     * Only updates non-null fields to support partial updates
     */
    private void updateTalentFields(Talent talent, TalentDTO dto) {
        if (dto.getStudentCode() != null)
            talent.setStudentCode(dto.getStudentCode());
        if (dto.getMajor() != null)
            talent.setMajor(dto.getMajor());
        if (dto.getYear() != null)
            talent.setYear(dto.getYear());
        if (dto.getSkills() != null)
            talent.setSkills(dto.getSkills());
        if (dto.getCertifications() != null)
            talent.setCertifications(dto.getCertifications());
        if (dto.getPortfolioUrl() != null)
            talent.setPortfolioUrl(dto.getPortfolioUrl());
        if (dto.getGithubUrl() != null)
            talent.setGithubUrl(dto.getGithubUrl());
        if (dto.getLinkedinUrl() != null)
            talent.setLinkedinUrl(dto.getLinkedinUrl());
    }

    /**
     * Helper method to get current logged-in talent
     */
    private Talent getCurrentTalent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated user");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return talentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Talent profile not found for user: " + username));
    }

    @Override
    @Transactional
    public void applyToProject(String projectId, String coverLetter) {
        logger.info("Talent applying to project {}", projectId);
        
        Talent talent = getCurrentTalent();
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (project.getValidationStatus() != ValidationStatus.APPROVED) {
            throw new IllegalStateException("This project is not approved yet");
        }

        if (projectTeamRepository.existsByProjectIdAndTalentId(projectId, talent.getId())) {
            throw new IllegalStateException("You are already a member of this project");
        }

        ProjectApplication existing = projectApplicationRepository
                .findByProjectIdAndTalentId(projectId, talent.getId())
                .orElse(null);

        if (existing != null) {
            if (existing.getStatus() == ProjectApplication.Status.WITHDRAWN) {
                existing.setStatus(ProjectApplication.Status.PENDING);
                existing.setCoverLetter(coverLetter);
                existing.setAppliedAt(java.time.LocalDateTime.now());
                projectApplicationRepository.save(existing);
                logger.info("Re-submitted withdrawn application for talent: {}", talent.getId());
                return;
            }

            throw new IllegalStateException("You already have an application for this project (status: "
                    + existing.getStatus() + ")");
        }
        
        ProjectApplication application = ProjectApplication.builder()
                .project(project)
                .talent(talent)
                .coverLetter(coverLetter)
                .status(ProjectApplication.Status.PENDING)
                .build();
        
        projectApplicationRepository.save(application);
        logger.info("Application created successfully for talent: {}", talent.getId());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ProjectResponse> getAvailableProjects() {
        logger.debug("Fetching available projects for talent application");
        // Per UI requirement: talent can browse all projects.
        // Applying to a project can still enforce additional business rules elsewhere.
        return projectRepository.findAll().stream()
                .map(ProjectResponse::fromProject)
                .toList();
    }

        @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ProjectApplicationResponse> getMyApplications() {
    logger.debug("Fetching applications for current talent");


    Talent talent = getCurrentTalent();


    return projectApplicationRepository
    .findByTalentId(talent.getId())
    .stream()
    .map(ProjectApplicationResponse::from)
    .toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects() {
        logger.debug("Fetching projects for current talent");
        
        Talent talent = getCurrentTalent();
        return projectTeamRepository.findByTalentId(talent.getId()).stream()
                .map(pt -> ProjectResponse.fromProject(pt.getProject()))
                .toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<TaskResponse> getAssignedTasks() {
        logger.debug("Fetching assigned tasks for current talent");

        Talent talent = getCurrentTalent();

        return taskRepository.findByAssignedTo(talent.getId())
                .stream()
                .map(TaskResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional
    public void updateTaskProgress(String taskId, String status) {
        logger.info("Updating task progress for taskId: {} to status: {}", taskId, status);
        
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        try {
            Task.Status taskStatus = Task.Status.valueOf(status.toUpperCase());
            task.setStatus(taskStatus);
            
            if (taskStatus == Task.Status.DONE) {
                task.setCompletedDate(java.time.LocalDate.now());
                logger.info("Task marked as done with completion date");
            }
            
            taskRepository.save(task);
            logger.info("Task progress updated successfully");
        } catch (IllegalArgumentException e) {
            logger.error("Invalid task status: {}", status);
            throw new IllegalArgumentException("Invalid task status: " + status);
        }
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<FundDistributionResponse> viewTeamFundDistribution(String projectId) {
        logger.info("Viewing team fund distribution for projectId: {}", projectId);

        return fundAllocationRepository.findByProjectId(projectId)
            .map(fundAllocation ->
                fundDistributionRepository
                    .findByFundAllocationId(fundAllocation.getId())
                    .stream()
                    .map(FundDistributionResponse::fromEntity)
                    .toList()
            )
            .orElseGet(List::of); // không có allocation → trả list rỗng
    }
}
