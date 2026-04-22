package com.example.labOdc.Model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "talents")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Talent {

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

    @Column(name = "student_code", length = 50)
    private String studentCode;

    @Column(name = "major", length = 100)
    private String major;

    @Column(name = "year")
    private Integer year;

    @Lob
    @Column(name = "skills")
    private String skills;

    @Lob
    @Column(name = "certifications")
    private String certifications;

    @Column(name = "portfolio_url", length = 500)
    private String portfolioUrl;

    @Column(name = "github_url", length = 255)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 255)
    private String linkedinUrl;

    @Column(name = "gpa", precision = 3, scale = 2)
    private BigDecimal gpa;

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
