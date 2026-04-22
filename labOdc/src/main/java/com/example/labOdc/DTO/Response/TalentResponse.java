package com.example.labOdc.DTO.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.labOdc.Model.Talent;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TalentResponse {
    private String id;
    private String userId;
    private String studentCode;
    private String major;
    private Integer year;
    private String skills;
    private String certifications;
    private String portfolioUrl;
    private String githubUrl;
    private String linkedinUrl;
    private BigDecimal gpa;
    private Talent.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TalentResponse fromTalent(Talent t) {
        return TalentResponse.builder()
                .id(t.getId())
                .userId(t.getUser() != null ? t.getUser().getId() : null)
                .studentCode(t.getStudentCode())
                .major(t.getMajor())
                .year(t.getYear())
                .skills(t.getSkills())
                .certifications(t.getCertifications())
                .portfolioUrl(t.getPortfolioUrl())
                .githubUrl(t.getGithubUrl())
                .linkedinUrl(t.getLinkedinUrl())
                .gpa(t.getGpa())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
