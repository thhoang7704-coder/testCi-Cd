package com.example.labOdc.Service;



import com.example.labOdc.DTO.TeamVoteDTO;
import com.example.labOdc.Model.TeamVote;

import java.util.List;

public interface TeamVoteService {

    TeamVote vote(
            TeamVoteDTO dto,
            String talentId);

    TeamVote getById(String id);

    TeamVote updateVote(String id, TeamVoteDTO dto);

    List<TeamVote> getAll();

    List<TeamVote> getByProject(String projectId);

    List<TeamVote> getByTalent(String talentId);

    List<TeamVote> getByProposal(
            String projectId,
            TeamVote.ProposalType proposalType,
            String proposalId);
    TeamVote getMyVote(
            String projectId,
            String talentId,
            TeamVote.ProposalType proposalType,
            String proposalId);

    boolean hasVoted(
            String projectId,
            String talentId,
            TeamVote.ProposalType proposalType,
            String proposalId);

    long countVote(
            String projectId,
            TeamVote.ProposalType proposalType,
            String proposalId,
            TeamVote.Vote vote);
    void deleteVote(String id);

    long countTotalVote(
            String projectId,
            TeamVote.ProposalType proposalType,
            String proposalId);

    boolean isApproved(
            String projectId,
            TeamVote.ProposalType proposalType,
            String proposalId,
            double approveRatio);

    void deleteByProposal(
            String projectId,
            TeamVote.ProposalType proposalType,
            String proposalId);

    boolean canVote(
            String projectId,
            String talentId,
            TeamVote.ProposalType proposalType,
            String proposalId);
}