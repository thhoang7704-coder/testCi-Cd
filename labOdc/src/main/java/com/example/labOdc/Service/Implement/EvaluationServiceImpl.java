package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.EvaluationDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Evaluation;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Repository.EvaluationRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Service.EvaluationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ProjectRepository projectRepository;

    @Override
    public Evaluation createEvaluation(
            EvaluationDTO dto,
            String evaluatorId,
            Evaluation.EvaluatorType evaluatorType) {

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Project"));

        boolean existed = evaluationRepository
                .existsByProjectIdAndEvaluatorIdAndEvaluatedIdAndEvaluatedType(
                        dto.getProjectId(),
                        evaluatorId,
                        dto.getEvaluatedId(),
                        dto.getEvaluatedType());

        if (existed) {
            throw new IllegalStateException("Bạn đã đánh giá đối tượng này trong project này");
        }

        Evaluation evaluation = Evaluation.builder()
                .project(project)
                .evaluatorId(evaluatorId)
                .evaluatedId(dto.getEvaluatedId())
                .evaluatorType(evaluatorType)
                .evaluatedType(dto.getEvaluatedType())
                .rating(dto.getRating())
                .technicalSkills(dto.getTechnicalSkills())
                .communication(dto.getCommunication())
                .teamwork(dto.getTeamwork())
                .punctuality(dto.getPunctuality())
                .feedback(dto.getFeedback())
                .isAnonymous(dto.getIsAnonymous() != null ? dto.getIsAnonymous() : false)
                .evaluationDate(LocalDate.now())
                .build();

        return evaluationRepository.save(evaluation);
    }

    @Override
    public Evaluation getById(String id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Evaluation"));
    }

    @Override
    public List<Evaluation> getAll() {
        return evaluationRepository.findAll();
    }

    @Override
    public List<Evaluation> getByProject(String projectId) {
        return evaluationRepository.findByProjectId(projectId);
    }

    @Override
    public List<Evaluation> getByEvaluated(String evaluatedId) {
        return evaluationRepository.findByEvaluatedId(evaluatedId);
    }

    @Override
    public List<Evaluation> getByEvaluator(String evaluatorId) {
        return evaluationRepository.findByEvaluatorId(evaluatorId);
    }

    @Override
    public List<Evaluation> getByEvaluatedType(Evaluation.EvaluatedType type) {
        return evaluationRepository.findByEvaluatedType(type);
    }

    @Override
    public Evaluation updateEvaluation(String id, EvaluationDTO dto) {

        Evaluation evaluation = getById(id);

        if (dto.getRating() != null) {
            evaluation.setRating(dto.getRating());
        }
        if (dto.getTechnicalSkills() != null) {
            evaluation.setTechnicalSkills(dto.getTechnicalSkills());
        }
        if (dto.getCommunication() != null) {
            evaluation.setCommunication(dto.getCommunication());
        }
        if (dto.getTeamwork() != null) {
            evaluation.setTeamwork(dto.getTeamwork());
        }
        if (dto.getPunctuality() != null) {
            evaluation.setPunctuality(dto.getPunctuality());
        }
        if (dto.getFeedback() != null) {
            evaluation.setFeedback(dto.getFeedback());
        }
        if (dto.getIsAnonymous() != null) {
            evaluation.setIsAnonymous(dto.getIsAnonymous());
        }

        return evaluationRepository.save(evaluation);
    }

    @Override
    public void deleteEvaluation(String id) {
        evaluationRepository.deleteById(id);
    }
    @Override
    public double getAverageRating(String evaluatedId) {
        List<Evaluation> list = evaluationRepository.findByEvaluatedId(evaluatedId);

        return list.stream()
                .filter(e -> e.getRating() != null)
                .mapToInt(Evaluation::getRating)
                .average()
                .orElse(0);
    }

    @Override
    public long countEvaluationsFor(String evaluatedId) {
        return evaluationRepository.findByEvaluatedId(evaluatedId).size();
    }
    @Override
    public List<Evaluation> getByEvaluatorType(Evaluation.EvaluatorType type) {
        return evaluationRepository.findByEvaluatorType(type);
    }

    @Override
    public List<Evaluation> getByProjectAndEvaluated(
            String projectId,
            String evaluatedId) {

        return evaluationRepository.findByProjectIdAndEvaluatedId(projectId, evaluatedId);
    }

    @Override
    public List<Evaluation> getByDateRange(
            LocalDateTime start,
            LocalDateTime end) {

        return evaluationRepository.findByCreatedAtBetween(start, end);
    }
    @Override
    public boolean canViewEvaluation(String evaluationId, String userId) {
        Evaluation e = getById(evaluationId);
        return e.getEvaluatorId().equals(userId)
                || e.getEvaluatedId().equals(userId);
    }

    @Override
    public boolean canEditEvaluation(String evaluationId, String userId) {
        return evaluationRepository.existsByIdAndEvaluatorId(
                evaluationId,
                userId);
    }

    @Override
    public boolean canDeleteEvaluation(String evaluationId, String userId) {
        return canEditEvaluation(evaluationId, userId);
    }

    //Project
    @Override
    public long countByProject(String projectId) {
        return evaluationRepository.countByProjectId(projectId);
    }

    @Override
    public List<Evaluation> getMyEvaluationsInProject(
            String projectId,
            String evaluatorId) {

        return evaluationRepository.findByProjectIdAndEvaluatorId(
                projectId,
                evaluatorId);
    }

    @Override
    public boolean hasEvaluatedProject(
            String projectId,
            String evaluatorId) {

        return evaluationRepository
                .existsByProjectIdAndEvaluatorId(
                        projectId,
                        evaluatorId);
    }

    @Override
    public void deleteByProject(String projectId) {
        evaluationRepository.deleteByProjectId(projectId);
    }
    @Override
    public double getAverageRatingByProject(String projectId) {
        return evaluationRepository
                .avgRatingByProject(projectId) != null
                ? evaluationRepository.avgRatingByProject(projectId)
                : 0;
    }

    @Override
    public long countByProjectAndEvaluatedType(
            String projectId,
            Evaluation.EvaluatedType type) {

        return evaluationRepository
                .countByProjectIdAndEvaluatedType(projectId, type);
    }

    @Override
    public long countByProjectAndEvaluatorType(
            String projectId,
            Evaluation.EvaluatorType type) {

        return evaluationRepository
                .countByProjectIdAndEvaluatorType(projectId, type);
    }

    @Override
    public List<Evaluation> getByProjectAndEvaluatedType(
            String projectId,
            Evaluation.EvaluatedType type) {

        return evaluationRepository
                .findByProjectIdAndEvaluatedType(projectId, type);
    }

    @Override
    public List<Evaluation> getByProjectAndEvaluatorType(
            String projectId,
            Evaluation.EvaluatorType type) {

        return evaluationRepository
                .findByProjectIdAndEvaluatorType(projectId, type);
    }

    @Override
    public List<Evaluation> getLatestEvaluationsByProject(
            String projectId) {

        return evaluationRepository
                .findTop5ByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Override
    public List<Evaluation> getTopHighRatings(String evaluatedId) {
        return evaluationRepository
                .findTop5ByEvaluatedIdOrderByRatingDesc(evaluatedId);
    }

    @Override
    public List<Evaluation> getTopLowRatings(String evaluatedId) {
        return evaluationRepository
                .findTop5ByEvaluatedIdOrderByRatingAsc(evaluatedId);
    }

// ================= FINAL =================

    @Override
    public Evaluation createFinalEvaluation(
            String projectId,
            String evaluatorId,
            EvaluationDTO dto
    ) {
        if (finalExists(projectId)) {
            throw new IllegalStateException("Project đã có đánh giá cuối kỳ");
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project không tồn tại"));

        Evaluation evaluation = Evaluation.builder()
                .project(project)
                .evaluatorId(evaluatorId)
                .evaluatedId(projectId)
                .evaluatorType(Evaluation.EvaluatorType.LAB_ADMIN)
                .evaluatedType(Evaluation.EvaluatedType.PROJECT)
                .technicalSkills(dto.getTechnicalSkills())
                .communication(dto.getCommunication())
                .teamwork(dto.getTeamwork())
                .punctuality(dto.getPunctuality())
                .rating(dto.getRating())
                .feedback(dto.getFeedback())
                .evaluationDate(LocalDate.now())
                .build();

        return evaluationRepository.save(evaluation);
    }

    // ================= LOCK =================

    @Override
    public void lockProjectEvaluation(String projectId) {
        if (!finalExists(projectId)) {
            throw new IllegalStateException("Chưa có đánh giá cuối kỳ");
        }
        // ĐÃ LOCK = tồn tại FINAL → không cần update gì thêm
    }

    @Override
    public boolean isProjectLocked(String projectId) {
        return finalExists(projectId);
    }

    // ================= QUERY =================

    @Override
    public boolean finalExists(String projectId) {
        return evaluationRepository
                .existsByProject_IdAndEvaluatedType(
                        projectId,
                        Evaluation.EvaluatedType.PROJECT
                );
    }

    @Override
    public Double getFinalScore(String projectId) {
        return evaluationRepository.getFinalScore(projectId);
    }

    @Override
    public Object getFinalSummary(String projectId) {
        Object[] rs = evaluationRepository.getFinalSummary(projectId);

        return Map.of(
                "technical", rs[0],
                "communication", rs[1],
                "teamwork", rs[2],
                "punctuality", rs[3],
                "finalScore", rs[4],
                "totalEvaluations", rs[5],
                "locked", finalExists(projectId)
        );
    }

    // ================= ADMIN =================

    @Override
    public void deleteFinalEvaluation(String projectId) {
        Evaluation finalEval = evaluationRepository
                .findByProject_IdAndEvaluatedType(
                        projectId,
                        Evaluation.EvaluatedType.PROJECT
                )
                .orElseThrow(() -> new RuntimeException("Không có final"));

        evaluationRepository.delete(finalEval);
    }
}