package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.MentorDTO;
import com.example.labOdc.DTO.Response.MentorInvitationResponse;
import com.example.labOdc.DTO.Response.MentorResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TaskDTO;
import com.example.labOdc.Service.MentorService;

import jakarta.annotation.security.PermitAll;

@PermitAll
@RestController
@RequestMapping("/api/v1/mentors")
public class MentorController {
    private final MentorService mentorService;

    public MentorController(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    /**
     * Chức năng: Tạo hồ sơ Mentor mới.
     * Service: MentorService.createMentor() - Xử lý logic tạo và lưu entity.
     */
    @PostMapping("/")
    @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
    public ApiResponse<MentorResponse> createMentor(@Validated @RequestBody MentorDTO mentorDTO, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }
        MentorResponse response = mentorService.createMentor(mentorDTO);
        return ApiResponse.success(response, "Created", HttpStatus.CREATED);
    }

    /**
     * Chức năng: Lấy danh sách tất cả Mentors.
     * Service: MentorService.getAllMentors() - Truy vấn và trả về list.
     */
    @GetMapping("/")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<List<MentorResponse>> getAllMentors() {
        List<MentorResponse> list = mentorService.getAllMentors();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Xóa Mentor theo ID.
     * Service: MentorService.deleteMentor() - Xử lý xóa entity.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> deleteMentor(@PathVariable String id) {
        mentorService.deleteMentor(id);
        return ResponseEntity.ok("Deleted");
    }

    /**
     * Chức năng: Lấy Mentor theo ID.
     * Service: MentorService.getMentorById() - Truy vấn entity theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole( 'LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<MentorResponse> getMentorById(@PathVariable String id) {
        MentorResponse response = mentorService.getMentorById(id);
        return ApiResponse.success(response, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Cập nhật Mentor theo ID.
     * Service: MentorService.updateMentor() - Xử lý cập nhật entity.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MENTOR', 'SYSTEM_ADMIN')")
    public ApiResponse<MentorResponse> updateMentor(@Validated @RequestBody MentorDTO mentorDTO, @PathVariable String id) {
        MentorResponse response = mentorService.updateMentor(mentorDTO, id);
        return ApiResponse.success(response, "Updated", HttpStatus.OK);
    }

      /**
     * Lấy danh sách lời mời gửi cho mentor hiện tại (đang đăng nhập).
     * Sắp xếp theo thời gian tạo mới nhất.
     * Endpoint: GET /api/v1/mentors/invitations/me
     * 
     * Response hiển thị:
     * - id: ID lời mời
     * - projectId: ID dự án
     * - status: PENDING/ACCEPTED/REJECTED
     * - proposedFeePercentage: Phí đề xuất
     * - invitationMessage: Tin nhắn mời
     * - createdAt: Thời gian tạo
     * - respondedAt: Thời gian phản hồi (null nếu chưa response)
     */
    @GetMapping("/invitations/me")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<List<MentorInvitationResponse>> getMyMentorInvitations() {
        List<MentorInvitationResponse> responses = mentorService.getMyMentorInvitations();
        return ApiResponse.success(responses, "Your mentor invitations retrieved", HttpStatus.OK);
    }


    /**
     * Chức năng: Chấp nhận lời mời làm mentor cho dự án.
     * Service: MentorService.acceptInvite() - Xử lý chấp nhận lời mời.
     * Endpoint: POST /api/v1/mentors/accept-invite/{inviteId}
     */
    @PostMapping("/accept-invite/{inviteId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<MentorInvitationResponse> acceptInvite(@PathVariable String inviteId) {
        mentorService.acceptInvite(inviteId);
        // Fetch updated invitation and convert to response
        var mentorInvitations = mentorService.getMyMentorInvitations();
        MentorInvitationResponse invitation = mentorInvitations.stream()
                .filter(i -> i.getId().equals(inviteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        return ApiResponse.success(invitation, "Invite accepted successfully", HttpStatus.OK);
    }

    /**
     * Chức năng: Từ chối lời mời làm mentor cho dự án.
     * Service: MentorService.rejectInvite() - Xử lý từ chối lời mời.
     * Endpoint: POST /api/v1/mentors/reject-invite/{inviteId}?reason=...
     */
    @PostMapping("/reject-invite/{inviteId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<MentorInvitationResponse> rejectInvite(@PathVariable String inviteId, @RequestParam String reason) {
        mentorService.rejectInvite(inviteId, reason);
        // Fetch updated invitation and convert to response
        var mentorInvitations = mentorService.getMyMentorInvitations();
        MentorInvitationResponse invitation = mentorInvitations.stream()
                .filter(i -> i.getId().equals(inviteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invitation not found"));
        return ApiResponse.success(invitation, "Invite rejected successfully", HttpStatus.OK);
    }


    /**
     * Lấy danh sách dự án được giao cho mentor đang đăng nhập.
     */
    @GetMapping("/projects/me")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<List<ProjectResponse>> getMyAssignedProjects() {
        List<ProjectResponse> projects = mentorService.getMyAssignedProjects();
        return ApiResponse.success(projects, "Assigned projects retrieved", HttpStatus.OK);
    }

  
    /**
     * Phân tích nhiệm vụ từ template Excel.
     * @param projectId ID dự án
     * @param excelTemplate Template Excel
     */
    @PostMapping("/tasks/breakdown/{projectId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<String> breakdownTasks(@PathVariable String projectId, @RequestParam String excelTemplate) {
        mentorService.breakdownTasks(projectId, excelTemplate);
        return ApiResponse.success("Tasks broken down", "OK", HttpStatus.OK);
    }

    /**
     * Phân tích nhiệm vụ từ file Excel (multipart upload).
     * Endpoint: POST /api/v1/mentors/tasks/breakdown-file/{projectId}
     * Content-Type: multipart/form-data
     */
    @PostMapping(value = "/tasks/breakdown-file/{projectId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<String> breakdownTasksFromFile(
            @PathVariable String projectId,
            @RequestParam("file") MultipartFile file
    ) {
        mentorService.breakdownTasksFromFile(projectId, file);
        return ApiResponse.success("Tasks broken down from uploaded file", "OK", HttpStatus.OK);
    }

    /**
     * Giao nhiệm vụ cho talent.
     * Endpoint: POST /api/v1/mentors/tasks/{taskId}/assign/{talentId}
     * @param taskId ID nhiệm vụ
     * @param talentId ID talent
     */
    @PostMapping("/tasks/{taskId}/assign/{talentId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<TaskResponse> assignTask(@PathVariable String taskId, @PathVariable String talentId) {
        TaskResponse response = mentorService.assignTask(taskId, talentId);
        return ApiResponse.success(response, "Task assigned to talent successfully", HttpStatus.OK);
    }

    /**
     * Tạo nhiệm vụ riêng lẻ cho dự án.
     * Endpoint: POST /api/v1/mentors/projects/{projectId}/tasks
     * @param projectId ID dự án
     * @param taskDTO Thông tin nhiệm vụ
     */
    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<TaskResponse> createTask(@PathVariable String projectId, @RequestBody TaskDTO taskDTO) {
        if (taskDTO == null) {
            return ApiResponse.error("Request body is required", HttpStatus.BAD_REQUEST);
        }

        // projectId comes from path; FE doesn't need to send it in body.
        taskDTO.setProjectId(projectId);

        if (taskDTO.getTaskName() == null || taskDTO.getTaskName().isBlank()) {
            return ApiResponse.error("taskName: must not be blank", HttpStatus.BAD_REQUEST);
        }

        TaskResponse response = mentorService.createTask(projectId, taskDTO);
        return ApiResponse.success(response, "Task created successfully", HttpStatus.CREATED);
    }

    /**
     * Cập nhật trạng thái nhiệm vụ.
     * @param taskId ID nhiệm vụ
     * @param status Trạng thái mới
     */
    @PutMapping("/tasks/{taskId}/status")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<String> updateTaskStatus(@PathVariable String taskId, @RequestParam String status) {
        mentorService.updateTaskStatus(taskId, status);
        return ApiResponse.success("Task status updated", "OK", HttpStatus.OK);
    }

    /**
     * Gửi báo cáo dự án.
     * @param projectId ID dự án
     * @param reportRequest Nội dung báo cáo
     */
    @PostMapping("/reports/{projectId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<String> submitReport(@PathVariable String projectId, @RequestBody String reportRequest) {
        mentorService.submitReport(projectId, reportRequest);
        return ApiResponse.success("Report submitted", "OK", HttpStatus.OK);
    }

    /**
     * Đánh giá talent.
     * @param projectId ID dự án
     * @param talentId ID talent
     * @param evaluationRequest Nội dung đánh giá
     */
    @PostMapping("/evaluations/{projectId}/{talentId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<String> evaluateTalent(@PathVariable String projectId, @PathVariable String talentId, @RequestBody String evaluationRequest) {
        mentorService.evaluateTalent(projectId, talentId, evaluationRequest);
        return ApiResponse.success("Talent evaluated", "OK", HttpStatus.OK);
    }

    /**
     * Phê duyệt phân bổ quỹ.
     * @param projectId ID dự án
     */
    @PostMapping("/funds/approve/{projectId}")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<String> approveFundDistribution(@PathVariable String projectId) {
        mentorService.approveFundDistribution(projectId);
        return ApiResponse.success("Fund distribution approved", "OK", HttpStatus.OK);
    }
}
