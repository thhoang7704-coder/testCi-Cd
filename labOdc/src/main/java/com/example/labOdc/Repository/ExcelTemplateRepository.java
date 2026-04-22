package com.example.labOdc.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.labOdc.Enum.TemplateType;
import com.example.labOdc.Model.ExcelTemplate;

public interface ExcelTemplateRepository extends JpaRepository<ExcelTemplate, String> {
    List<ExcelTemplate> findByIsActiveTrue();

    List<ExcelTemplate> findByTemplateTypeAndIsActiveTrue(TemplateType type);
}
