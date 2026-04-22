package com.example.labOdc.DTO.Response;

import com.example.labOdc.Model.TeamVote;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TeamVoteResponse {

    private String id;
    private String projectId;
    private String talentId;
    private TeamVote.ProposalType proposalType;
    private String proposalId;
    private TeamVote.Vote vote;
    private LocalDateTime votedAt;

    public static TeamVoteResponse fromEntity(TeamVote teamVote) {
        return TeamVoteResponse.builder()
                .id(teamVote.getId())
                .projectId(teamVote.getProject() != null ? teamVote.getProject().getId() : null)
                .talentId(teamVote.getTalent() != null ? teamVote.getTalent().getId() : null)
                .proposalType(teamVote.getProposalType())
                .proposalId(teamVote.getProposalId())
                .vote(teamVote.getVote())
                .votedAt(teamVote.getVotedAt())
                .build();
    }
}
