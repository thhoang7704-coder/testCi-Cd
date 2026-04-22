package com.example.labOdc.Service;

import com.example.labOdc.DTO.EvaluationDTO;
import com.example.labOdc.Model.Evaluation;

import java.time.LocalDateTime;
import java.util.List;

public interface EvaluationService {

    Evaluation createEvaluation(EvaluationDTO dto, String evaluatorId, Evaluation.EvaluatorType evaluatorType);

    Evaluation getById(String id);

    List<Evaluation> getAll();

    List<Evaluation> getByProject(String projectId);

    List<Evaluation> getByEvaluated(String evaluatedId);

    List<Evaluation> getByEvaluator(String evaluatorId);

    List<Evaluation> getByEvaluatedType(Evaluation.EvaluatedType type);

    Evaluation updateEvaluation(String id, EvaluationDTO dto);

    void deleteEvaluation(String id);

    List<Evaluation> getByEvaluatorType(Evaluation.EvaluatorType type);

    List<Evaluation> getByProjectAndEvaluated(String projectId, String evaluatedId);

    List<Evaluation> getByDateRange(LocalDateTime start, LocalDateTime end);

    double getAverageRating(String evaluatedId);

    long countEvaluationsFor(String evaluatedId);

    boolean canViewEvaluation(String evaluationId, String userId);

    boolean canEditEvaluation(String evaluationId, String userId);

    boolean canDeleteEvaluation(String evaluationId, String userId);

    long countByProject(String projectId);

    List<Evaluation> getMyEvaluationsInProject(String projectId, String evaluatorId);

    boolean hasEvaluatedProject(String projectId, String evaluatorId);

    void deleteByProject(String projectId);

    double getAverageRatingByProject(String projectId);

    long countByProjectAndEvaluatedType(String projectId, Evaluation.EvaluatedType type);

    long countByProjectAndEvaluatorType(String projectId, Evaluation.EvaluatorType type);

    List<Evaluation> getByProjectAndEvaluatedType(String projectId, Evaluation.EvaluatedType type);

    List<Evaluation> getByProjectAndEvaluatorType(String projectId, Evaluation.EvaluatorType type);

    List<Evaluation> getLatestEvaluationsByProject(String projectId);

    List<Evaluation> getTopHighRatings(String evaluatedId);

    List<Evaluation> getTopLowRatings(String evaluatedId);

    Evaluation createFinalEvaluation(String projectId, String evaluatorId, EvaluationDTO dto);

    void lockProjectEvaluation(String projectId);

    boolean isProjectLocked(String projectId);

    boolean finalExists(String projectId);

    Double getFinalScore(String projectId);

    Object getFinalSummary(String projectId);

    void deleteFinalEvaluation(String projectId);
}
