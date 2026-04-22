package com.example.labOdc.Service;

import java.util.List;

import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelTemplate;

public interface ExcelTemplateService {
    ExcelTemplate createTemplate(ExcelTemplate template, String adminId);

    List<ExcelTemplate> getActiveTemplates();

    List<ExcelTemplate> getTemplatesByType(TemplateType type);

    ExcelTemplate disableTemplate(String templateId);

    void increaseDownloadCount(String templateId);

    ExcelTemplate downloadTemplate(String templateId);
}
