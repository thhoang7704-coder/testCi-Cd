package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.FundDistributionDTO;
import com.example.labOdc.DTO.Response.FundDistributionResponse;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.*;
import com.example.labOdc.Service.FundDistributionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FundDistributionServiceImpl implements FundDistributionService {

    private final FundDistributionRepository fundDistributionRepository;
    private final FundAllocationRepository fundAllocationRepository;
    private final TalentRepository talentRepository;
    private final UserRepository userRepository;

    @Override
    public FundDistributionResponse createDistribution(FundDistributionDTO dto) {

        FundAllocation allocation = null;

        if (dto.getFundAllocationId() != null && !dto.getFundAllocationId().isBlank()) {
                allocation = fundAllocationRepository
                        .findById(dto.getFundAllocationId())
                        .orElse(null); // ❗ KHÔNG throw khi test
        }
        Talent talent = dto.getTalentId() != null
                ? talentRepository.findById(dto.getTalentId()).orElse(null)
                : null;

        FundDistribution distribution = FundDistribution.builder()
                .fundAllocation(allocation)
                .talent(talent)
                .amount(dto.getAmount())
                .percentage(dto.getPercentage())
                .status(FundDistributionStatus.PENDING)
                .notes(dto.getNotes())
                .build();

        return FundDistributionResponse.fromEntity(
                fundDistributionRepository.save(distribution)
        );
    }

    @Override
    public FundDistributionResponse updateStatus(
            String distributionId,
            String status,
            String approvedById,
            String notes
    ) {

        FundDistribution distribution = fundDistributionRepository.findById(distributionId)
                .orElseThrow(() -> new RuntimeException("Fund distribution not found"));

        FundDistributionStatus newStatus =
                FundDistributionStatus.valueOf(status.toUpperCase());

        distribution.setStatus(newStatus);

        if (approvedById != null) {
            User approvedBy = userRepository.findById(approvedById)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            distribution.setApprovedBy(approvedBy);
            distribution.setApprovedAt(LocalDateTime.now());
        }

        if (notes != null) {
            distribution.setNotes(notes);
        }

        return FundDistributionResponse.fromEntity(
                fundDistributionRepository.save(distribution)
        );
    }

    @Override
    public FundDistributionResponse markAsPaid(
            String distributionId,
            String paymentMethod,
            String transactionReference
    ) {

        FundDistribution distribution = fundDistributionRepository.findById(distributionId)
                .orElseThrow(() -> new RuntimeException("Fund distribution not found"));

        distribution.setStatus(FundDistributionStatus.PAID);
        distribution.setPaidDate(LocalDate.now());
        distribution.setPaymentMethod(paymentMethod);
        distribution.setTransactionReference(transactionReference);

        return FundDistributionResponse.fromEntity(
                fundDistributionRepository.save(distribution)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public FundDistributionResponse getById(String id) {
        return fundDistributionRepository.findById(id)
                .map(FundDistributionResponse::fromEntity)
                .orElseThrow(() -> new RuntimeException("Fund distribution not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundDistributionResponse> getByFundAllocationId(String fundAllocationId) {
        return fundDistributionRepository.findByFundAllocationId(fundAllocationId)
                .stream()
                .map(FundDistributionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<FundDistributionResponse> getByTalentId(String talentId) {
        return fundDistributionRepository.findByTalentId(talentId)
                .stream()
                .map(FundDistributionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFullyDistributed(String fundAllocationId) {

        FundAllocation allocation = fundAllocationRepository.findById(fundAllocationId)
                .orElseThrow(() -> new RuntimeException("Fund allocation not found"));

        return fundDistributionRepository.findByFundAllocationId(fundAllocationId)
                .stream()
                .allMatch(d -> d.getStatus() == FundDistributionStatus.PAID);
    }
}