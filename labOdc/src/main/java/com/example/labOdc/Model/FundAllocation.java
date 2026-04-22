package com.example.labOdc.Model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fund_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundAllocation {

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;  

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal teamAmount;      // 70%

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal mentorAmount;    // 20%

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal labAmount;       // 10%

    @Builder.Default
    @Column(name = "team_percentage", precision = 5, scale = 2)
    private BigDecimal teamPercentage = new BigDecimal("70.00");

    @Builder.Default
    @Column(name = "mentor_percentage", precision = 5, scale = 2)
    private BigDecimal mentorPercentage = new BigDecimal("20.00");

    @Builder.Default
    @Column(name = "lab_percentage", precision = 5, scale = 2)
    private BigDecimal labPercentage = new BigDecimal("10.00");

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FundAllocationStatus status = FundAllocationStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocated_by")
    private User allocatedBy;

    @Column(name = "allocated_at")
    private LocalDateTime allocatedAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    private void ensureId() {
        if (this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
    }
}