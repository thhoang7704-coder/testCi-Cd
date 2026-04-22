package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.ProjectApplicationDTO;
import com.example.labOdc.DTO.Response.ProjectApplicationResponse;

public interface ProjectApplicationService {
    ProjectApplicationResponse createApplication(ProjectApplicationDTO dto, String requesterUsername);

    List<ProjectApplicationResponse> getAllApplications();

    ProjectApplicationResponse getApplicationById(String id);

    void deleteApplication(String id);

    ProjectApplicationResponse updateApplication(ProjectApplicationDTO dto, String id);

    List<ProjectApplicationResponse> findByProjectId(String projectId);

    List<ProjectApplicationResponse> findByTalentId(String talentId);

    /**
     * Chức năng: Lấy danh sách đơn ứng tuyển của user hiện tại.
     * Service: Dựa theo requesterUsername để resolve User -> Talent -> Applications.
     */
    List<ProjectApplicationResponse> getMyApplications(String requesterUsername);

    /**
     * Chức năng: Phê duyệt đơn ứng tuyển dự án.
     * Service: Cập nhật trạng thái thành APPROVED, ghi nhận người phê duyệt và thời gian.
     */
    ProjectApplicationResponse approveApplication(String id, String reviewerUsername);

    /**
     * Chức năng: Từ chối đơn ứng tuyển dự án.
     * Service: Cập nhật trạng thái thành REJECTED, ghi nhận lý do từ chối và người phê duyệt.
     */
    ProjectApplicationResponse rejectApplication(String id, String reviewerUsername, String reason);

    /**
     * Chức năng: Mentor lấy danh sách applications PENDING thuộc các dự án mentor phụ trách.
     */
    List<ProjectApplicationResponse> getPendingApplicationsForMentor(String mentorUsername);

    /**
     * Chức năng: Hủy đơn ứng tuyển dự án.
     * Service: Cập nhật trạng thái thành WITHDRAWN.
     */
    ProjectApplicationResponse cancelApplication(String id);

    /**
     * Chức năng: Lấy danh sách đơn ứng tuyển đang chờ xử lý theo dự án.
     * Service: Lọc các đơn có status PENDING.
     */
    List<ProjectApplicationResponse> getPendingApplications(String projectId);

    /**
     * Chức năng: Thêm talent vào team dự án sau khi phê duyệt.
     * Service: Tạo ProjectTeam entity.
     */
    void addTalentToProjectTeam(String applicationId);

    /**
     * Chức năng: Xóa talent khỏi dự án.
     * Service: Xóa ProjectTeam entity.
     */
    void removeTalentFromProject(String projectId, String talentId);

    /**
     * Tạo đơn ứng tuyển.
     * @param projectId ID dự án
     * @param talentId ID talent
     * @param coverLetter Thư xin việc
     */
    void createApplication(String projectId, String talentId, String coverLetter);

    /**
     * Rút đơn ứng tuyển.
     * @param applicationId ID đơn ứng tuyển
     */
    void withdrawApplication(String applicationId, String requesterUsername);

    /**
     * Lấy danh sách đơn ứng tuyển theo dự án.
     * @param projectId ID dự án
     * @return Danh sách đơn ứng tuyển
     */
    List<ProjectApplicationResponse> getApplicationsByProject(String projectId);

    /**
     * Lấy danh sách đơn ứng tuyển theo talent.
     * @param talentId ID talent
     * @return Danh sách đơn ứng tuyển
     */
    List<ProjectApplicationResponse> getApplicationsByTalent(String talentId);
}
