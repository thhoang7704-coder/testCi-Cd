package com.example.labOdc.Controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelTemplate;
import com.example.labOdc.Service.ExcelTemplateService;

import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/excel-templates")
@RequiredArgsConstructor
@PermitAll
@CrossOrigin("*")
public class ExcelTemplateController {
    private final ExcelTemplateService excelTemplateService;

    // 1. Create template (Admin upload)
    @PostMapping
    public ExcelTemplate createTemplate(
            @RequestBody ExcelTemplate template,
            @RequestParam String adminId) {

        return excelTemplateService.createTemplate(template, adminId);
    }

    // 2. Get all active templates
    @GetMapping("/active")
    public List<ExcelTemplate> getActiveTemplates() {
        return excelTemplateService.getActiveTemplates();
    }

    // 3. Get templates by type
    @GetMapping("/type/{type}")
    public List<ExcelTemplate> getTemplatesByType(@PathVariable TemplateType type) {
        return excelTemplateService.getTemplatesByType(type);
    }

    // 4. Disable template
    @PutMapping("/{id}/disable")
    public ExcelTemplate disableTemplate(@PathVariable String id) {
        return excelTemplateService.disableTemplate(id);
    }

    // 5. Increase download count
    @PutMapping("/{id}/download")
    public void increaseDownloadCount(@PathVariable String id) {
        excelTemplateService.increaseDownloadCount(id);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Void> downloadTemplate(@PathVariable String id) {
        ExcelTemplate template = excelTemplateService.downloadTemplate(id);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(template.getFileUrl()))
                .build();
    }

}
