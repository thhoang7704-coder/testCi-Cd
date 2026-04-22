package com.example.labOdc.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TalentDTO {
    @NotBlank
    private String studentCode;

    private String major;
    private Integer year;

    private String skills;
    private String certifications;

    private String portfolioUrl;
    private String githubUrl;
    private String linkedinUrl;
}
