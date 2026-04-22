package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.LabAdminDTO;
import com.example.labOdc.DTO.Response.CompanyResponse;
import com.example.labOdc.DTO.Response.LabAdminResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;

public interface LabAdminService {
    LabAdminResponse createLabAdmin(LabAdminDTO dto);

    List<LabAdminResponse> getAllLabAdmins();

    void deleteLabAdmin(String id);

    LabAdminResponse getLabAdminById(String id);

    LabAdminResponse updateLabAdmin(LabAdminDTO dto, String id);

    // Các method bổ sung từ spec
    /**
     * Lấy danh sách công ty đang chờ phê duyệt.
     * @return List<LabAdminResponse> (hoặc CompanyResponse nếu phù hợp)
     */
    List<?> listPendingCompanies();

    /**
     * Lấy danh sách dự án đang chờ phê duyệt.
     * @return List<ProjectResponse>
     */
    List<?> listPendingProjects();

    /**
     * Phê duyệt dự án.
     * @param projectId ID dự án
     * @param labAdminId ID lab admin phê duyệt
     */
    void validateProject(String projectId, String labAdminId);

    /**
     * Từ chối dự án với lý do.
     * @param projectId ID dự án
     * @param reason Lý do từ chối
     * @param labAdminId ID lab admin
     */
    void rejectProject(String projectId, String reason, String labAdminId);

    /**
     * Lấy chi tiết công ty theo ID.
     * @param companyId ID công ty
     * @return Chi tiết công ty
     */
    CompanyResponse getCompanyDetails(String companyId);

    /**
     * Lấy chi tiết dự án theo ID.
     * @param projectId ID dự án
     * @return Chi tiết dự án
     */
    ProjectResponse getProjectDetails(String projectId);

    /**
     * Gán mentor cho dự án.
     * @param projectId ID dự án
     * @param mentorId ID mentor
     */
    void assignMentorToProject(String projectId, String mentorId);

    /**
     * Phê duyệt lời mời mentor.
     * @param invitationId ID lời mời
     */
    void approveMentorInvitation(String invitationId);

    /**
     * Từ chối lời mời mentor.
     * @param invitationId ID lời mời
     * @param reason Lý do từ chối
     */
    void rejectMentorInvitation(String invitationId, String reason);

    /**
     * Phân bổ quỹ cho dự án.
     * @param paymentId ID thanh toán
     */
    void allocateFund(String paymentId);

    /**
     * Phê duyệt phân bổ quỹ.
     * @param distributionId ID phân bổ
     */
    void approveFundDistribution(String distributionId);

    /**
     * Phê duyệt thanh toán mentor.
     * @param mentorPaymentId ID thanh toán mentor
     */
    void approveMentorPayment(String mentorPaymentId);

    /**
     * Phê duyệt tạm ứng lab.
     * @param advanceId ID tạm ứng
     */
    void approveLabAdvance(String advanceId);

    /**
     * Xuất bản báo cáo tháng.
     * @param month Tháng
     * @param year Năm
     */
    void publishMonthlyReport(int month, int year);

    /**
     * Lấy tóm tắt tài chính hệ thống.
     * @return String tóm tắt
     */
    String getSystemFinancialSummary();

    /**
     * Lấy nhật ký kiểm tra.
     * @param filter Bộ lọc
     * @return List nhật ký
     */
    List<String> getAuditLogs(String filter);

    // Các method khác cần repository bổ sung, chưa triển khai
}
