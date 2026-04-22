package com.example.labOdc.Model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_mentors", uniqueConstraints = @UniqueConstraint(name = "uk_project_mentor", columnNames = {
        "project_id", "mentor_id" }))
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectMentor {

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Mentor mentor;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    @Builder.Default
    private ProjectMentorRole role = ProjectMentorRole.MAIN_MENTOR;

    @CreationTimestamp
    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProjectMentorStatus status = ProjectMentorStatus.ACTIVE;

    @PrePersist
    public void ensureId() {
        if (this.id == null)
            this.id = UUID.randomUUID().toString();
    }
}