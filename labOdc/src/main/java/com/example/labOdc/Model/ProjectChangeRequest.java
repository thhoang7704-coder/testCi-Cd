package com.example.labOdc.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_change_requests")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectChangeRequest {

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private ProjectChangeRequestType requestType;

    @Lob
    @Column(name = "reason")
    private String reason;

    @Lob
    @Column(name = "proposed_changes")
    private String proposedChanges;

    @Lob
    @Column(name = "impact_analysis")
    private String impactAnalysis;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private ProjectChangeRequestStatus status = ProjectChangeRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "requested_date")
    private LocalDate requestedDate;

    @Column(name = "reviewed_date")
    private LocalDate reviewedDate;

    @Lob
    @Column(name = "review_notes")
    private String reviewNotes;

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