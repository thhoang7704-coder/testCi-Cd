package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.MentorCandidateReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorCandidateReviewResponse {
    private String id;
    private String mentorId;
    private String talentId;
    private String projectId;
    private BigDecimal rating;
    private String comments;
    private String status;
    private String reviewedById;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static MentorCandidateReviewResponse fromEntity(MentorCandidateReview e) {
        if (e == null)
            return null;

        return MentorCandidateReviewResponse.builder()
                .id(e.getId())
                .mentorId(e.getMentor() != null ? e.getMentor().getId() : null)
                .talentId(e.getTalent() != null ? e.getTalent().getId() : null)
                .projectId(e.getProject() != null ? e.getProject().getId() : null)
                .rating(e.getRating())
                .comments(e.getComments())
                .status(e.getStatus() != null ? e.getStatus().name() : null)
                .reviewedById(
                        e.getReviewedBy() != null ? e.getReviewedBy().getId() : null)
                .reviewedAt(e.getReviewedAt())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

}
