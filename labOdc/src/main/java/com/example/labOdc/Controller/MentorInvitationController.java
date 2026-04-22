package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.MentorInvitationDTO;
import com.example.labOdc.DTO.Action.UpdateProposedFeeDTO;
import com.example.labOdc.DTO.Response.MentorInvitationResponse;
import com.example.labOdc.Model.MentorInvitation;
import com.example.labOdc.Service.MentorInvitationService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api/mentor-invitations")
public class MentorInvitationController {

    private final MentorInvitationService mentorInvitationService;

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('COMPANY','LAB_ADMIN','SYSTEM_ADMIN')")
    public ApiResponse<MentorInvitationResponse> create(@Valid @RequestBody MentorInvitationDTO dto,
            BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }
        MentorInvitation mi = mentorInvitationService.createMentorInvitation(dto);
        return ApiResponse.success(MentorInvitationResponse.fromMentorInvitation(mi), "Thanh cong", HttpStatus.CREATED);
    }

    @GetMapping("/")
    public ApiResponse<List<MentorInvitationResponse>> getAll() {
        List<MentorInvitation> list = mentorInvitationService.getAllMentorInvitation();
        return ApiResponse.success(list.stream().map(MentorInvitationResponse::fromMentorInvitation).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ApiResponse<MentorInvitationResponse> getById(@PathVariable String id) {
        MentorInvitation mi = mentorInvitationService.getMentorInvitationById(id);
        return ApiResponse.success(MentorInvitationResponse.fromMentorInvitation(mi), "Thanh cong", HttpStatus.OK);
    }

    // ---- workflow ----

    @GetMapping("/by-mentor/{mentorId}")
    public ApiResponse<List<MentorInvitationResponse>> getByMentor(@PathVariable String mentorId) {
        List<MentorInvitation> list = mentorInvitationService.getInvitationsByMentor(mentorId);
        return ApiResponse.success(list.stream().map(MentorInvitationResponse::fromMentorInvitation).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @GetMapping("/by-project/{projectId}")
    public ApiResponse<List<MentorInvitationResponse>> getByProject(@PathVariable String projectId) {
        List<MentorInvitation> list = mentorInvitationService.getInvitationsByProject(projectId);
        return ApiResponse.success(list.stream().map(MentorInvitationResponse::fromMentorInvitation).toList(),
                "Thanh cong", HttpStatus.OK);
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<MentorInvitationResponse> accept(@PathVariable String id) {
        MentorInvitation mi = mentorInvitationService.acceptInvitation(id);
        return ApiResponse.success(MentorInvitationResponse.fromMentorInvitation(mi), "Accepted", HttpStatus.OK);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('MENTOR')")
    public ApiResponse<MentorInvitationResponse> reject(@PathVariable String id) {
        MentorInvitation mi = mentorInvitationService.rejectInvitation(id);
        return ApiResponse.success(MentorInvitationResponse.fromMentorInvitation(mi), "Rejected", HttpStatus.OK);
    }

    @PutMapping("/{id}/fee")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<MentorInvitationResponse> updateFee(@PathVariable String id,
            @RequestBody UpdateProposedFeeDTO body) {
        MentorInvitation mi = mentorInvitationService.updateProposedFee(id, body.getProposedFeePercentage());
        return ApiResponse.success(MentorInvitationResponse.fromMentorInvitation(mi), "Updated fee", HttpStatus.OK);
    }
}