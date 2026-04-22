package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.ProjectDTO;
import com.example.labOdc.DTO.Action.RejectRequestDTO;
import com.example.labOdc.DTO.Action.UpdateProjectStatusDTO;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Service.ProjectService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping("/")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<ProjectResponse> createProject(@Valid @RequestBody ProjectDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }

        Project project = projectService.createProject(dto);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Thanh cong", HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ApiResponse<List<ProjectResponse>> getAllProject() {
        List<Project> list = projectService.getAllProject();
        return ApiResponse.success(list.stream().map(ProjectResponse::fromProject).toList(), "Thanh cong",
                HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectResponse> getProjectById(@PathVariable String id) {
        Project project = projectService.getProjectById(id);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<ProjectResponse> updateProject(@Valid @RequestBody ProjectDTO dto, @PathVariable String id) {
        Project project = projectService.updateProject(dto, id);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Thanh cong", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<String> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ApiResponse.success("Xoa thanh cong", "Thanh cong", HttpStatus.OK);
    }

    // ---------- workflow endpoints ----------

    @PutMapping("/{id}/submit")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<ProjectResponse> submit(@PathVariable String id) {
        Project project = projectService.submitProject(id);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Submitted", HttpStatus.OK);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<ProjectResponse> complete(@PathVariable String id) {
        Project project = projectService.completeProject(id);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Completed", HttpStatus.OK);
    }

    @PutMapping("/{id}/request-complete")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<ProjectResponse> requestComplete(@PathVariable String id) {
        Project project = projectService.requestCompleteProject(id);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Requested completion", HttpStatus.OK);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<ProjectResponse> approve(@PathVariable String id, @RequestParam String validatedBy) {
        Project project = projectService.approveProject(id, validatedBy);
        return ApiResponse.success(ProjectResponse.fromProject(project), "Approved", HttpStatus.OK);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<ProjectResponse> reject(@PathVariable String id, @RequestParam String validatedBy,
            @RequestBody RejectRequestDTO body) {
        Project project = projectService.rejectProject(id, validatedBy, body.getReason());
        return ApiResponse.success(ProjectResponse.fromProject(project), "Rejected", HttpStatus.OK);
    }

    @PutMapping("/{id}/status")
    public ApiResponse<ProjectResponse> updateStatus(@PathVariable String id,
            @RequestBody UpdateProjectStatusDTO body) {
        Project project = projectService.updateProjectStatus(id, body.getStatus());
        return ApiResponse.success(ProjectResponse.fromProject(project), "Updated status", HttpStatus.OK);
    }
}