package com.example.labOdc.Service;

import com.example.labOdc.DTO.FundAllocationDTO;
import com.example.labOdc.DTO.Response.FundAllocationResponse;
import com.example.labOdc.Model.FundAllocationStatus;

import java.util.List;

public interface FundAllocationService {

    // Tạo mới allocation từ Payment / Project
    FundAllocationResponse createAllocation(FundAllocationDTO dto);

    // Lấy allocation theo ID
    FundAllocationResponse getById(String allocationId);

    //Lấy allocation theo paymentId
    FundAllocationResponse getByPaymentId(String paymentId);

    //Lấy danh sách allocation theo project
    List<FundAllocationResponse> getByProjectId(String projectId);

    // Cập nhật trạng thái allocation (PENDING → ALLOCATED → DISTRIBUTED)
    FundAllocationResponse updateStatus(
            String allocationId,
            FundAllocationStatus status,
            String notes
    );

    // Tính toán lại số tiền phân bổ (70/20/10)
    FundAllocationResponse recalculateAmounts(String allocationId);

    // Kiểm tra allocation đã đủ điều kiện để phân phối chưa
    boolean isReadyForDistribution(String allocationId);
}