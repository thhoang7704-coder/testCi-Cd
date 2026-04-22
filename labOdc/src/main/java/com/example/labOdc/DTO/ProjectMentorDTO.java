package com.example.labOdc.DTO;

import com.example.labOdc.Model.ProjectMentorRole;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectMentorDTO {
    @NotBlank
    private String projectId;

    @NotBlank
    private String mentorId;

    private ProjectMentorRole role;
    private String status;
}