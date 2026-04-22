package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/dev/seed")
@RequiredArgsConstructor
public class DevSeedController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MentorRepository mentorRepository;
    private final TalentRepository talentRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMentorRepository projectMentorRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    public record SeedMentorWorkflowResult(
            String projectId,
            String projectName,
            String mentorId,
            String mentorUserId,
            String talentId,
            String talentEmail,
            String talentPassword,
            List<String> createdTaskIds
    ) {
    }

    @PostMapping("/mentor-workflow")
    @PreAuthorize("hasRole('MENTOR')")
    @Transactional
    public ApiResponse<SeedMentorWorkflowResult> seedMentorWorkflow(java.security.Principal principal) {
        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            return ApiResponse.error("Unauthenticated", HttpStatus.UNAUTHORIZED);
        }

        // Ensure base roles exist
        ensureRole(UserRole.MENTOR);
        ensureRole(UserRole.TALENT);
        ensureRole(UserRole.COMPANY);

        // Resolve current mentor user
        final String login = principal.getName();
        User mentorUser = userRepository.findByUsername(login)
                .or(() -> userRepository.findByEmail(login))
                .orElseThrow(() -> new com.example.labOdc.Exception.ResourceNotFoundException("User not found"));

        // Ensure Mentor entity exists for current user
        Mentor mentor = mentorRepository.findByUserId(mentorUser.getId())
                .orElseGet(() -> mentorRepository.save(Mentor.builder()
                        .user(mentorUser)
                        .expertise("Demo mentorship")
                        .yearsExperience(3)
                        .bio("Seeded mentor profile")
                        .status(Mentor.Status.AVAILABLE)
                        .build()));

        // Ensure demo talent user
        final String talentEmail = "talent.demo@lab.local";
        final String talentPassword = "Password123!";

        User talentUser = userRepository.findByEmail(talentEmail).orElseGet(() -> {
            RoleEntity talentRole = roleRepository.findByRole(UserRole.TALENT)
                    .orElseThrow(() -> new IllegalStateException("Role TALENT not found"));

            User u = User.builder()
                    .email(talentEmail)
                    .username("talent_demo")
                    .fullName("Talent Demo")
                    .password(passwordEncoder.encode(talentPassword))
                    .build();
            u.getRoles().add(talentRole);
            return userRepository.save(u);
        });

        Talent talent = talentRepository.findByUserId(talentUser.getId())
                .orElseGet(() -> talentRepository.save(Talent.builder()
                        .user(talentUser)
                        .studentCode("DEMO-STUDENT-001")
                        .major("Software Engineering")
                        .year(3)
                        .skills("Java, Spring Boot, React")
                        .status(Talent.Status.AVAILABLE)
                        .build()));

        // Ensure demo company
        final String companyEmail = "company.demo@lab.local";
        final String companyPassword = "Password123!";
        User companyUser = userRepository.findByEmail(companyEmail).orElseGet(() -> {
            RoleEntity companyRole = roleRepository.findByRole(UserRole.COMPANY)
                    .orElseThrow(() -> new IllegalStateException("Role COMPANY not found"));

            User u = User.builder()
                    .email(companyEmail)
                    .username("company_demo")
                    .fullName("Company Demo")
                    .password(passwordEncoder.encode(companyPassword))
                    .build();
            u.getRoles().add(companyRole);
            return userRepository.save(u);
        });

        Company company = companyRepository.findByUserId(companyUser.getId())
                .orElseGet(() -> companyRepository.save(Company.builder()
                        .user(companyUser)
                        .companyName("Demo Company")
                        .address("HCMC")
                        .website("https://example.com")
                        .taxCode(nextAvailableTaxCode())
                        .status(Company.Status.APPROVED)
                        .build()));

        // Create or reuse demo project (unique by projectCode)
        final String projectCode = "DEMO-MENTOR-TASKS";
        Project project = projectRepository.findByProjectCode(projectCode).orElseGet(() -> projectRepository.save(Project.builder()
                .company(company)
                .mentor(mentor)
                .projectName("Demo Project - Mentor Task Workflow")
                .projectCode(projectCode)
                .description("Seeded project to test: mentor add/import tasks + assign to talent")
                .requirements("Seed data")
                .requiredSkills("Java, Spring")
                .budget(new BigDecimal("10000000"))
                .durationMonths(2)
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusMonths(2))
                .status(ProjectStatus.IN_PROGRESS)
                .validationStatus(ValidationStatus.APPROVED)
                .maxTeamSize(5)
                .build()));

        // Ensure project-mentor link exists
        if (!projectMentorRepository.existsByProjectIdAndMentorId(project.getId(), mentor.getId())) {
            projectMentorRepository.save(ProjectMentor.builder()
                    .project(project)
                    .mentor(mentor)
                    .role(ProjectMentorRole.MAIN_MENTOR)
                    .status(ProjectMentorStatus.ACTIVE)
                    .build());
        }

        // Ensure project-team link exists
        if (!projectTeamRepository.existsByProjectIdAndTalentId(project.getId(), talent.getId())) {
            projectTeamRepository.save(ProjectTeam.builder()
                    .project(project)
                    .talent(talent)
                    .isLeader(false)
                    .joinedDate(LocalDate.now())
                    .status(ProjectTeamStatus.ACTIVE)
                    .build());
        }

        // Create sample tasks if not present (idempotent by name)
        List<Task> existing = taskRepository.findByProjectId(project.getId());
        Set<String> existingNames = new HashSet<>();
        for (Task t : existing) existingNames.add(String.valueOf(t.getTaskName()));

        List<Task> toCreate = new ArrayList<>();
        toCreate.add(buildTaskIfMissing(existingNames, project.getId(), mentorUser.getId(), null,
                "Setup project repo", Task.Priority.HIGH, Task.Status.TODO, LocalDate.now(), LocalDate.now().plusDays(3)));
        toCreate.add(buildTaskIfMissing(existingNames, project.getId(), mentorUser.getId(), null,
                "Design database schema", Task.Priority.MEDIUM, Task.Status.TODO, LocalDate.now(), LocalDate.now().plusDays(5)));

        toCreate.add(buildTaskIfMissing(existingNames, project.getId(), mentorUser.getId(), talent.getId(),
                "Implement login flow", Task.Priority.HIGH, Task.Status.IN_PROGRESS, LocalDate.now().minusDays(2), LocalDate.now().plusDays(4)));

        Task done = buildTaskIfMissing(existingNames, project.getId(), mentorUser.getId(), talent.getId(),
                "Create profile page", Task.Priority.LOW, Task.Status.DONE, LocalDate.now().minusDays(7), LocalDate.now().minusDays(1));
        if (done != null) {
            done.setCompletedDate(LocalDate.now().minusDays(1));
            toCreate.add(done);
        }

        List<String> createdIds = new ArrayList<>();
        for (Task t : toCreate) {
            if (t == null) continue;
            Task saved = taskRepository.save(t);
            createdIds.add(saved.getId());
        }

        SeedMentorWorkflowResult result = new SeedMentorWorkflowResult(
                project.getId(),
                project.getProjectName(),
                mentor.getId(),
                mentorUser.getId(),
                talent.getId(),
                talentEmail,
                talentPassword,
                createdIds
        );

        return ApiResponse.success(result, "Seeded demo project/team/tasks. Login talent with provided credentials.", HttpStatus.OK);
    }

    private void ensureRole(UserRole role) {
        roleRepository.findByRole(role).orElseGet(() -> roleRepository.save(RoleEntity.builder().role(role).build()));
    }

        private String nextAvailableTaxCode() {
                String base = "DEMO-TAX-001";
                if (!companyRepository.existsByTaxCode(base)) return base;
                return "DEMO-TAX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

    private Task buildTaskIfMissing(
            Set<String> existingNames,
            String projectId,
            String createdBy,
            String assignedTo,
            String taskName,
            Task.Priority priority,
            Task.Status status,
            LocalDate startDate,
            LocalDate dueDate
    ) {
        if (existingNames.contains(taskName)) return null;
        existingNames.add(taskName);

        return Task.builder()
                .projectId(projectId)
                .createdBy(createdBy)
                .assignedTo(assignedTo)
                .taskName(taskName)
                .description("Seeded task: " + taskName)
                .priority(priority)
                .status(status)
                .startDate(startDate)
                .dueDate(dueDate)
                .estimatedHours(new BigDecimal("8"))
                .attachments(List.of())
                .build();
    }
}
