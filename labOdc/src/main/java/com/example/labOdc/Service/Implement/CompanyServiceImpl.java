package com.example.labOdc.Service.Implement;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.labOdc.DTO.CompanyDTO;
import com.example.labOdc.DTO.Response.CompanyResponse;
import com.example.labOdc.Exception.ResourceNotFoundException;
import com.example.labOdc.Model.Company;
import com.example.labOdc.Model.Project;
import com.example.labOdc.Model.ProjectStatus;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.CompanyRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.RoleRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.CompanyService;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private static final Logger logger = LoggerFactory.getLogger(CompanyServiceImpl.class);
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public CompanyResponse getMyCompany() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException(
                    "Unauthenticated user");
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username)
            .or(() -> userRepository.findByEmail(username))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Company company = companyRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        return CompanyResponse.fromCompany(company);
    }

    /**
     * Chức năng: Tạo hồ sơ công ty mới.
     * Repository: CompanyRepository.save() - Lưu entity vào database.
     */
    
@Override
@Transactional
public CompanyResponse createCompany(CompanyDTO companyDTO) {

    //  Lấy user đang đăng nhập
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
        throw new RuntimeException("Unauthenticated user");
    }

    String username = auth.getName();

    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    //  Tạo company
    Company company = Company.builder()
            .companyName(companyDTO.getCompanyName())
            .taxCode(companyDTO.getTaxCode())
            .address(companyDTO.getAddress())
            .industry(companyDTO.getIndustry())
            .description(companyDTO.getDescription())
            .website(companyDTO.getWebsite())
            .companySize(companyDTO.getCompanySize())
            .user(user)
            .status(Company.Status.PENDING)
            .build();

    companyRepository.save(company);

    //  Gán role COMPANY cho user (nếu chưa có)
    RoleEntity companyRole = roleRepository.findByRole(UserRole.COMPANY)
            .orElseThrow(() -> new ResourceNotFoundException("COMPANY role not found"));

    boolean hasCompanyRole = user.getRoles().stream()
            .anyMatch(r -> r.getRole() == UserRole.COMPANY);

    if (!hasCompanyRole) {
        user.getRoles().add(companyRole);
        userRepository.save(user);
    }

    return CompanyResponse.fromCompany(company);
}


    /**
     * Chức năng: Lấy danh sách tất cả công ty.
     * Repository: CompanyRepository.findAll() - Truy vấn tất cả entities.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<CompanyResponse> getAllCompanies() {
        logger.debug("Fetching all companies");
        return companyRepository.findAll().stream()
                .map(CompanyResponse::fromCompany)
                .toList();
    }

    /**
     * Chức năng: Xóa công ty theo ID.
     * Repository: CompanyRepository.findById() và delete() - Tìm và xóa entity.
     */
    @Override
    @Transactional
    public void deleteCompany(String id) {
        logger.info("Deleting company with ID: {}", id);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        companyRepository.delete(company);
        logger.info("Company deleted successfully");
    }

    /**
     * Chức năng: Lấy công ty theo ID.
     * Repository: CompanyRepository.findById() - Truy vấn entity theo ID.
     */
    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public CompanyResponse getCompanyById(String id) {
        logger.debug("Fetching company with ID: {}", id);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return CompanyResponse.fromCompany(company);
    }

    /**
     * Chức năng: Cập nhật công ty theo ID.
     * Repository: CompanyRepository.findById() và save() - Tìm và cập nhật entity.
     */
    @Override
    @Transactional
    public CompanyResponse updateCompany(CompanyDTO companyDTO, String id) {
        logger.info("Updating company with ID: {}", id);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        // Update only non-null fields
        updateCompanyFields(company, companyDTO);

        Company updatedCompany = companyRepository.save(company);
        logger.info("Company updated successfully");
        return CompanyResponse.fromCompany(updatedCompany);
    }

    /**
     * Helper method to update company fields from DTO
     * Only updates non-null fields to support partial updates
     */
    private void updateCompanyFields(Company company, CompanyDTO dto) {
        if (dto.getCompanyName() != null)
            company.setCompanyName(dto.getCompanyName());
        if (dto.getTaxCode() != null)
            company.setTaxCode(dto.getTaxCode());
        if (dto.getAddress() != null)
            company.setAddress(dto.getAddress());
        if (dto.getIndustry() != null)
            company.setIndustry(dto.getIndustry());
        if (dto.getDescription() != null)
            company.setDescription(dto.getDescription());
        if (dto.getWebsite() != null)
            company.setWebsite(dto.getWebsite());
        if (dto.getCompanySize() != null)
            company.setCompanySize(dto.getCompanySize());
    }



    /**
     * Chức năng: Suspend công ty với lý do.
     * Repository: CompanyRepository.findById(), save().
     * Logic: Cập nhật status thành SUSPENDED và lưu lý do.
     */
    @Override
    @Transactional
    public CompanyResponse suspendCompany(String companyId, String reason) {
        logger.info("Suspending company with ID: {} for reason: {}", companyId, reason);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with ID: " + companyId));
        company.setStatus(Company.Status.SUSPENDED);
        company.setRejectionReason(reason); // Sử dụng rejectionReason cho suspend reason
        Company updatedCompany = companyRepository.save(company);
        logger.info("Company suspended successfully");
        return CompanyResponse.fromCompany(updatedCompany);
    }

    @Override
    public List<Project> getCompanyProjects(String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        return projectRepository.findAll().stream()
                .filter(project -> project.getCompany().getId().equals(companyId))
                .toList();
    }


   
    @Override
    @Transactional
    public CompanyResponse approveCompany(String id, String labAdminId) {
        logger.info("Approving company with ID: {} by lab admin: {}", id, labAdminId);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setStatus(Company.Status.APPROVED);
        Company updatedCompany = companyRepository.save(company);
        logger.info("Company approved successfully");
        return CompanyResponse.fromCompany(updatedCompany);
    }

    @Override
    @Transactional
    public CompanyResponse rejectCompany(String id, String reason, String labAdminId) {
        logger.info("Rejecting company with ID: {} by lab admin: {} for reason: {}", id, labAdminId, reason);
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        company.setStatus(Company.Status.REJECTED);
        company.setRejectionReason(reason);
        Company updatedCompany = companyRepository.save(company);
        logger.info("Company rejected successfully");
        return CompanyResponse.fromCompany(updatedCompany);
    }

}
