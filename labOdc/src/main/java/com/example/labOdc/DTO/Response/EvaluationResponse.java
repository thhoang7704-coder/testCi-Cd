package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.Evaluation;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class EvaluationResponse {

    private String id;
    private String projectId;
    private String evaluatorId;
    private String evaluatedId;

    private Evaluation.EvaluatorType evaluatorType;
    private Evaluation.EvaluatedType evaluatedType;

    private Integer rating;
    private Integer technicalSkills;
    private Integer communication;
    private Integer teamwork;
    private Integer punctuality;

    private String feedback;
    private LocalDate evaluationDate;
    private Boolean isAnonymous;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EvaluationResponse fromEntity(Evaluation evaluation) {
        if (evaluation == null)
            return null;

        return EvaluationResponse.builder()
                .id(evaluation.getId())
                .projectId(
                        evaluation.getProject() != null
                                ? evaluation.getProject().getId()
                                : null)
                .evaluatorId(evaluation.getEvaluatorId())
                .evaluatedId(evaluation.getEvaluatedId())
                .evaluatorType(evaluation.getEvaluatorType())
                .evaluatedType(evaluation.getEvaluatedType())
                .rating(evaluation.getRating())
                .technicalSkills(evaluation.getTechnicalSkills())
                .communication(evaluation.getCommunication())
                .teamwork(evaluation.getTeamwork())
                .punctuality(evaluation.getPunctuality())
                .feedback(evaluation.getFeedback())
                .evaluationDate(evaluation.getEvaluationDate())
                .isAnonymous(evaluation.getIsAnonymous())
                .createdAt(evaluation.getCreatedAt())
                .updatedAt(evaluation.getUpdatedAt())
                .build();
    }
}
