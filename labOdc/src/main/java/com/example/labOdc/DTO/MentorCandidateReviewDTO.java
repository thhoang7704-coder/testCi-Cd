package com.example.labOdc.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorCandidateReviewDTO {
    @NotBlank
    private String mentorId;

    @NotBlank
    private String talentId;

    @NotBlank
    private String projectId;

    private BigDecimal rating;
    private String comments;
}
