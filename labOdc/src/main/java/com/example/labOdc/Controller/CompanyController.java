package com.example.labOdc.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.CompanyDTO;
import com.example.labOdc.DTO.Response.CompanyResponse;
import com.example.labOdc.Service.CompanyService;

import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@PermitAll
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/companies")
public class CompanyController {
    private final CompanyService companyService;

    /**
     * Chức năng: Tạo hồ sơ doanh nghiệp mới.
     * Service: CompanyService.createCompany() - Xử lý logic tạo và lưu entity.
     */
    @PostMapping("/")
    @PreAuthorize("hasAnyRole('USER', 'SYSTEM_ADMIN')")
    public ApiResponse<CompanyResponse> createCompany(@Valid @RequestBody CompanyDTO companyDTO, BindingResult result) {
        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage).toList();
            return ApiResponse.error(errorMessages);
        }
        CompanyResponse response = companyService.createCompany(companyDTO);
        return ApiResponse.success(response, "Created", HttpStatus.CREATED);
    }

    /**
     * Chức năng: Lấy danh sách tất cả hồ sơ doanh nghiệp.
     * Service: CompanyService.getAllCompanies() - Truy vấn và trả về list.
     */
    @GetMapping("/")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<List<CompanyResponse>> getAllCompanies() {
        List<CompanyResponse> list = companyService.getAllCompanies();
        return ApiResponse.success(list, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Lấy hồ sơ doanh nghiệp của user hiện tại.
     * Service: CompanyService.getMyCompany() - Truy vấn theo user từ SecurityContext.
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('COMPANY')")
    public ApiResponse<CompanyResponse> getMyCompany() {
        CompanyResponse response = companyService.getMyCompany();
        return ApiResponse.success(response, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Xóa hồ sơ doanh nghiệp theo ID.
     * Service: CompanyService.deleteCompany() - Xử lý xóa entity.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<?> deleteCompany(@PathVariable String id) {
        companyService.deleteCompany(id);
        return ResponseEntity.ok("Deleted");
    }

    /**
     * Chức năng: Lấy hồ sơ doanh nghiệp theo ID.
     * Service: CompanyService.getCompanyById() - Truy vấn entity theo ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<CompanyResponse> getCompanyById(@PathVariable String id) {
        CompanyResponse response = companyService.getCompanyById(id);
        return ApiResponse.success(response, "OK", HttpStatus.OK);
    }

    /**
     * Chức năng: Cập nhật hồ sơ doanh nghiệp theo ID.
     * Service: CompanyService.updateCompany() - Xử lý cập nhật entity.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'SYSTEM_ADMIN')")
    public ApiResponse<CompanyResponse> updateCompany(@Valid @RequestBody CompanyDTO companyDTO,
            @PathVariable String id) {
        CompanyResponse response = companyService.updateCompany(companyDTO, id);
        return ApiResponse.success(response, "Updated", HttpStatus.OK);
    }

    /**
     * Chức năng: Phê duyệt hồ sơ doanh nghiệp.
     * Service: CompanyService.approveCompany() - Cập nhật status thành APPROVED.
     */
    @PostMapping("/approve/{id}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<CompanyResponse> approveCompany(@PathVariable String id, @RequestParam String labAdminId) {
        CompanyResponse response = companyService.approveCompany(id, labAdminId);
        return ApiResponse.success(response, "Approved", HttpStatus.OK);
    }

    /**
     * Chức năng: Từ chối hồ sơ doanh nghiệp với lý do.
     * Service: CompanyService.rejectCompany() - Cập nhật status thành REJECTED.
     */
    @PostMapping("/reject/{id}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<CompanyResponse> rejectCompany(@PathVariable String id, @RequestParam String reason,
            @RequestParam String labAdminId) {
        CompanyResponse response = companyService.rejectCompany(id, reason, labAdminId);
        return ApiResponse.success(response, "Rejected", HttpStatus.OK);
    }

    /**
     * Chức năng: Suspend công ty với lý do.
     * Service: CompanyService.suspendCompany() - Cập nhật status thành SUSPENDED.
     */
    @PostMapping("/suspend/{id}")
    @PreAuthorize("hasAnyRole('LAB_ADMIN', 'SYSTEM_ADMIN')")
    public ApiResponse<CompanyResponse> suspendCompany(@PathVariable String id, @RequestParam String reason) {
        CompanyResponse response = companyService.suspendCompany(id, reason);
        return ApiResponse.success(response, "Suspended", HttpStatus.OK);
    }

}
