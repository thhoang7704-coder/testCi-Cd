package com.example.labOdc.Service;

import com.example.labOdc.DTO.MentorPaymentDTO;
import com.example.labOdc.Model.MentorPayment;
import com.example.labOdc.Model.MentorPaymentStatus;

import java.math.BigDecimal;
import java.util.List;

public interface MentorPaymentService {

    // Tạo mới mentor payment từ Lab Admin
    MentorPayment createMentorPayment(MentorPaymentDTO dto);

    // Lab Admin phê duyệt thanh toán mentor
    MentorPayment approveMentorPayment(String mentorPaymentId, String approvedByUserId);

    // Đánh dấu thanh toán mentor đã được thanh toán
    MentorPayment markAsPaid(
            String mentorPaymentId,
            String paymentMethod,
            String transactionReference
    );

    // Hủy / từ chối thanh toán mentor
    MentorPayment cancelMentorPayment(String mentorPaymentId, String reason);

    // Lấy chi tiết 1 mentor payment
    MentorPayment getById(String mentorPaymentId);

    // Lấy danh sách payment theo mentor
    List<MentorPayment> getByMentor(String mentorId);

    // Lấy danh sách payment theo project
    List<MentorPayment> getByProject(String projectId);

    // Lấy danh sách payment theo trạng thái
    List<MentorPayment> getByStatus(MentorPaymentStatus status);

    // Tổng số tiền đã chi / chờ chi cho mentor
    BigDecimal getTotalAmountByMentor(String mentorId);
}