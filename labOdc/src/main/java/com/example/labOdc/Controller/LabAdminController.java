package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.LabAdminDTO;
import com.example.labOdc.DTO.Response.CompanyResponse;
import com.example.labOdc.DTO.Response.LabAdminResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.Service.LabAdminService;

import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;

@PermitAll
@RestController
@RequestMapping("/api/v1/lab-admins")
public class LabAdminController {
    private final LabAdminService labAdminService;

    public LabAdminController(LabAdminService labAdminService) {
        this.labAdminService = labAdminService;
    }

    /**
     * Chức năng: Tạo tài khoản Lab Administrator mới.
     * Service: LabAdminService.createLabAdmin() - Xử lý logic tạo và lưu entity.
     */
    @PostMapping("/")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public ApiResponse<LabAdminResponse> createLabAdmin(
        @Valid @RequestBody LabAdminDTO dto,
        BindingResult result) {

    if (result.hasErrors()) {
        List<String> errors = result.getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .toList();
        return ApiResponse.error(errors);
    }

    LabAdminResponse response = labAdminService.createLabAdmin(dto);
    return ApiResponse.success(response, "Created", HttpStatus.CREATED);
}

    /**
     * Chức năng: Lấy danh sách tất cả Lab Administrators.
     * Service: LabAdminService.getAllLabAdmins() - Truy vấn và trả về list.
     */
    @GetMapping("/")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<List<LabAdminResponse>> getAll() {
        List<LabAdminResponse> list = labAdminService.getAllLabAdmins();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Lấy Lab Administrator theo ID.
     * Service: LabAdminService.getLabAdminById() - Truy vấn entity theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabAdminResponse> getById(@PathVariable String id) {
        LabAdminResponse response = labAdminService.getLabAdminById(id);
        return ApiResponse.success(response, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Cập nhật Lab Administrator theo ID.
     * Service: LabAdminService.updateLabAdmin() - Xử lý cập nhật entity.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<LabAdminResponse> update(@Valid @RequestBody LabAdminDTO dto, @PathVariable String id) {
        LabAdminResponse response = labAdminService.updateLabAdmin(dto, id);
        return ApiResponse.success(response, "Updated", HttpStatus.OK);
    }

    /**
     * Chức năng: Xóa Lab Administrator theo ID.
     * Service: LabAdminService.deleteLabAdmin() - Xử lý xóa entity.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        labAdminService.deleteLabAdmin(id);
        return ResponseEntity.ok("Deleted");
    }

    /**
     * Chức năng: Lấy danh sách công ty đang chờ phê duyệt.
     * Service: LabAdminService.listPendingCompanies()
     */
    @GetMapping("/pending-companies")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<List<CompanyResponse>> getPendingCompanies() {
        List<CompanyResponse> list = (List<CompanyResponse>) labAdminService.listPendingCompanies();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Lấy danh sách dự án đang chờ phê duyệt.
     * Service: LabAdminService.listPendingProjects()
     */
    @GetMapping("/pending-projects")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<List<ProjectResponse>> getPendingProjects() {
        List<ProjectResponse> list = (List<ProjectResponse>) labAdminService.listPendingProjects();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Phê duyệt dự án.
     * Service: LabAdminService.validateProject()
     */
    @PostMapping("/validate-project/{projectId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<String> validateProject(@PathVariable String projectId, @RequestParam String labAdminId) {
        labAdminService.validateProject(projectId, labAdminId);
        return ApiResponse.success("Project validated", "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Từ chối dự án.
     * Service: LabAdminService.rejectProject()
     */
    @PostMapping("/reject-project/{projectId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<String> rejectProject(@PathVariable String projectId, @RequestParam String reason, @RequestParam String labAdminId) {
        labAdminService.rejectProject(projectId, reason, labAdminId);
        return ApiResponse.success("Project rejected", "OK", HttpStatus.OK);
    }


    /**
     * Lấy chi tiết công ty theo ID.
     * @param companyId ID công ty
     * @return Chi tiết công ty
     */
    @GetMapping("/companies/{companyId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<CompanyResponse> getCompanyDetails(@PathVariable String companyId) {
        CompanyResponse company = labAdminService.getCompanyDetails(companyId);
        return ApiResponse.success(company, "Company details retrieved", HttpStatus.OK);
    }

    /**
     * Lấy chi tiết dự án theo ID.
     * @param projectId ID dự án
     * @return Chi tiết dự án
     */
    @GetMapping("/projects/{projectId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<ProjectResponse> getProjectDetails(@PathVariable String projectId) {
        ProjectResponse project = labAdminService.getProjectDetails(projectId);
        return ApiResponse.success(project, "Project details retrieved", HttpStatus.OK);
    }

    /**
     * Gán mentor cho dự án.
     * @param projectId ID dự án
     * @param mentorId ID mentor
     */
    @PostMapping("/assign-mentor/{projectId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<String> assignMentorToProject(@PathVariable String projectId, @RequestParam String mentorId) {
        labAdminService.assignMentorToProject(projectId, mentorId);
        return ApiResponse.success("Mentor assigned to project", "OK", HttpStatus.OK);
    }

    /**
     * Phê duyệt lời mời mentor.
     * @param invitationId ID lời mời
     */
    @PostMapping("/approve-invitation/{invitationId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<String> approveMentorInvitation(@PathVariable String invitationId) {
        labAdminService.approveMentorInvitation(invitationId);
        return ApiResponse.success("Mentor invitation approved", "OK", HttpStatus.OK);
    }

    /**
     * Từ chối lời mời mentor.
     * @param invitationId ID lời mời
     * @param reason Lý do từ chối
     */
    @PostMapping("/reject-invitation/{invitationId}")
    @PreAuthorize("hasRole('LAB_ADMIN')")
    public ApiResponse<String> rejectMentorInvitation(@PathVariable String invitationId, @RequestParam String reason) {
        labAdminService.rejectMentorInvitation(invitationId, reason);
        return ApiResponse.success("Mentor invitation rejected", "OK", HttpStatus.OK);
    }

}
