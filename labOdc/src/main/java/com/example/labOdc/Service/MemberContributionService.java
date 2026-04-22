package com.example.labOdc.Service;

import com.example.labOdc.DTO.MemberContributionDTO;
import com.example.labOdc.Model.MemberContribution;

import java.math.BigDecimal;
import java.util.List;

public interface MemberContributionService {

    MemberContribution createContribution(
            MemberContributionDTO dto,
            String recordedByUserId);

    MemberContribution getById(String id);

    List<MemberContribution> getAll();

    List<MemberContribution> getByProject(String projectId);

    List<MemberContribution> getByTalent(String talentId);

    List<MemberContribution> getByType(MemberContribution.ContributionType type);

    List<MemberContribution> getByRecorder(String userId);

    MemberContribution updateContribution(String id, MemberContributionDTO dto);

    void deleteContribution(String id);

    List<MemberContribution> getByProjectAndTalent(String projectId, String talentId);

    BigDecimal getTotalScoreOfTalentInProject(String projectId, String talentId);

    BigDecimal getAverageScoreOfTalent(String talentId);

    boolean existsContribution(String projectId, String talentId);

    void deleteByProject(String projectId);
    BigDecimal getTotalScoreOfProject(String projectId);

    BigDecimal getContributionPercentage(String projectId, String talentId);

    List<Object[]> getRankingByProject(String projectId);

    List<MemberContribution> getHistory(String projectId, String talentId);

    List<Object[]> getSummaryByType(String projectId);

    long countByProject(String projectId);
}
