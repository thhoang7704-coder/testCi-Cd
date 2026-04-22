package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.FundAllocationDTO;
import com.example.labOdc.DTO.Response.FundAllocationResponse;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.*;
import com.example.labOdc.Service.FundAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FundAllocationServiceImpl implements FundAllocationService {

    private final FundAllocationRepository fundAllocationRepository;
    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;

    @Override
    public FundAllocationResponse createAllocation(FundAllocationDTO dto) {

        Payment payment = null;
        if (dto.getPaymentId() != null) {
            payment = paymentRepository.findById(dto.getPaymentId())
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            if (payment.getStatus() != PaymentStatus.COMPLETED) {
                throw new RuntimeException("Payment must be COMPLETED to allocate fund");
            }
        }

        Project project = null;
        if (dto.getProjectId() != null) {
            project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
        }

        BigDecimal totalAmount =
                dto.getTotalAmount() != null
                        ? dto.getTotalAmount()
                        : (payment != null ? payment.getAmount() : null);

        if (totalAmount == null) {
            throw new RuntimeException("Total amount is required");
        }

        FundAllocation allocation = FundAllocation.builder()
                .payment(payment)
                .project(project)
                .totalAmount(totalAmount)
                .teamPercentage(new BigDecimal("70.00"))
                .mentorPercentage(new BigDecimal("20.00"))
                .labPercentage(new BigDecimal("10.00"))
                .status(FundAllocationStatus.PENDING)
                .notes(dto.getNotes())
                .build();

        calculateAmounts(allocation);

        allocation.setAllocatedAt(LocalDateTime.now());

        return mapToResponse(fundAllocationRepository.save(allocation));
    }

    @Override
    public FundAllocationResponse updateStatus(
            String allocationId,
            FundAllocationStatus status,
            String notes
    ) {
        FundAllocation allocation = fundAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Fund allocation not found"));

        allocation.setStatus(status);

        if (notes != null) {
            allocation.setNotes(notes);
        }

        if (status == FundAllocationStatus.ALLOCATED) {
            allocation.setAllocatedAt(LocalDateTime.now());
        }

        return mapToResponse(fundAllocationRepository.save(allocation));
    }

    @Override
    public FundAllocationResponse recalculateAmounts(String allocationId) {
        FundAllocation allocation = fundAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Fund allocation not found"));

        calculateAmounts(allocation);

        return mapToResponse(fundAllocationRepository.save(allocation));
    }

    @Override
    public boolean isReadyForDistribution(String allocationId) {
        FundAllocation allocation = fundAllocationRepository.findById(allocationId)
                .orElseThrow(() -> new RuntimeException("Fund allocation not found"));

        return allocation.getStatus() == FundAllocationStatus.ALLOCATED;
    }

    @Override
    @Transactional(readOnly = true)
    public FundAllocationResponse getById(String allocationId) {
        return fundAllocationRepository.findById(allocationId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Fund allocation not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public FundAllocationResponse getByPaymentId(String paymentId) {
        return fundAllocationRepository.findByPaymentId(paymentId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Allocation not found for payment"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundAllocationResponse> getByProjectId(String projectId) {
        return fundAllocationRepository.findByProjectId(projectId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private void calculateAmounts(FundAllocation allocation) {
        BigDecimal total = allocation.getTotalAmount();

        allocation.setTeamAmount(
                total.multiply(allocation.getTeamPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
        );

        allocation.setMentorAmount(
                total.multiply(allocation.getMentorPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
        );

        allocation.setLabAmount(
                total.multiply(allocation.getLabPercentage())
                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
        );
    }

    private FundAllocationResponse mapToResponse(FundAllocation allocation) {
        return FundAllocationResponse.builder()
                .id(allocation.getId())
                .paymentId(allocation.getPayment() != null ? allocation.getPayment().getId() : null)
                .projectName(allocation.getProject() != null ? allocation.getProject().getProjectName() : null)
                .projectCode(allocation.getProject() != null ? allocation.getProject().getProjectCode() : null)
                .totalAmount(allocation.getTotalAmount())
                .teamAmount(allocation.getTeamAmount())
                .mentorAmount(allocation.getMentorAmount())
                .labAmount(allocation.getLabAmount())
                .teamPercentage(allocation.getTeamPercentage())
                .mentorPercentage(allocation.getMentorPercentage())
                .labPercentage(allocation.getLabPercentage())
                .status(allocation.getStatus().name())
                .allocatedAt(allocation.getAllocatedAt())
                .notes(allocation.getNotes())
                .createdAt(allocation.getCreatedAt())
                .updatedAt(allocation.getUpdatedAt())
                .build();
    }
}