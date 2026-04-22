package com.example.labOdc.Model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.labOdc.Enum.SubmissionStatus;
import com.example.labOdc.Enum.TemplateType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "excel_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelSubmission {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String projectId;

    private String templateId;

    private String submittedBy; // user_id (Talent / Mentor)

    private String fileUrl;

    @Enumerated(EnumType.STRING)
    private TemplateType templateType;

    @Enumerated(EnumType.STRING)
    private SubmissionStatus status;

    private String reviewerId; // Mentor / Lab Admin

    @Column(columnDefinition = "TEXT")
    private String reviewComment;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;
}
