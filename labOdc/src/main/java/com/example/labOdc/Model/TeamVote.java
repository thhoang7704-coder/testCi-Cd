package com.example.labOdc.Model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "team_votes", uniqueConstraints = @UniqueConstraint(columnNames = { "project_id", "talent_id",
        "proposal_type", "proposal_id" }))
public class TeamVote {
    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "talent_id", nullable = false)
    private Talent talent;

    @Enumerated(EnumType.STRING)
    @Column(name = "proposal_type")
    private ProposalType proposalType;

    @Column(name = "proposal_id")
    private String proposalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote")
    private Vote vote;

    @Column(name = "voted_at")
    private LocalDateTime votedAt;

    @PrePersist
    public void ensureId() {
        if (id == null)
            id = UUID.randomUUID().toString();
        if (votedAt == null)
            votedAt = LocalDateTime.now();
    }

    public enum ProposalType {
        MENTOR_CHANGE, TEAM_MEMBER, SCOPE_CHANGE, BUDGET_USE, OTHER
    }

    public enum Vote {
        YES, NO, ABSTAIN
    }
}
