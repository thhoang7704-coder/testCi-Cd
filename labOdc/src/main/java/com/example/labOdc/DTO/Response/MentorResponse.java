package com.example.labOdc.DTO.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.labOdc.Model.Mentor;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MentorResponse {
    private String id;
    private String userId;
    private String expertise;
    private Integer yearsExperience;
    private String bio;
    private String name;
    private BigDecimal rating;
    private Integer totalProjects;
    private Mentor.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MentorResponse fromMentor(Mentor m) {
        return MentorResponse.builder()
                .id(m.getId())
                .userId(m.getUser() != null ? m.getUser().getId() : null)
                .name(m.getName())
                .expertise(m.getExpertise())
                .yearsExperience(m.getYearsExperience())
                .bio(m.getBio())
                .rating(m.getRating())
                .totalProjects(m.getTotalProjects())
                .status(m.getStatus())
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
