package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.Service.LabAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final LabAdminService labAdminService;

    @GetMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ApiResponse<List<String>> getAuditLogs(@RequestParam(required = false) String filter) {
        List<String> logs = labAdminService.getAuditLogs(filter);
        return ApiResponse.success(logs, "OK", HttpStatus.OK);
    }
}