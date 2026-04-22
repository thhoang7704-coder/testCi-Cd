package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.CompanyRiskRecordDTO;
import com.example.labOdc.DTO.Response.CompanyRiskRecordResponse;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.CompanyRepository;
import com.example.labOdc.Repository.CompanyRiskRecordRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Repository.UserRepository;
import com.example.labOdc.Service.CompanyRiskRecordService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyRiskRecordServiceImpl implements CompanyRiskRecordService {

    private final CompanyRiskRecordRepository companyRiskRecordRepository;
    private final CompanyRepository companyRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Override
    public CompanyRiskRecordResponse createRiskRecord(CompanyRiskRecordDTO dto) {

        Company company = null;
        if (dto.getCompanyId() != null) {
            company = companyRepository.findById(dto.getCompanyId())
                    .orElseThrow(() -> new EntityNotFoundException("Company not found"));
        }

        Project project = null;
        if (dto.getProjectId() != null) {
            project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new EntityNotFoundException("Project not found"));
        }

        User recordedBy = null;
        if (dto.getRecordedById() != null) {
            recordedBy = userRepository.findById(dto.getRecordedById())
                    .orElseThrow(() -> new EntityNotFoundException("User not found"));
        }

        CompanyRiskRecord record = CompanyRiskRecord.builder()
                .company(company)
                .project(project)
                .riskType(dto.getRiskType())
                .severity(dto.getSeverity())
                .description(dto.getDescription())
                .recordedBy(recordedBy)
                .build();

        CompanyRiskRecord saved = companyRiskRecordRepository.save(record);

        return CompanyRiskRecordResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyRiskRecordResponse getById(String id) {
        CompanyRiskRecord record = companyRiskRecordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Risk record not found"));
        return CompanyRiskRecordResponse.fromEntity(record);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRiskRecordResponse> getByCompanyId(String companyId) {
        return companyRiskRecordRepository.findByCompanyId(companyId)
                .stream()
                .map(CompanyRiskRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRiskRecordResponse> getByProjectId(String projectId) {
        return companyRiskRecordRepository.findByProjectId(projectId)
                .stream()
                .map(CompanyRiskRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRiskRecordResponse> getHighRiskCompanies() {
        return companyRiskRecordRepository.findBySeverity(RiskSeverity.HIGH)
                .stream()
                .map(CompanyRiskRecordResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasCriticalRisk(String companyId) {
        return companyRiskRecordRepository
                .existsByCompanyIdAndSeverity(companyId, RiskSeverity.CRITICAL);
    }

    @Override
    public void validateCompanyIsNotBlocked(String companyId) {
        if (hasCriticalRisk(companyId)) {
            throw new RuntimeException("Company is blocked due to CRITICAL risk");
        }
    }
}