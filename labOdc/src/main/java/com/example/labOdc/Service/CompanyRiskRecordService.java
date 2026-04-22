package com.example.labOdc.Service;

import com.example.labOdc.DTO.CompanyRiskRecordDTO;
import com.example.labOdc.DTO.Response.CompanyRiskRecordResponse;

import java.util.List;

public interface CompanyRiskRecordService {

    //Tạo mới bản ghi rủi ro cho Company / Project
    CompanyRiskRecordResponse createRiskRecord(CompanyRiskRecordDTO dto);

    //Lấy Risk Record theo ID
    CompanyRiskRecordResponse getById(String id);

    //Lấy danh sách Risk Record theo Company
    List<CompanyRiskRecordResponse> getByCompanyId(String companyId);

    //Lấy danh sách Risk Record theo Project
    List<CompanyRiskRecordResponse> getByProjectId(String projectId);

    //Lấy danh sách Company có mức rủi ro HIGH / CRITICAL
    List<CompanyRiskRecordResponse> getHighRiskCompanies();

    // Kiểm tra Company có rủi ro CRITICAL không
    boolean hasCriticalRisk(String companyId);

    // Validate Company không bị block do rủi ro CRITICAL
    void validateCompanyIsNotBlocked(String companyId);
}