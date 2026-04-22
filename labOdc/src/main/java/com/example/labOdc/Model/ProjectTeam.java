package com.example.labOdc.Model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_teams", uniqueConstraints = @UniqueConstraint(name = "unique_project_talent", columnNames = {
        "project_id", "talent_id" }))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectTeam {

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "talent_id", nullable = false)
    private Talent talent;

    @Builder.Default
    @Column(name = "is_leader")
    private Boolean isLeader = false;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "left_date")
    private LocalDate leftDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProjectTeamStatus status = ProjectTeamStatus.ACTIVE;

    @Column(name = "performance_rating")
    private BigDecimal performanceRating;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void ensureId() {
        if (this.id == null)
            this.id = UUID.randomUUID().toString();
    }
}