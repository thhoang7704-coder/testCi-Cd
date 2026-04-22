package com.example.labOdc.Service.Implement;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.LabAdminDTO;
import com.example.labOdc.DTO.Response.CompanyResponse;
import com.example.labOdc.DTO.Response.LabAdminResponse;
import com.example.labOdc.DTO.Response.ProjectResponse;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Company;
import com.example.labOdc.Model.LabAdmin;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.MentorInvitation;
import com.example.labOdc.Model.MentorInvitationStatus;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectMentor;
import com.example.labOdc.Model.ProjectMentorRole;
import com.example.labOdc.Model.ProjectMentorStatus;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.ValidationStatus;
import com.example.labOdc.Repository.CompanyRepository;
import com.example.labOdc.Repository.LabAdminRepository;
import com.example.labOdc.Repository.MentorInvitationRepository;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.ProjectMentorRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.LabAdminService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class LabAdminServiceImpl implements LabAdminService {

    private static final Logger logger = LoggerFactory.getLogger(LabAdminServiceImpl.class);
    private final LabAdminRepository labAdminRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;
    private final MentorRepository mentorRepository;
    private final ProjectMentorRepository projectMentorRepository;
    private final MentorInvitationRepository mentorInvitationRepository;

    private LabAdmin resolveCurrentLabAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                "Unauthenticated user");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .or(() -> userRepository.findByEmail(username))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If LAB_ADMIN user doesn't yet have a lab_admins row, create it on the fly.
        return labAdminRepository.findByUser_Id(user.getId())
            .orElseGet(() -> {
                logger.warn("LabAdmin profile missing for userId={}, auto-creating...", user.getId());
                LabAdmin created = LabAdmin.builder().user(user).build();
                return labAdminRepository.save(created);
            });
    }

    private LabAdmin resolveLabAdminFromParam(String labAdminId) {
        if (labAdminId == null || labAdminId.isBlank()) {
            return null;
        }

        // 1) Treat as LabAdmin.id
        LabAdmin byId = labAdminRepository.findById(labAdminId).orElse(null);
        if (byId != null) return byId;

        // 2) Treat as User.id
        LabAdmin byUserId = labAdminRepository.findByUser_Id(labAdminId).orElse(null);
        if (byUserId != null) return byUserId;

        // 3) Treat as username/email -> user -> lab admin
        User user = userRepository.findByUsername(labAdminId)
            .or(() -> userRepository.findByEmail(labAdminId))
            .orElse(null);
        if (user == null) return null;

        return labAdminRepository.findByUser_Id(user.getId()).orElse(null);
    }

    /**
     * Chức năng: Tạo hồ sơ Lab Admin mới.
     * Repository: LabAdminRepository.save() - Lưu entity vào database.
     */
    @Override
    @Transactional
    public LabAdminResponse createLabAdmin(LabAdminDTO dto) {

        // Lấy SYSTEM_ADMIN đang đăng nhập
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Tạo LabAdmin
        LabAdmin labAdmin = LabAdmin.builder()
                .user(user)                
                .department(dto.getDepartment())
                .position(dto.getPosition())
                .build();

        LabAdmin saved = labAdminRepository.save(labAdmin);

        return LabAdminResponse.fromLabAdmin(saved);
    }

    @Override
    public List<LabAdminResponse> getAllLabAdmins() {
        return labAdminRepository.findAll().stream()
                .map(LabAdminResponse::fromLabAdmin)
                .toList();
    }

    /**
     * Chức năng: Xóa Lab Admin theo ID.
     * Repository: LabAdminRepository.findById() và delete() - Tìm và xóa entity.
     */
    @Override
    @Transactional
    public void deleteLabAdmin(String id) {
        logger.info("Deleting lab admin with ID: {}", id);
        LabAdmin labAdmin = labAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LabAdmin not found"));
        labAdminRepository.delete(labAdmin);
        logger.info("Lab admin deleted successfully");
    }

    /**
     * Chức năng: Lấy Lab Admin theo ID.
     * Repository: LabAdminRepository.findById() - Truy vấn entity theo ID.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public LabAdminResponse getLabAdminById(String id) {
        logger.debug("Fetching lab admin with ID: {}", id);
        LabAdmin labAdmin = labAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LabAdmin not found"));
        return LabAdminResponse.fromLabAdmin(labAdmin);
    }

    /**
     * Chức năng: Cập nhật Lab Admin theo ID.
     * Repository: LabAdminRepository.findById() và save() - Tìm và cập nhật entity.
     */
    @Override
    @Transactional
    public LabAdminResponse updateLabAdmin(LabAdminDTO dto, String id) {
        logger.info("Updating lab admin with ID: {}", id);
        LabAdmin labAdmin = labAdminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LabAdmin not found"));

        // Update only non-null fields
        updateLabAdminFields(labAdmin, dto);

        LabAdmin updatedLabAdmin = labAdminRepository.save(labAdmin);
        logger.info("Lab admin updated successfully");
        return LabAdminResponse.fromLabAdmin(updatedLabAdmin);
    }

   
    
    /**
     * Helper method to update lab admin fields from DTO
     * Only updates non-null fields to support partial updates
     */
    private void updateLabAdminFields(LabAdmin labAdmin, LabAdminDTO dto) {
        if (dto.getDepartment() != null)
            labAdmin.setDepartment(dto.getDepartment());
        if (dto.getPosition() != null)
            labAdmin.setPosition(dto.getPosition());
    }

    /**
     * Chức năng: Lấy danh sách công ty đang chờ phê duyệt.
     * Repository: CompanyRepository.findAll() và filter.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<CompanyResponse> listPendingCompanies() {
        logger.debug("Fetching pending companies");
        return companyRepository.findAll().stream()
                .filter(c -> c.getStatus() == Company.Status.PENDING)
                .map(CompanyResponse::fromCompany)
                .toList();
    }

    /**
     * Chức năng: Lấy danh sách dự án đang chờ phê duyệt.
     * Repository: ProjectRepository.findAll() và filter.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<ProjectResponse> listPendingProjects() {
        logger.debug("Fetching pending projects");
        return projectRepository.findAll().stream()
                .filter(p -> p.getValidationStatus() == ValidationStatus.PENDING)
                .map(ProjectResponse::fromProject)
                .toList();
    }

    /**
     * Chức năng: Phê duyệt dự án.
     * Repository: ProjectRepository.findById(), save().
     */
    @Override
    @Transactional
    public void validateProject(String projectId, String labAdminId) {
        logger.info("Validating project ID: {} by lab admin ID: {}", projectId, labAdminId);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        LabAdmin labAdmin = resolveLabAdminFromParam(labAdminId);
        if (labAdmin == null) {
            labAdmin = resolveCurrentLabAdmin();
        }

        project.setValidationStatus(ValidationStatus.APPROVED);
        project.setValidatedBy(labAdmin);
        project.setValidatedAt(java.time.LocalDateTime.now());
        projectRepository.save(project);
        logger.info("Project validated successfully");
    }

    /**
     * Chức năng: Từ chối dự án với lý do.
     * Repository: ProjectRepository.findById(), save().
     */
    @Override
    @Transactional
    public void rejectProject(String projectId, String reason, String labAdminId) {
        logger.info("Rejecting project ID: {} by lab admin ID: {} for reason: {}", projectId, labAdminId, reason);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        LabAdmin labAdmin = resolveLabAdminFromParam(labAdminId);
        if (labAdmin == null) {
            labAdmin = resolveCurrentLabAdmin();
        }

        project.setValidationStatus(ValidationStatus.REJECTED);
        project.setRejectionReason(reason);
        project.setValidatedBy(labAdmin);
        project.setValidatedAt(java.time.LocalDateTime.now());
        projectRepository.save(project);
        logger.info("Project rejected successfully");
    }


    @Override
    public CompanyResponse getCompanyDetails(String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return CompanyResponse.fromCompany(company);
    }

    @Override
    public ProjectResponse getProjectDetails(String projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        return ProjectResponse.fromProject(project);
    }

    @Override
    public void assignMentorToProject(String projectId, String mentorId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        Mentor mentor = mentorRepository.findById(mentorId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor not found"));
        ProjectMentor projectMentor = ProjectMentor.builder()
                .project(project)
                .mentor(mentor)
                .role(ProjectMentorRole.MAIN_MENTOR)
                .status(ProjectMentorStatus.ACTIVE)
                .build();
        projectMentorRepository.save(projectMentor);
        logger.info("Mentor assigned to project successfully");
    }

    @Override
    public void approveMentorInvitation(String invitationId) {
        MentorInvitation invitation = mentorInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor invitation not found"));
        invitation.setStatus(MentorInvitationStatus.ACCEPTED);
        invitation.setRespondedAt(java.time.LocalDateTime.now());
        mentorInvitationRepository.save(invitation);
        logger.info("Mentor invitation approved successfully");
    }

    @Override
    public void rejectMentorInvitation(String invitationId, String reason) {
        MentorInvitation invitation = mentorInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("Mentor invitation not found"));
        invitation.setStatus(MentorInvitationStatus.REJECTED);
        invitation.setRespondedAt(java.time.LocalDateTime.now());
        mentorInvitationRepository.save(invitation);
        logger.info("Mentor invitation rejected successfully");
    }

    @Override
    public void allocateFund(String paymentId) {
        // Placeholder: Logic phân bổ quỹ
        logger.info("Allocating fund for payment: {}", paymentId);
        // Có thể cập nhật Payment entity nếu có
    }

    @Override
    public void approveFundDistribution(String distributionId) {
        // Placeholder: Logic phê duyệt phân bổ quỹ
        logger.info("Approving fund distribution: {}", distributionId);
        // Có thể cập nhật FundDistribution entity nếu có
    }

    @Override
    public void approveMentorPayment(String mentorPaymentId) {
        // Placeholder: Logic phê duyệt thanh toán mentor
        logger.info("Approving mentor payment: {}", mentorPaymentId);
        // Có thể cập nhật MentorPayment entity nếu có
    }

    @Override
    public void approveLabAdvance(String advanceId) {
        // Placeholder: Logic phê duyệt tạm ứng lab
        logger.info("Approving lab advance: {}", advanceId);
        // Có thể cập nhật LabAdvance entity nếu có
    }

    @Override
    public void publishMonthlyReport(int month, int year) {
        // Placeholder: Logic xuất bản báo cáo tháng
        logger.info("Publishing monthly report for {}/{}", month, year);
        // Có thể tạo Report entity và lưu
    }

    @Override
    public String getSystemFinancialSummary() {
        // Placeholder: Tính toán tóm tắt tài chính
        return "Total funds allocated: $100,000. Total payments: $50,000. Remaining: $50,000.";
    }

    @Override
    public List<String> getAuditLogs(String filter) {
        // Placeholder: Lấy nhật ký kiểm tra
        return List.of("Audit log 1: User login", "Audit log 2: Project created", "Audit log 3: Payment approved");
    }
}
