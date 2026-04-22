package com.example.labOdc.Controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.labOdc.DTO.ImportResult;
import com.example.labOdc.Service.Implement.MentorExcelImportService;
import com.example.labOdc.Service.Implement.TalentExcelImportService;

import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
@PermitAll
public class ExcelImportController {

    private final MentorExcelImportService mentorImportService;
    private final TalentExcelImportService talentImportService;

    @PostMapping(value = "/mentor", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResult> importMentorExcel(
            @RequestParam("file") MultipartFile file) throws Exception {

        return ResponseEntity.ok(mentorImportService.importMentor(file));
    }

    @PostMapping(value = "/talent", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImportResult> importTalentExcel(
            @RequestParam("file") MultipartFile file) throws Exception {

        return ResponseEntity.ok(talentImportService.importTalent(file));
    }
}
