package com.example.labOdc.Repository;

import com.example.labOdc.Model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, String> {

    List<Evaluation> findByProjectId(String projectId);

    List<Evaluation> findByEvaluatedId(String evaluatedId);

    List<Evaluation> findByEvaluatorId(String evaluatorId);

    List<Evaluation> findByEvaluatedType(Evaluation.EvaluatedType evaluatedType);

    boolean existsByProjectIdAndEvaluatorIdAndEvaluatedIdAndEvaluatedType(String projectId, String evaluatorId, String evaluatedId, Evaluation.EvaluatedType evaluatedType);

    List<Evaluation> findByEvaluatorType(Evaluation.EvaluatorType evaluatorType);

    List<Evaluation> findByProjectIdAndEvaluatedId(String projectId, String evaluatedId);

    List<Evaluation> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    boolean existsByIdAndEvaluatorId(String id, String evaluatorId);

    //Project statistics
    long countByProjectId(String projectId);

    List<Evaluation> findByProjectIdAndEvaluatorId(String projectId, String evaluatorId);

    boolean existsByProjectIdAndEvaluatorId(String projectId, String evaluatorId);

    void deleteByProjectId(String projectId);

    // Điểm trung bình rating theo project
    @Query("""
SELECT AVG(e.rating)
FROM Evaluation e
WHERE e.project.id = :projectId
AND e.rating IS NOT NULL
""")
    Double avgRatingByProject(String projectId);

    // Đếm theo evaluatedType trong project
    long countByProjectIdAndEvaluatedType(String projectId, Evaluation.EvaluatedType evaluatedType);

    // Đếm theo evaluatorType trong project
    long countByProjectIdAndEvaluatorType(String projectId, Evaluation.EvaluatorType evaluatorType);

    // Lấy evaluation theo project + evaluatedType
    List<Evaluation> findByProjectIdAndEvaluatedType(String projectId, Evaluation.EvaluatedType evaluatedType);

    // Lấy evaluation theo project + evaluatorType
    List<Evaluation> findByProjectIdAndEvaluatorType(String projectId, Evaluation.EvaluatorType evaluatorType);

    // Lấy evaluation mới nhất của project
    List<Evaluation> findTop5ByProjectIdOrderByCreatedAtDesc(String projectId);

    // Top rating cao nhất
    List<Evaluation> findTop5ByEvaluatedIdOrderByRatingDesc(String evaluatedId);

    // Rating thấp nhất
    List<Evaluation> findTop5ByEvaluatedIdOrderByRatingAsc(String evaluatedId);

    boolean existsByProjectIdAndEvaluatorTypeAndEvaluatedType(String projectId, Evaluation.EvaluatorType evaluatorType, Evaluation.EvaluatedType evaluatedType);
    // ===== FINAL =====
    Optional<Evaluation> findByProject_IdAndEvaluatedType(
            String projectId,
            Evaluation.EvaluatedType evaluatedType
    );

    boolean existsByProject_IdAndEvaluatedType(
            String projectId,
            Evaluation.EvaluatedType evaluatedType
    );

    @Query("""
        select avg(e.rating)
        from Evaluation e
        where e.project.id = :projectId
          and e.evaluatedType = 'PROJECT'
    """)
    Double getFinalScore(@Param("projectId") String projectId);

    // ===== SUMMARY =====
    @Query("""
        select avg(e.technicalSkills),
               avg(e.communication),
               avg(e.teamwork),
               avg(e.punctuality),
               avg(e.rating),
               count(e)
        from Evaluation e
        where e.project.id = :projectId
    """)
    Object[] getFinalSummary(@Param("projectId") String projectId);
}
