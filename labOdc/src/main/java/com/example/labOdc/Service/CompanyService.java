package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.DTO.CompanyDTO;
import com.example.labOdc.DTO.Response.CompanyResponse;

public interface CompanyService {
    CompanyResponse createCompany(CompanyDTO companyDTO);

    List<CompanyResponse> getAllCompanies();

    void deleteCompany(String id);

    CompanyResponse getCompanyById(String id);

    CompanyResponse updateCompany(CompanyDTO companyDTO, String id);

    // Các chức năng mới cho company
    CompanyResponse approveCompany(String id, String labAdminId); // Phê duyệt hồ sơ công ty

    CompanyResponse rejectCompany(String id, String reason, String labAdminId); // Từ chối hồ sơ công ty với lý do

    /**
     * Lấy thông tin company của user đang đăng nhập (role COMPANY).
     */
    CompanyResponse getMyCompany();

    

    /**
     * Suspend công ty với lý do.
     * @param companyId ID công ty
     * @param reason Lý do suspend
     * @return CompanyResponse
     */
    CompanyResponse suspendCompany(String companyId, String reason);

    // Các method sau cần repository method mới, chưa triển khai do nguyên tắc không động đến repository
    /**
     * Lấy danh sách dự án của công ty.
     * @param companyId ID công ty
     * @return List<Project>
     */
    List<com.example.labOdc.Model.Project> getCompanyProjects(String companyId);

}
