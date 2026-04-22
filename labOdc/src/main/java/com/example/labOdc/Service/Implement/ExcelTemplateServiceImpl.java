package com.example.labOdc.Service.Implement;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelTemplate;
import com.example.labOdc.Repository.ExcelTemplateRepository;
import com.example.labOdc.Service.ExcelTemplateService;

@Service
public class ExcelTemplateServiceImpl implements ExcelTemplateService {
    private final ExcelTemplateRepository repository;

    public ExcelTemplateServiceImpl(ExcelTemplateRepository repository) {
        this.repository = repository;
    }

    @Override
    public ExcelTemplate createTemplate(ExcelTemplate template, String adminId) {
        template.setCreatedBy(adminId);
        template.setIsActive(true);
        template.setDownloadCount(0);
        return repository.save(template);
    }

    @Override
    public List<ExcelTemplate> getActiveTemplates() {
        return repository.findByIsActiveTrue();
    }

    @Override
    public List<ExcelTemplate> getTemplatesByType(TemplateType type) {
        return repository.findByTemplateTypeAndIsActiveTrue(type);
    }

    @Override
    public ExcelTemplate disableTemplate(String templateId) {
        ExcelTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setIsActive(false);
        return repository.save(template);
    }

    @Override
    public void increaseDownloadCount(String templateId) {
        ExcelTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        template.setDownloadCount(template.getDownloadCount() + 1);
        repository.save(template);
    }

    @Override
    public ExcelTemplate downloadTemplate(String templateId) {
        ExcelTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        if (!template.getIsActive()) {
            throw new RuntimeException("Template is inactive");
        }

        template.setDownloadCount(template.getDownloadCount() + 1);
        repository.save(template);

        return template; // controller sẽ lấy fileUrl để redirect/download
    }

}
