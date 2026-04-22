package com.example.labOdc.Service;

import com.example.labOdc.DTO.LabFundAdvanceDTO;
import com.example.labOdc.Model.LabFundAdvance;

import java.math.BigDecimal;
import java.util.List;

public interface LabFundAdvanceService {

    // Tạo mới yêu cầu tạm ứng từ Lab Admin
    LabFundAdvance createAdvance(LabFundAdvanceDTO dto);

    // Lab Admin phê duyệt tạm ứng
    LabFundAdvance approveAdvance(String advanceId, String approvedByUserId);

    // Quyết toán tạm ứng khi doanh nghiệp thanh toán
    LabFundAdvance settleAdvance(String advanceId, String paymentId);

    // Hủy yêu cầu tạm ứng
    LabFundAdvance cancelAdvance(String advanceId, String reason);

    // Lấy danh sách tạm ứng theo project
    List<LabFundAdvance> getAdvancesByProject(String projectId);

    // Lấy danh sách tạm ứng chưa quyết toán
    List<LabFundAdvance> getUnsettledAdvances();

    // Tính tổng số tiền tạm ứng chưa quyết toán
    BigDecimal getTotalOutstandingAdvance();

    // Lấy tạm ứng theo ID
    LabFundAdvance getAdvanceById(String advanceId);
}