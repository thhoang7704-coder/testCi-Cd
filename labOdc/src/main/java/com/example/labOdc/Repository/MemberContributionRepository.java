package com.example.labOdc.Repository;

import com.example.labOdc.Model.MemberContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MemberContributionRepository extends JpaRepository<MemberContribution, String> {

    List<MemberContribution> findByProjectId(String projectId);

    List<MemberContribution> findByTalentId(String talentId);

    List<MemberContribution> findByRecordedById(String recordedById);

    List<MemberContribution> findByContributionType(MemberContribution.ContributionType type);

    // project + talent
    List<MemberContribution> findByProjectIdAndTalentId(String projectId, String talentId);

    // kiểm tra tồn tại
    boolean existsByProjectIdAndTalentId(String projectId, String talentId);

    //tổng điểm contribution của talent trong project
    @Query("""
        SELECT COALESCE(SUM(mc.score), 0)
        FROM MemberContribution mc
        WHERE mc.project.id = :projectId
          AND mc.talent.id = :talentId
    """)
    BigDecimal sumScoreByProjectAndTalent(
            @Param("projectId") String projectId,
            @Param("talentId") String talentId
    );

    //điểm trung bình của talent
    @Query("""
        SELECT COALESCE(AVG(mc.score), 0)
        FROM MemberContribution mc
        WHERE mc.talent.id = :talentId
    """)
    BigDecimal avgScoreByTalent(@Param("talentId") String talentId);

    //xóa theo project
    void deleteByProjectId(String projectId);
    // tổng điểm project
    @Query("""
    SELECT COALESCE(SUM(mc.score),0)
    FROM MemberContribution mc
    WHERE mc.project.id = :projectId
""")
    BigDecimal sumScoreByProject(@Param("projectId") String projectId);

    // ranking theo talent
    @Query("""
    SELECT mc.talent.id, SUM(mc.score)
    FROM MemberContribution mc
    WHERE mc.project.id = :projectId
    GROUP BY mc.talent.id
    ORDER BY SUM(mc.score) DESC
""")
    List<Object[]> rankingByProject(@Param("projectId") String projectId);

    // tổng điểm theo type
    @Query("""
    SELECT mc.contributionType, SUM(mc.score)
    FROM MemberContribution mc
    WHERE mc.project.id = :projectId
    GROUP BY mc.contributionType
""")
    List<Object[]> sumScoreByType(@Param("projectId") String projectId);

    // history theo thời gian
    List<MemberContribution>
    findByProjectIdAndTalentIdOrderByRecordedAtAsc(
            String projectId, String talentId);
    long countByProjectId(String projectId);
}

