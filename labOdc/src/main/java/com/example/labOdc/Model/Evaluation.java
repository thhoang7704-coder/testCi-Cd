package com.example.labOdc.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
@Entity
@Table(name = "evaluations")
public class Evaluation {
    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "evaluator_id", nullable = false)
    private String evaluatorId;

    @Column(name = "evaluated_id", nullable = false)
    private String evaluatedId;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluator_type")
    private EvaluatorType evaluatorType;

    @Enumerated(EnumType.STRING)
    @Column(name = "evaluated_type")
    private EvaluatedType evaluatedType;

    @Column(name = "rating")
    private Integer rating;

    @Column(name = "technical_skills")
    private Integer technicalSkills;

    @Column(name = "communication")
    private Integer communication;

    @Column(name = "teamwork")
    private Integer teamwork;

    @Column(name = "punctuality")
    private Integer punctuality;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;
    @Column(name = "evaluation_date")
    private LocalDate evaluationDate;
    @Builder.Default
    @Column(name = "is_anonymous")
    private Boolean isAnonymous = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void ensureId() {
        if (id == null) {
            id = UUID.randomUUID().toString();
        }
    }

    public enum EvaluatorType {
        COMPANY, MENTOR, TALENT, LAB_ADMIN
    }

    public enum EvaluatedType {
        TALENT, MENTOR, PROJECT, COMPANY
    }
}
