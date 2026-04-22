package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.ProjectMentorDTO;
import com.example.labOdc.DTO.Response.ProjectMentorResponse;
import com.example.labOdc.Model.ProjectMentor;
import com.example.labOdc.Service.ProjectMentorService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/project-mentors")
public class ProjectMentorController {

    private final ProjectMentorService projectMentorService;

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<ProjectMentorResponse> create(@Valid @RequestBody ProjectMentorDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }

        ProjectMentor pm = projectMentorService.createProjectMentor(dto);
        return ApiResponse.success(ProjectMentorResponse.fromProjectMentor(pm), "Thanh cong", HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ApiResponse<List<ProjectMentorResponse>> getAll() {
        List<ProjectMentor> list = projectMentorService.getAllProjectMentor();
        return ApiResponse.success(list.stream().map(ProjectMentorResponse::fromProjectMentor).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ApiResponse<ProjectMentorResponse> getById(@PathVariable String id) {
        ProjectMentor pm = projectMentorService.getProjectMentorById(id);
        return ApiResponse.success(ProjectMentorResponse.fromProjectMentor(pm), "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<ProjectMentorResponse> update(@Valid @RequestBody ProjectMentorDTO dto,
            @PathVariable String id) {
        ProjectMentor pm = projectMentorService.updateProjectMentor(dto, id);
        return ApiResponse.success(ProjectMentorResponse.fromProjectMentor(pm), "Thanh cong", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<String> delete(@PathVariable String id) {
        projectMentorService.deleteProjectMentor(id);
        return ApiResponse.success("Xoa thanh cong", "Thanh cong", HttpStatus.OK);
    }

    // --------- THÊM CHO CHUẨN NGHIỆP VỤ ---------

    @GetMapping("/by-project/{projectId}")
    public ApiResponse<List<ProjectMentorResponse>> getByProject(@PathVariable String projectId) {
        List<ProjectMentor> list = projectMentorService.getProjectMentorsByProjectId(projectId);
        return ApiResponse.success(list.stream().map(ProjectMentorResponse::fromProjectMentor).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @GetMapping("/by-project/{projectId}/main")
    public ApiResponse<ProjectMentorResponse> getMainMentor(@PathVariable String projectId) {
        ProjectMentor pm = projectMentorService.getMainMentorByProjectId(projectId);
        return ApiResponse.success(ProjectMentorResponse.fromProjectMentor(pm), "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}/set-main")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<ProjectMentorResponse> setMainMentor(@PathVariable String id) {
        ProjectMentor pm = projectMentorService.setMainMentor(id);
        return ApiResponse.success(ProjectMentorResponse.fromProjectMentor(pm), "Set main mentor", HttpStatus.OK);
    }
}