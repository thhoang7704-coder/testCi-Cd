package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.LabFundAdvanceDTO;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.*;
import com.example.labOdc.Service.LabFundAdvanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LabFundAdvanceServiceImpl implements LabFundAdvanceService {

    private final LabFundAdvanceRepository labFundAdvanceRepository;
    private final ProjectRepository projectRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Override
    public LabFundAdvance createAdvance(LabFundAdvanceDTO dto) {

        Project project = null;
        if (dto.getProjectId() != null) {
            project = projectRepository.findById(dto.getProjectId()).orElse(null);
        }

        Payment payment = null;
        if (dto.getPaymentId() != null) {
            payment = paymentRepository.findById(dto.getPaymentId()).orElse(null);
        }

        LabFundAdvance advance = LabFundAdvance.builder()
                .project(project)
                .payment(payment)
                .advanceAmount(dto.getAdvanceAmount())
                .advanceReason(dto.getAdvanceReason())
                .status(LabFundAdvanceStatus.ADVANCED)
                .build();

        return labFundAdvanceRepository.save(advance);
    }

    @Override
    public LabFundAdvance approveAdvance(String advanceId, String approvedByUserId) {

        LabFundAdvance advance = labFundAdvanceRepository.findById(advanceId).orElse(null);
        if (advance == null) return null;

        User approver = null;
        if (approvedByUserId != null) {
            approver = userRepository.findById(approvedByUserId).orElse(null);
        }

        advance.setApprovedBy(approver);
        return labFundAdvanceRepository.save(advance);
    }

    @Override
    public LabFundAdvance settleAdvance(String advanceId, String paymentId) {

        LabFundAdvance advance = labFundAdvanceRepository.findById(advanceId).orElse(null);
        if (advance == null) return null;

        Payment payment = null;
        if (paymentId != null) {
            payment = paymentRepository.findById(paymentId).orElse(null);
        }

        advance.setPayment(payment);
        advance.setStatus(LabFundAdvanceStatus.SETTLED);
        return labFundAdvanceRepository.save(advance);
    }

    @Override
    public LabFundAdvance cancelAdvance(String advanceId, String reason) {

        LabFundAdvance advance = labFundAdvanceRepository.findById(advanceId).orElse(null);
        if (advance == null) return null;

        advance.setStatus(LabFundAdvanceStatus.CANCELLED);
        if (reason != null) {
            advance.setAdvanceReason(reason);
        }

        return labFundAdvanceRepository.save(advance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabFundAdvance> getAdvancesByProject(String projectId) {
        if (projectId == null) return List.of();
        return labFundAdvanceRepository.findByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabFundAdvance> getUnsettledAdvances() {
        return labFundAdvanceRepository.findByStatus(LabFundAdvanceStatus.ADVANCED);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalOutstandingAdvance() {
        return labFundAdvanceRepository.findByStatus(LabFundAdvanceStatus.ADVANCED)
                .stream()
                .map(LabFundAdvance::getAdvanceAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    @Transactional(readOnly = true)
    public LabFundAdvance getAdvanceById(String advanceId) {
        if (advanceId == null) return null;
        return labFundAdvanceRepository.findById(advanceId).orElse(null);
    }
}