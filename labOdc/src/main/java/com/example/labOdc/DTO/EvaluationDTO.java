package com.example.labOdc.DTO;

import com.example.labOdc.Model.Evaluation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class EvaluationDTO {

    @NotBlank
    private String projectId;

    @NotBlank
    private String evaluatedId;

    @NotNull
    private Evaluation.EvaluatedType evaluatedType;

    private Integer rating;
    private Integer technicalSkills;
    private Integer communication;
    private Integer teamwork;
    private Integer punctuality;
    private String feedback;
    private Boolean isAnonymous;
}
