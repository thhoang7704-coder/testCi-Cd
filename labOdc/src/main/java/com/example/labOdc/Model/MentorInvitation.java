package com.example.labOdc.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
    name = "mentor_invitations",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_project_mentor",
        columnNames = { "project_id", "mentor_id" }
    )
)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MentorInvitation {

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Mentor mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by")
    private User invitedBy;

    // 🔥 FIX LỖI TẠI ĐÂY
    @Column(name = "invitation_message", columnDefinition = "TEXT")
    private String invitationMessage;

    @Column(name = "proposed_fee_percentage")
    private BigDecimal proposedFeePercentage;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private MentorInvitationStatus status = MentorInvitationStatus.PENDING;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}