package com.example.labOdc.DTO;

import com.example.labOdc.Model.ProjectChangeRequestType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectChangeRequestDTO {
    @NotBlank
    private String projectId;

    @NotBlank
    private String requestedById; // NEW

    @NotNull
    private ProjectChangeRequestType requestType;

    private String reason;
    private String proposedChanges;
    private String impactAnalysis;
}