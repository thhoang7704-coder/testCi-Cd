package com.example.labOdc.Controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.MilestoneDTO;
import com.example.labOdc.DTO.Action.CompleteMilestoneDTO;
import com.example.labOdc.DTO.Response.MilestoneResponse;
import com.example.labOdc.Model.Milestone;
import com.example.labOdc.Service.MilestoneService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/milestones")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @PostMapping("/")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<MilestoneResponse> create(@Valid @RequestBody MilestoneDTO dto, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }

        Milestone m = milestoneService.createMilestone(dto);
        return ApiResponse.success(MilestoneResponse.fromMilestone(m), "Thanh cong", HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ApiResponse<List<MilestoneResponse>> getAll() {
        List<Milestone> list = milestoneService.getAllMilestone();
        return ApiResponse.success(list.stream().map(MilestoneResponse::fromMilestone).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ApiResponse<MilestoneResponse> getById(@PathVariable String id) {
        Milestone m = milestoneService.getMilestoneById(id);
        return ApiResponse.success(MilestoneResponse.fromMilestone(m), "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<MilestoneResponse> update(@Valid @RequestBody MilestoneDTO dto, @PathVariable String id) {
        Milestone m = milestoneService.updateMilestone(dto, id);
        return ApiResponse.success(MilestoneResponse.fromMilestone(m), "Thanh cong", HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<String> delete(@PathVariable String id) {
        milestoneService.deleteMilestone(id);
        return ApiResponse.success("Xoa thanh cong", "Thanh cong", HttpStatus.OK);
    }

    // --------- workflow chuẩn ---------

    @GetMapping("/by-project/{projectId}")
    public ApiResponse<List<MilestoneResponse>> getByProject(@PathVariable String projectId) {
        List<Milestone> list = milestoneService.getMilestonesByProjectId(projectId);
        return ApiResponse.success(list.stream().map(MilestoneResponse::fromMilestone).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('COMPANY', 'LAB_ADMIN')")
    public ApiResponse<MilestoneResponse> complete(@PathVariable String id,
            @RequestBody(required = false) CompleteMilestoneDTO body) {
        LocalDate completedDate = body != null ? body.getCompletedDate() : null;
        Milestone m = milestoneService.completeMilestone(id, completedDate);
        return ApiResponse.success(MilestoneResponse.fromMilestone(m), "Completed", HttpStatus.OK);
    }
}