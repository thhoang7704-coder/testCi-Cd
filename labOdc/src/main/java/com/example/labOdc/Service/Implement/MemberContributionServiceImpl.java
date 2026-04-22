package com.example.labOdc.Service.Implement;


import com.example.labOdc.DTO.MemberContributionDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.MemberContribution;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.Talent;
import com.example.labOdc.Model.User;
import com.example.labOdc.Repository.MemberContributionRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.MemberContributionService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class MemberContributionServiceImpl implements MemberContributionService {

    private final MemberContributionRepository memberContributionRepository;
    private final ProjectRepository projectRepository;
    private final TalentRepository talentRepository;
    private final UserRepository userRepository;

    @Override
    public MemberContribution createContribution(
            MemberContributionDTO dto,
            String recordedByUserId) {

        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Project"));

        Talent talent = talentRepository.findById(dto.getTalentId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Talent"));

        User recorder = userRepository.findById(recordedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy User"));

        MemberContribution mc = MemberContribution.builder()
                .project(project)
                .talent(talent)
                .contributionType(dto.getContributionType())
                .description(dto.getDescription())
                .score(dto.getScore())
                .recordedBy(recorder)
                .build();

        return memberContributionRepository.save(mc);
    }

    @Override
    public MemberContribution getById(String id) {
        return memberContributionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy MemberContribution"));
    }

    @Override
    public List<MemberContribution> getAll() {
        return memberContributionRepository.findAll();
    }

    @Override
    public List<MemberContribution> getByProject(String projectId) {
        return memberContributionRepository.findByProjectId(projectId);
    }

    @Override
    public List<MemberContribution> getByTalent(String talentId) {
        return memberContributionRepository.findByTalentId(talentId);
    }

    @Override
    public List<MemberContribution> getByRecorder(String userId) {
        return memberContributionRepository.findByRecordedById(userId);
    }

    @Override
    public List<MemberContribution> getByType(MemberContribution.ContributionType type) {
        return memberContributionRepository.findByContributionType(type);
    }

    @Override
    public MemberContribution updateContribution(String id, MemberContributionDTO dto) {

        MemberContribution mc = getById(id);

        if (dto.getContributionType() != null) {
            mc.setContributionType(dto.getContributionType());
        }

        if (dto.getDescription() != null) {
            mc.setDescription(dto.getDescription());
        }

        if (dto.getScore() != null) {
            mc.setScore(dto.getScore());
        }

        return memberContributionRepository.save(mc);
    }

    @Override
    public void deleteContribution(String id) {
        memberContributionRepository.deleteById(id);
    }
    @Override
    public List<MemberContribution> getByProjectAndTalent(String projectId, String talentId) {
        return memberContributionRepository
                .findByProjectIdAndTalentId(projectId, talentId);
    }

    @Override
    public BigDecimal getTotalScoreOfTalentInProject(String projectId, String talentId) {
        return memberContributionRepository
                .sumScoreByProjectAndTalent(projectId, talentId);
    }

    @Override
    public BigDecimal getAverageScoreOfTalent(String talentId) {
        return memberContributionRepository.avgScoreByTalent(talentId);
    }

    @Override
    public boolean existsContribution(String projectId, String talentId) {
        return memberContributionRepository
                .existsByProjectIdAndTalentId(projectId, talentId);
    }
    @Override
    public void deleteByProject(String projectId) {
        memberContributionRepository.deleteByProjectId(projectId);
    }

    @Override
    public BigDecimal getTotalScoreOfProject(String projectId) {
        return memberContributionRepository.sumScoreByProject(projectId);
    }

    @Override
    public BigDecimal getContributionPercentage(
            String projectId, String talentId) {

        BigDecimal talentScore =
                getTotalScoreOfTalentInProject(projectId, talentId);

        BigDecimal projectScore =
                getTotalScoreOfProject(projectId);

        if (projectScore.compareTo(BigDecimal.ZERO) == 0)
            return BigDecimal.ZERO;

        return talentScore
                .multiply(BigDecimal.valueOf(100))
                .divide(projectScore, 2, BigDecimal.ROUND_HALF_UP);
    }

    @Override
    public List<Object[]> getRankingByProject(String projectId) {
        return memberContributionRepository.rankingByProject(projectId);
    }

    @Override
    public List<MemberContribution> getHistory(
            String projectId, String talentId) {

        return memberContributionRepository
                .findByProjectIdAndTalentIdOrderByRecordedAtAsc(
                        projectId, talentId);
    }

    @Override
    public List<Object[]> getSummaryByType(String projectId) {
        return memberContributionRepository.sumScoreByType(projectId);
    }
    @Override
    public long countByProject(String projectId) {

        // optional: check project tồn tại cho chặt chẽ
        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Project"));

        return memberContributionRepository.countByProjectId(projectId);
    }

}