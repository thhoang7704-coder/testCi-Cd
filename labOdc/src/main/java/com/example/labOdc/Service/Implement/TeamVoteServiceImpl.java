package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.Response.TeamVoteResponse;
import com.example.labOdc.DTO.TeamVoteDTO;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.Talent;
import com.example.labOdc.Model.TeamVote;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.TalentRepository;
import com.example.labOdc.Repository.TeamVoteRepository;
import com.example.labOdc.Service.TeamVoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamVoteServiceImpl implements TeamVoteService {

    private final TeamVoteRepository teamVoteRepository;
    private final ProjectRepository projectRepository;
    private final TalentRepository talentRepository;

    @Override
    public TeamVote vote(TeamVoteDTO dto, String talentId) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Project"));

        Talent talent = talentRepository.findById(talentId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Talent"));

        TeamVote vote = teamVoteRepository
                .findByProjectIdAndTalentIdAndProposalTypeAndProposalId(
                        dto.getProjectId(),
                        talentId,
                        dto.getProposalType(),
                        dto.getProposalId())
                .orElseGet(() -> TeamVote.builder()
                        .project(project)
                        .talent(talent)
                        .proposalType(dto.getProposalType())
                        .proposalId(dto.getProposalId())
                        .build());

        vote.setVote(dto.getVote());
        vote.setVotedAt(LocalDateTime.now());

        return teamVoteRepository.save(vote);
    }

    @Override
    public TeamVote getById(String id) {
        return teamVoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy TeamVote"));
    }

    @Override
    public TeamVote updateVote(String id, TeamVoteDTO dto) {
        TeamVote vote = getById(id);
        if (dto.getVote() != null) vote.setVote(dto.getVote());
        vote.setVotedAt(LocalDateTime.now());
        return teamVoteRepository.save(vote);
    }

    @Override
    public List<TeamVote> getAll() {
        return teamVoteRepository.findAll();
    }

    @Override
    public List<TeamVote> getByProject(String projectId) {
        return teamVoteRepository.findByProjectId(projectId);
    }

    @Override
    public List<TeamVote> getByTalent(String talentId) {
        return teamVoteRepository.findByTalentId(talentId);
    }

    @Override
    public List<TeamVote> getByProposal(
            String projectId,
            TeamVote.ProposalType proposalType,
            String proposalId) {

        return teamVoteRepository
                .findByProjectIdAndProposalTypeAndProposalId(
                        projectId,
                        proposalType,
                        proposalId);
    }
    @Override
    public TeamVote getMyVote(String projectId, String talentId,
                              TeamVote.ProposalType proposalType, String proposalId) {

        return teamVoteRepository
                .findByProjectIdAndTalentIdAndProposalTypeAndProposalId(
                        projectId, talentId, proposalType, proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Talent chưa vote proposal này"));
    }

    @Override
    public boolean hasVoted(String projectId, String talentId,
                            TeamVote.ProposalType proposalType, String proposalId) {

        return teamVoteRepository
                .existsByProjectIdAndTalentIdAndProposalTypeAndProposalId(
                        projectId, talentId, proposalType, proposalId);
    }

    @Override
    public long countVote(String projectId,
                          TeamVote.ProposalType proposalType,
                          String proposalId,
                          TeamVote.Vote vote) {

        return teamVoteRepository
                .countByProjectIdAndProposalTypeAndProposalIdAndVote(
                        projectId, proposalType, proposalId, vote);
    }
    @Override
    public void deleteVote(String id) {

        teamVoteRepository.deleteById(id);
    }
    @Override
    public long countTotalVote(String projectId,
                               TeamVote.ProposalType proposalType,
                               String proposalId) {

        return teamVoteRepository
                .countByProjectIdAndProposalTypeAndProposalId(
                        projectId, proposalType, proposalId);
    }

    @Override
    public boolean isApproved(String projectId,
                              TeamVote.ProposalType proposalType,
                              String proposalId,
                              double approveRatio) {

        long yes = countVote(projectId, proposalType, proposalId, TeamVote.Vote.YES);
        long total = countTotalVote(projectId, proposalType, proposalId);

        if (total == 0) return false;

        return ((double) yes / total) >= approveRatio;
    }

    @Override
    public void deleteByProposal(String projectId,
                                 TeamVote.ProposalType proposalType,
                                 String proposalId) {

        teamVoteRepository
                .deleteByProjectIdAndProposalTypeAndProposalId(
                        projectId, proposalType, proposalId);
    }

    @Override
    public boolean canVote(String projectId,
                           String talentId,
                           TeamVote.ProposalType proposalType,
                           String proposalId) {

        // Hook nghiệp vụ – hiện tại chỉ kiểm tra đã vote chưa
        return !hasVoted(projectId, talentId, proposalType, proposalId);
    }
}