package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.Response.FundDistributionResponse;
import com.example.labOdc.DTO.Response.ProjectApplicationResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.DTO.Response.TalentResponse;
import com.example.labOdc.DTO.Response.TaskResponse;
import com.example.labOdc.DTO.TalentDTO;
import com.example.labOdc.Service.TalentService;

import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@PermitAll
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/talents")
@CrossOrigin("*")
public class TalentController {
    private final TalentService talentService;

    /**
     * 4.5.1 - Lấy hồ sơ Talent của chính mình
     * GET /api/v1/talents/me
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<TalentResponse> getMyTalent() {
        TalentResponse response = talentService.getMyTalent();
        return ApiResponse.success(response, "Talent retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.1 - Cập nhật hồ sơ Talent của chính mình
     * PUT /api/v1/talents/me
     */
    @PutMapping("/me")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<TalentResponse> updateMyTalent(
            @Valid @RequestBody TalentDTO talentDTO,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ApiResponse.error(errorMessages);
        }

        TalentResponse response = talentService.updateMyTalent(talentDTO);
        return ApiResponse.success(response, "Talent updated successfully", HttpStatus.OK);
    }

    /**
     * 4.5.1 - Tạo/Cập nhật hồ sơ Talent
     * POST /api/v1/talents
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
    public ApiResponse<TalentResponse> createTalent(
            @Valid @RequestBody TalentDTO talentDTO,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();
            return ApiResponse.error(errorMessages);
        }

        TalentResponse response = talentService.createTalent(talentDTO);
        return ApiResponse.success(response, "Talent profile created/updated successfully", HttpStatus.OK);
    }

    /**
     * 4.5.1 - Lấy danh sách tất cả Talent
     * GET /api/v1/talents
     */
    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<List<TalentResponse>> getAllTalents() {
        List<TalentResponse> talents = talentService.getAllTalents();
        return ApiResponse.success(talents, "All talents retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.1 - Lấy chi tiết hồ sơ Talent
     * GET /api/v1/talents/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'MENTOR', 'SYSTEM_ADMIN')")
    public ApiResponse<TalentResponse> getTalentById(@PathVariable String id) {
        TalentResponse response = talentService.getTalentById(id);
        return ApiResponse.success(response, "Talent retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.1 - Cập nhật hồ sơ Talent (partial update)
     * PUT /api/v1/talents/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<TalentResponse> updateTalent(
            @Valid @RequestBody TalentDTO talentDTO,
            @PathVariable String id) {
        TalentResponse response = talentService.updateTalent(talentDTO, id);
        return ApiResponse.success(response, "Talent updated successfully", HttpStatus.OK);
    }

    /**
     * 4.5.1 - Xóa hồ sơ Talent
     * DELETE /api/v1/talents/{id}
     */
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<String> deleteTalent(@PathVariable String id) {
        talentService.deleteTalent(id);
        return ApiResponse.success("Talent deleted successfully", "OK", HttpStatus.OK);
    }

    /**
     * 4.5.2 - Lấy danh sách dự án khả dụng (để ứng tuyển)
     * GET /api/v1/talents/available-projects
     */
    @GetMapping("/available-projects")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<List<ProjectResponse>> getAvailableProjects() {
        List<ProjectResponse> projects = talentService.getAvailableProjects();
        return ApiResponse.success(projects, "Available projects retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.2 - Ứng tuyển vào dự án
     * POST /api/v1/talents/apply/{projectId}
     */
    @PostMapping("/apply/{projectId}")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<String> applyToProject(
            @PathVariable String projectId,
            @RequestParam(required = false, defaultValue = "") String coverLetter) {
        talentService.applyToProject(projectId, coverLetter);
        return ApiResponse.success("Application submitted successfully", "OK", HttpStatus.CREATED);
    }

    /**
     * 4.5.2 - Lấy danh sách đơn ứng tuyển của Talent
     * GET /api/v1/talents/applications
     */
    @GetMapping("/applications")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<List<ProjectApplicationResponse>> getMyApplications() {
        List<ProjectApplicationResponse> applications = talentService.getMyApplications();
        return ApiResponse.success(applications, "Applications retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.2 - Lấy danh sách dự án đã tham gia
     * GET /api/v1/talents/projects
     */
    @GetMapping("/projects")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<List<ProjectResponse>> getMyProjects() {
        List<ProjectResponse> projects = talentService.getMyProjects();
        return ApiResponse.success(projects, "Projects retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.3 - Lấy danh sách task được giao
     * GET /api/v1/talents/tasks
     */
    @GetMapping("/tasks")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<List<TaskResponse>> getAssignedTasks() {
        List<TaskResponse> tasks = talentService.getAssignedTasks();
        return ApiResponse.success(tasks, "Tasks retrieved", HttpStatus.OK);
    }

    /**
     * 4.5.3 - Cập nhật tiến độ task
     * PUT /api/v1/talents/tasks/{taskId}/progress
     */
    @PutMapping("/tasks/{taskId}/progress")
    @PreAuthorize("hasRole('TALENT')")
    public ApiResponse<String> updateTaskProgress(
            @PathVariable String taskId,
            @RequestParam String status) {
        talentService.updateTaskProgress(taskId, status);
        return ApiResponse.success("Task progress updated successfully", "OK", HttpStatus.OK);
    }

    /**
     * 4.5.4 - Xem phân bổ quỹ của team
     * GET /api/v1/talents/funds/{projectId}
     */
    @GetMapping("/funds/{projectId}")
@PreAuthorize("hasRole('TALENT')")
public ResponseEntity<List<FundDistributionResponse>> viewTeamFundDistribution(
        @PathVariable String projectId
) {
    return ResponseEntity.ok(
        talentService.viewTeamFundDistribution(projectId)
    );
}
}
