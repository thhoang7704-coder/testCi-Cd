package com.example.labOdc.DTO.Response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.example.labOdc.Model.ProjectChangeRequest;
import com.example.labOdc.Model.ProjectChangeRequestStatus;
import com.example.labOdc.Model.ProjectChangeRequestType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProjectChangeRequestResponse {
    private String id;
    private String projectId;
    private String requestedBy;
    private ProjectChangeRequestType requestType;

    private String reason;
    private String proposedChanges;
    private String impactAnalysis;

    private ProjectChangeRequestStatus status;
    private String approvedBy;

    private LocalDate requestedDate;
    private LocalDate reviewedDate;
    private String reviewNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProjectChangeRequestResponse fromProjectChangeRequest(ProjectChangeRequest pcr) {
        return ProjectChangeRequestResponse.builder()
                .id(pcr.getId())
                .projectId(pcr.getProject() != null ? pcr.getProject().getId() : null)
                .requestedBy(pcr.getRequestedBy() != null ? pcr.getRequestedBy().getId() : null)
                .requestType(pcr.getRequestType())
                .reason(pcr.getReason())
                .proposedChanges(pcr.getProposedChanges())
                .impactAnalysis(pcr.getImpactAnalysis())
                .status(pcr.getStatus())
                .approvedBy(pcr.getApprovedBy() != null ? pcr.getApprovedBy().getId() : null)
                .requestedDate(pcr.getRequestedDate())
                .reviewedDate(pcr.getReviewedDate())
                .reviewNotes(pcr.getReviewNotes())
                .createdAt(pcr.getCreatedAt())
                .updatedAt(pcr.getUpdatedAt())
                .build();
    }
}