package com.example.labOdc.DTO;

import com.example.labOdc.Model.TeamVote;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class TeamVoteDTO {

    @NotBlank
    private String projectId;

    @NotNull
    private TeamVote.ProposalType proposalType;

    @NotBlank
    private String proposalId;

    @NotNull
    private TeamVote.Vote vote;
}
