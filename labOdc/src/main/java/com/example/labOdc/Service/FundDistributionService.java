package com.example.labOdc.Service;

import com.example.labOdc.DTO.FundDistributionDTO;
import com.example.labOdc.DTO.Response.FundDistributionResponse;

import java.util.List;

public interface FundDistributionService {

    // Tạo mới đợt phân phối tiền từ FundAllocation
    FundDistributionResponse createDistribution(FundDistributionDTO dto);

    // Cập nhật trạng thái phân phối tiền
    FundDistributionResponse updateStatus(
            String distributionId,
            String status,
            String approvedById,
            String notes
    );

    // Đánh dấu phân phối tiền đã được thanh toán
    FundDistributionResponse markAsPaid(
            String distributionId,
            String paymentMethod,
            String transactionReference
    );

    // Lấy đợt phân phối tiền theo ID
    FundDistributionResponse getById(String id);

    // Lấy danh sách các khoản tiền phân phối từ 1 FundAllocation
    List<FundDistributionResponse> getByFundAllocationId(String fundAllocationId);

    // Lấy danh sách các khoản tiền mà 1 talent nhận được
    List<FundDistributionResponse> getByTalentId(String talentId);

    // Kiểm tra xem FundAllocation đã được phân phối đầy đủ chưa
    boolean isFullyDistributed(String fundAllocationId);
}