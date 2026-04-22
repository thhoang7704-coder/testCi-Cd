package com.example.labOdc.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mentors")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Mentor {

    public enum Status {
        AVAILABLE,
        BUSY,
        INACTIVE
    }

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    @Column(name = "name", length = 255)
    private String name;
    @Column(name = "expertise", length = 255)
    private String expertise;

    @Column(name = "years_experience")
    private Integer yearsExperience;

    @Lob
    @Column(name = "bio")
    private String bio;

    @Column(name = "rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal rating = BigDecimal.ZERO;

    @Column(name = "total_projects")
    @Builder.Default
    private Integer totalProjects = 0;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status")
    private Status status = Status.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
