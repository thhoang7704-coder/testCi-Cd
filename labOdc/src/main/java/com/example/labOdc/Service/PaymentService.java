package com.example.labOdc.Service;

import com.example.labOdc.DTO.PaymentDTO;
import com.example.labOdc.Model.Payment;
import com.example.labOdc.Model.PaymentStatus;
import com.example.labOdc.Model.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PaymentService {

    // Tạo payment mới cho project / company
    Payment createPayment(PaymentDTO paymentDTO);

    // Tạo payment tạm ứng từ Lab Fund (ADVANCE)
    Payment createAdvancePayment(
            String projectId,
            String companyId,
            PaymentType paymentType,
            String note
    );

    // Cập nhật trạng thái payment
    Payment updatePaymentStatus(
            String paymentId,
            PaymentStatus status,
            String transactionId
    );

    /**
     * Xác nhận payment đã hoàn tất
     * → trigger FundAllocation
     * updatePaymentStatus → callback / admin
     * confirmPayment → business action (COMPLETED + trigger allocation)
     */
    Payment confirmPayment(String paymentId);

    // Hủy payment
    void cancelPayment(String paymentId, String reason);

    Payment getPaymentById(String paymentId);

    List<Payment> getPaymentsByProject(String projectId);

    List<Payment> getPaymentsByCompany(String companyId);

    List<Payment> getPaymentsByStatus(PaymentStatus status);

    // Lấy danh sách payment quá hạn chưa thanh toán
    List<Payment> getOverduePayments(LocalDate currentDate);

    // Kiểm tra project đã thanh toán đủ chưa
    boolean isProjectFullyPaid(String projectId);

    // Tổng số tiền đã thanh toán cho project
    BigDecimal getTotalPaidAmountByProject(String projectId);
    
    // Kiểm tra quyền sở hữu payment thuộc về company
    void validatePaymentOwnership(String paymentId, String companyId);
}