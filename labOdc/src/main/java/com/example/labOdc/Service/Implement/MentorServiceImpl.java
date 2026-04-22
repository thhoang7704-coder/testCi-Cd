package com.example.labOdc.Service.Implement;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.MentorDTO;
import com.example.labOdc.DTO.Response.MentorInvitationResponse;
import com.example.labOdc.DTO.Response.MentorResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TaskDTO;
import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.MentorInvitation;
import com.example.labOdc.Model.MentorInvitationStatus;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.Task;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.MentorInvitationRepository;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectMentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.RoleRepository;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Repository.TaskRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.ExcelSubmissionService;
import com.example.labOdc.Service.MentorService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class MentorServiceImpl implements MentorService {

    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MentorInvitationRepository mentorInvitationRepository;
    private final ProjectMentorRepository projectMentorRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TalentRepository talentRepository;
    private final ExcelSubmissionService excelSubmissionService;

    @Override
@Transactional
public MentorResponse createMentor(MentorDTO mentorDTO) {

    // 1. Lấy user đang đăng nhập
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
        throw new RuntimeException("Unauthenticated user");
    }

    String username = auth.getName();

    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    // 2. Chặn tạo Mentor trùng cho cùng user
    if (mentorRepository.existsByUserId(user.getId())) {
        throw new RuntimeException("User already has Mentor profile");
    }

    // 3. Tạo Mentor
    Mentor mentor = Mentor.builder()
            .expertise(mentorDTO.getExpertise())
            .yearsExperience(mentorDTO.getYearsExperience())
            .bio(mentorDTO.getBio())
            .user(user)
            .status(Mentor.Status.AVAILABLE)
            .build();

    Mentor savedMentor = mentorRepository.save(mentor);

    // 4. Gán role MENTOR cho user (nếu chưa có)
    RoleEntity mentorRole = roleRepository.findByRole(UserRole.MENTOR)
            .orElseThrow(() -> new ResourceNotFoundException("MENTOR role not found"));

    boolean hasMentorRole = user.getRoles().stream()
            .anyMatch(r -> r.getRole() == UserRole.MENTOR);

    if (!hasMentorRole) {
        user.getRoles().add(mentorRole);
        userRepository.save(user);
    }

    return MentorResponse.fromMentor(savedMentor);
}
    /**
     * Chức năng: Lấy danh sách tất cả Mentors.
     * Repository: MentorRepository.findAll() - Truy vấn tất cả entities.
     */
    @Override
    public List<MentorResponse> getAllMentors() {
        return mentorRepository.findAll().stream()
                .map(MentorResponse::fromMentor)
                .toList();
    }

    /**
     * Chức năng: Xóa Mentor theo ID.
     * Repository: MentorRepository.deleteById() - Xóa entity theo ID.
     */
    @Override
    public void deleteMentor(String id) {
        mentorRepository.deleteById(id);
    }

    /**
     * Chức năng: Lấy Mentor theo ID.
     * Repository: MentorRepository.findById() - Truy vấn entity theo ID.
     */
    @Override
    public MentorResponse getMentorById(String id) {
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        return MentorResponse.fromMentor(mentor);
    }

    /**
     * Chức năng: Cập nhật Mentor theo ID.
     * Repository: MentorRepository.findById() và save() - Tìm và cập nhật entity.
     */
    @Override
    public MentorResponse updateMentor(MentorDTO mentorDTO, String id) {
        Mentor mentor = mentorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));

        if (mentorDTO.getExpertise() != null)
            mentor.setExpertise(mentorDTO.getExpertise());
        if (mentorDTO.getYearsExperience() != null)
            mentor.setYearsExperience(mentorDTO.getYearsExperience());
        if (mentorDTO.getBio() != null)
            mentor.setBio(mentorDTO.getBio());

        Mentor updatedMentor = mentorRepository.save(mentor);
        return MentorResponse.fromMentor(updatedMentor);
    }

    /**
     * Chức năng: Lọc danh sách Mentors theo trạng thái.
     * Repository: MentorRepository.findByStatus() - Truy vấn theo status.
     */
    @Override
    public List<MentorResponse> findByStatus(Mentor.Status status) {
        return mentorRepository.findByStatus(status).stream()
                .map(MentorResponse::fromMentor)
                .toList();
    }

    /**
     * Chức năng: Lọc danh sách Mentors theo rating tối thiểu.
     * Repository: MentorRepository.findByRatingGreaterThanEqual() - Truy vấn theo rating.
     */
    @Override
    public List<MentorResponse> findByRatingGreaterThanEqual(BigDecimal rating) {
        return mentorRepository.findByRatingGreaterThanEqual(rating).stream()
                .map(MentorResponse::fromMentor)
                .toList();
    }

    /**
     * Chức năng: Chấp nhận lời mời làm mentor cho dự án.
     * - Verify lời mời thuộc về mentor hiện tại
     * - Cập nhật status thành ACCEPTED
     * - Ghi nhận thời gian phản hồi
     */
    @Override
    @Transactional
    public void acceptInvite(String inviteId) {
        MentorInvitation invite = mentorInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor invitation not found"));

        // Verify the invitation belongs to the authenticated mentor
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated user");
        }

        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Mentor currentMentor = mentorRepository.findAll().stream()
                .filter(m -> m.getUser() != null && m.getUser().getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor profile not found for this user"));

        if (!invite.getMentor().getId().equals(currentMentor.getId())) {
            throw new RuntimeException("This invitation does not belong to you");
        }

        if (invite.getStatus() != MentorInvitationStatus.PENDING) {
            throw new RuntimeException("Only PENDING invitation can be accepted. Current status: " + invite.getStatus());
        }

        invite.setStatus(MentorInvitationStatus.ACCEPTED);
        invite.setRespondedAt(java.time.LocalDateTime.now());
        mentorInvitationRepository.save(invite);
    }

    /**
     * Chức năng: Chấp nhận lời mời và trả về entity (dùng cho controller).
     */
    @Transactional
    public MentorInvitation acceptInviteAndReturn(String inviteId) {
        acceptInvite(inviteId);
        return mentorInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor invitation not found"));
    }

    /**
     * Chức năng: Từ chối lời mời làm mentor cho dự án.
     * - Verify lời mời thuộc về mentor hiện tại
     * - Cập nhật status thành REJECTED
     * - Ghi nhận thời gian phản hồi
     * TODO: Thêm rejectionReason field vào MentorInvitation entity nếu cần lưu lý do
     */
    @Override
    @Transactional
    public void rejectInvite(String inviteId, String reason) {
        MentorInvitation invite = mentorInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor invitation not found"));

        // Verify the invitation belongs to the authenticated mentor
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated user");
        }

        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Mentor currentMentor = mentorRepository.findAll().stream()
                .filter(m -> m.getUser() != null && m.getUser().getId().equals(currentUser.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor profile not found for this user"));

        if (!invite.getMentor().getId().equals(currentMentor.getId())) {
            throw new RuntimeException("This invitation does not belong to you");
        }

        if (invite.getStatus() != MentorInvitationStatus.PENDING) {
            throw new RuntimeException("Only PENDING invitation can be rejected. Current status: " + invite.getStatus());
        }

        invite.setStatus(MentorInvitationStatus.REJECTED);
        invite.setRespondedAt(java.time.LocalDateTime.now());
        mentorInvitationRepository.save(invite);
    }

    /**
     * Chức năng: Từ chối lời mời và trả về entity (dùng cho controller).
     */
    @Transactional
    public MentorInvitation rejectInviteAndReturn(String inviteId, String reason) {
        rejectInvite(inviteId, reason);
        return mentorInvitationRepository.findById(inviteId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor invitation not found"));
    }


    @Override
    public void setMentorAvailability(String mentorId, Mentor.Status status) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        mentor.setStatus(status);
        mentorRepository.save(mentor);
    }

    @Override
    public List<MentorInvitationResponse> getMentorInvitations(String mentorId) {
        // Validate mentor exists
        mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        // Use optimized query instead of findAll().filter()
        return mentorInvitationRepository.findByMentorIdOrderByCreatedAtDesc(mentorId)
                .stream()
                .map(MentorInvitationResponse::fromMentorInvitation)
                .toList();
    }

    /**
     * Lấy danh sách lời mời của mentor hiện tại (từ SecurityContext).
     * Sắp xếp theo thời gian tạo mới nhất.
     */
    @Override
    public List<MentorInvitationResponse> getMyMentorInvitations() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null || auth.getName().isBlank()) {
            throw new RuntimeException("Unauthenticated user");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Mentor mentor = mentorRepository.findAll().stream()
                .filter(m -> m.getUser() != null && m.getUser().getId().equals(user.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Mentor profile not found for this user"));

        return getMentorInvitations(mentor.getId());
    }

    @Override
    public List<ProjectResponse> getAssignedProjects(String mentorId) {
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        return projectMentorRepository.findAll().stream()
                .filter(pm -> pm.getMentor().getId().equals(mentorId))
                .map(pm -> ProjectResponse.fromProject(pm.getProject()))
                .toList();
    }

        @Override
        public List<ProjectResponse> getMyAssignedProjects() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null || auth.getName().isBlank()) {
            throw new RuntimeException("Unauthenticated user");
        }

        String username = auth.getName();

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Mentor mentor = mentorRepository.findAll().stream()
            .filter(m -> m.getUser() != null && String.valueOf(m.getUser().getId()).equals(String.valueOf(user.getId())))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));

        return getAssignedProjects(mentor.getId());
        }

    @Override
    public void breakdownTasks(String projectId, String excelTemplate) {
        // Validate input and download bytes
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (excelTemplate == null || excelTemplate.isBlank()) {
            throw new RuntimeException("Empty excel template URL");
        }

        byte[] data;
        try {
            java.net.URL url = new java.net.URL(excelTemplate);
            java.net.URLConnection conn = url.openConnection();
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            try (java.io.InputStream urlStream = conn.getInputStream()) {
                data = urlStream.readAllBytes();
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to download excel template from URL: " + e.getMessage(), e);
        }

        if (data == null || data.length == 0) {
            throw new RuntimeException("Excel file downloaded from URL is empty");
        }

        String currentUserId = getCurrentUserIdSafe();
        processTaskBreakdownExcelBytes(projectId, data, currentUserId, "task-breakdown-url");
    }

    @Override
    public void breakdownTasksFromFile(String projectId, org.springframework.web.multipart.MultipartFile file) {
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("Empty excel file");
        }

        final byte[] data;
        try {
            data = file.getBytes();
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to read uploaded excel file: " + e.getMessage(), e);
        }

        String currentUserId = getCurrentUserIdSafe();
        String originalName = file.getOriginalFilename();
        String prefix = (originalName != null && !originalName.isBlank()) ? originalName : "task-breakdown-upload";
        processTaskBreakdownExcelBytes(projectId, data, currentUserId, prefix);
    }

    private void processTaskBreakdownExcelBytes(
            String projectId,
            byte[] data,
            String currentUserId,
            String filePrefix
    ) {
        if (data == null || data.length == 0) {
            throw new RuntimeException("Excel data is empty");
        }

        // Save file to local storage (uploads/excel/{projectId}/{timestamp}.xlsx)
        String fileUrl;
        try {
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads", "excel", projectId);
            java.nio.file.Files.createDirectories(uploadDir);
            String safePrefix = (filePrefix == null ? "task-breakdown" : filePrefix).replaceAll("[^a-zA-Z0-9._-]", "-");
            String filename = safePrefix + "-" + System.currentTimeMillis() + ".xlsx";
            java.nio.file.Path outPath = uploadDir.resolve(filename);
            java.nio.file.Files.write(outPath, data);
            fileUrl = outPath.toAbsolutePath().toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to persist uploaded excel file: " + e.getMessage(), e);
        }

        // Record submission
        try {
            excelSubmissionService.submitExcel(projectId, null, TemplateType.TASK_BREAKDOWN, fileUrl, currentUserId);
        } catch (Exception e) {
            System.err.println("Failed to record Excel submission: " + e.getMessage());
        }

        // Parse XLSX
        try (
                java.io.InputStream is = new java.io.ByteArrayInputStream(data);
                org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(is)
        ) {
            org.apache.poi.ss.usermodel.Sheet sheet = null;
            if (workbook.getNumberOfSheets() > 0) {
                sheet = workbook.getSheet("TASKS");
                if (sheet == null) sheet = workbook.getSheetAt(0);
            }
            if (sheet == null) {
                throw new RuntimeException("Excel template contains no sheets");
            }

            java.util.List<Task> tasksToSave = new java.util.ArrayList<>();
            java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");

            // Assume first row is header; start from row 1
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(r);
                if (row == null) continue;

                String taskName = getCellString(row.getCell(0));
                if (taskName == null || taskName.isBlank()) continue;
                String description = getCellString(row.getCell(1));
                String priorityStr = getCellString(row.getCell(2));
                String startDateStr = getCellString(row.getCell(3));
                String dueDateStr = getCellString(row.getCell(4));
                String estHoursStr = getCellString(row.getCell(5));
                String assignedTo = getCellString(row.getCell(6));

                Task task = Task.builder()
                        .projectId(projectId)
                        .taskName(taskName.trim())
                        .description(description)
                        .status(Task.Status.TODO)
                        .priority(parsePriority(priorityStr))
                        .excelTemplateUrl(fileUrl)
                        .createdBy(currentUserId)
                        .build();

                try {
                    if (startDateStr != null && !startDateStr.isBlank()) {
                        task.setStartDate(java.time.LocalDate.parse(startDateStr.trim(), dateFormatter));
                    }
                } catch (Exception ex) {
                    // ignore parse
                }

                try {
                    if (dueDateStr != null && !dueDateStr.isBlank()) {
                        task.setDueDate(java.time.LocalDate.parse(dueDateStr.trim(), dateFormatter));
                    }
                } catch (Exception ex) {
                    // ignore parse
                }

                try {
                    if (estHoursStr != null && !estHoursStr.isBlank()) {
                        task.setEstimatedHours(new java.math.BigDecimal(estHoursStr.trim()));
                    }
                } catch (Exception ex) {
                    // ignore parse
                }

                if (assignedTo != null && !assignedTo.isBlank()) {
                    String trimmedTalentId = assignedTo.trim();
                    if (talentRepository.findById(trimmedTalentId).isPresent()) {
                        task.setAssignedTo(trimmedTalentId);
                    } else {
                        System.out.println("Warning: Talent ID '" + trimmedTalentId + "' not found in row " + (r + 1) + ". Task created without assignment.");
                    }
                }

                tasksToSave.add(task);
            }

            if (!tasksToSave.isEmpty()) {
                taskRepository.saveAll(tasksToSave);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse task breakdown excel: " + e.getMessage(), e);
        }
    }

    private String getCellString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    java.time.LocalDate dt = cell.getLocalDateTimeCellValue().toLocalDate();
                    return dt.toString();
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try { return cell.getStringCellValue(); } catch (Exception e) { return String.valueOf(cell.getNumericCellValue()); }
            default:
                return null;
        }
    }

    private Task.Priority parsePriority(String p) {
        if (p == null) return null;
        try {
            return Task.Priority.valueOf(p.trim().toUpperCase());
        } catch (Exception ex) {
            return null;
        }
    }

    private String getCurrentUserIdSafe() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            String username = auth.getName();
            if (username == null) return null;
            User u = userRepository.findByUsername(username).orElse(null);
            return u != null ? u.getId() : null;
        } catch (Exception ex) {
            return null;
        }
    }

    @Override
    @Transactional
    public TaskResponse createTask(String projectId, TaskDTO taskDTO) {
        // Validate project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        
        // Validate talent exists if assignedTo is provided
        if (taskDTO.getAssignedTo() != null && !taskDTO.getAssignedTo().isBlank()) {
            String trimmedTalentId = taskDTO.getAssignedTo().trim();
            if (!talentRepository.findById(trimmedTalentId).isPresent()) {
                throw new ResourceNotFoundException("Talent ID '" + trimmedTalentId + "' not found");
            }
            taskDTO.setAssignedTo(trimmedTalentId);
        }
        
        // Get current user ID
        String currentUserId = getCurrentUserIdSafe();
        
        // Build and save task
        Task task = Task.builder()
                .projectId(projectId)
                .taskName(taskDTO.getTaskName())
                .description(taskDTO.getDescription())
                .priority(taskDTO.getPriority() != null ? taskDTO.getPriority() : Task.Priority.MEDIUM)
                .status(Task.Status.TODO)
                .startDate(taskDTO.getStartDate())
                .dueDate(taskDTO.getDueDate())
                .estimatedHours(taskDTO.getEstimatedHours())
                .attachments(taskDTO.getAttachments())
                .assignedTo(taskDTO.getAssignedTo())
                .createdBy(currentUserId)
                .build();
        
        Task savedTask = taskRepository.save(task);
        return TaskResponse.fromEntity(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse assignTask(String taskId, String talentId) {
        // Validate task exists
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        
        // Validate talent exists
        talentRepository.findById(talentId)
                .orElseThrow(() -> new ResourceNotFoundException("Talent not found"));
        
        // Assign task to talent
        task.setAssignedTo(talentId);
        Task updatedTask = taskRepository.save(task);
        
        return TaskResponse.fromEntity(updatedTask);
    }

    @Override
    public void updateTaskStatus(String taskId, String status) {
        // Placeholder: Cập nhật status task
        System.out.println("Updating task: " + taskId + " to status: " + status);
    }

    @Override
    public void submitReport(String projectId, String reportRequest) {
        // Placeholder: Gửi báo cáo
        System.out.println("Submitting report for project: " + projectId + " with content: " + reportRequest);
    }

    @Override
    public void evaluateTalent(String projectId, String talentId, String evaluationRequest) {
        // Placeholder: Đánh giá talent
        System.out.println("Evaluating talent: " + talentId + " in project: " + projectId + " with: " + evaluationRequest);
    }

    @Override
    public void approveFundDistribution(String projectId) {
        // Placeholder: Phê duyệt phân bổ quỹ
        System.out.println("Approving fund distribution for project: " + projectId);
    }
}