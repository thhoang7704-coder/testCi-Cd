package com.example.labOdc.DTO.Response;

import java.time.LocalDateTime;

import com.example.labOdc.Model.ProjectApplication;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectApplicationResponse {
    private String id;
    private String projectId;
    private String talentId;
    private String coverLetter;
    private ProjectApplication.Status status;
    private String reviewedById;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private LocalDateTime appliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectApplicationResponse from(ProjectApplication p) {
        return ProjectApplicationResponse.builder()
                .id(p.getId())
                .projectId(p.getProject() != null ? p.getProject().getId() : null)
                .talentId(p.getTalent() != null ? p.getTalent().getId() : null)
                .coverLetter(p.getCoverLetter())
                .status(p.getStatus())
                .reviewedById(p.getReviewedBy() != null ? p.getReviewedBy().getId() : null)
                .reviewedAt(p.getReviewedAt())
                .rejectionReason(p.getRejectionReason())
                .appliedAt(p.getAppliedAt())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
