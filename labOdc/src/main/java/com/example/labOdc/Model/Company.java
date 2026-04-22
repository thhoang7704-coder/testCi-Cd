package com.example.labOdc.Model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "companies")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Company {

    public enum Size {
        ONE_TO_10("1-10"),
        ELEVEN_TO_50("11-50"),
        FIFTYONE_TO_200("51-200"),
        TWOZEROONE_TO_500("201-500"),
        FIVE_HUNDRED_PLUS("500+");

        private final String value;

        Size(String value) {
            this.value = value;
        }

        @Override
        public String toString() {
            return value;
        }
    }

    public enum Status {
        PENDING,
        APPROVED,
        REJECTED,
        SUSPENDED
    }

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "tax_code", nullable = false, unique = true)
    private String taxCode;

    @Lob
    @Column(name = "address")
    private String address;

    @Column(name = "industry", length = 100)
    private String industry;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "website")
    private String website;

    @Enumerated(EnumType.STRING)
    @Column(name = "company_size")
    private Size companySize;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status")
    private Status status = Status.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Lob
    @Column(name = "rejection_reason")
    private String rejectionReason;

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
