package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.MentorPaymentDTO;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.*;
import com.example.labOdc.Service.MentorPaymentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MentorPaymentServiceImpl implements MentorPaymentService {

    private final MentorPaymentRepository mentorPaymentRepository;
    private final FundAllocationRepository fundAllocationRepository;
    private final MentorRepository mentorRepository;
    private final UserRepository userRepository;

    @Override
    public MentorPayment createMentorPayment(MentorPaymentDTO dto) {

        FundAllocation fundAllocation = null;
        Project project = null;

        if (dto.getFundAllocationId() != null) {
            fundAllocation = fundAllocationRepository.findById(dto.getFundAllocationId())
                    .orElseThrow(() -> new EntityNotFoundException("FundAllocation not found"));
            project = fundAllocation.getProject();
        }

        Mentor mentor = mentorRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new EntityNotFoundException("Mentor not found"));

        MentorPayment payment = MentorPayment.builder()
                .fundAllocation(fundAllocation)
                .mentor(mentor)
                .project(project)
                .amount(dto.getTotalAmount())
                .notes(dto.getNotes())
                .status(MentorPaymentStatus.PENDING)
                .build();

        return mentorPaymentRepository.save(payment);
    }

    @Override
    public MentorPayment approveMentorPayment(String mentorPaymentId, String approvedByUserId) {

        MentorPayment payment = getById(mentorPaymentId);

        User approvedBy = userRepository.findById(approvedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        payment.setStatus(MentorPaymentStatus.APPROVED);
        payment.setApprovedBy(approvedBy);
        payment.setApprovedAt(LocalDateTime.now());

        return mentorPaymentRepository.save(payment);
    }

    @Override
    public MentorPayment markAsPaid(
            String mentorPaymentId,
            String paymentMethod,
            String transactionReference
    ) {

        MentorPayment payment = getById(mentorPaymentId);

        payment.setStatus(MentorPaymentStatus.PAID);
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionReference(transactionReference);
        payment.setPaidDate(LocalDate.now());

        return mentorPaymentRepository.save(payment);
    }

    @Override
    public MentorPayment cancelMentorPayment(String mentorPaymentId, String reason) {

        MentorPayment payment = getById(mentorPaymentId);

        payment.setStatus(MentorPaymentStatus.CANCELLED);
        payment.setNotes(reason);

        return mentorPaymentRepository.save(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public MentorPayment getById(String mentorPaymentId) {
        return mentorPaymentRepository.findById(mentorPaymentId)
                .orElseThrow(() -> new EntityNotFoundException("MentorPayment not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPayment> getByMentor(String mentorId) {
        return mentorPaymentRepository.findByMentorId(mentorId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPayment> getByProject(String projectId) {
        return mentorPaymentRepository.findByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPayment> getByStatus(MentorPaymentStatus status) {
        return mentorPaymentRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalAmountByMentor(String mentorId) {

        if (mentorId == null) return BigDecimal.ZERO;

        return mentorPaymentRepository.getTotalPaidAmountByMentor(mentorId);
    }
}