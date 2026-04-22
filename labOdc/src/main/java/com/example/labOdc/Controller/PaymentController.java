package com.example.labOdc.Controller;

import com.example.labOdc.APi.ApiResponse;
import com.example.labOdc.DTO.PaymentDTO;
import com.example.labOdc.DTO.Response.PaymentResponse;
import com.example.labOdc.Model.Payment;
import com.example.labOdc.Model.PaymentStatus;
import com.example.labOdc.Repository.PaymentRepository;
import com.example.labOdc.Service.CompanyService;
import com.example.labOdc.Service.PaymentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/payments")
@CrossOrigin("*")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final CompanyService companyService;

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'COMPANY')")
    public ApiResponse<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentDTO dto,
            BindingResult result) {

        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .collect(Collectors.toList());
            return ApiResponse.error(errorMessages);
        }

        Payment payment = paymentService.createPayment(dto);

        return ApiResponse.success(
                PaymentResponse.fromEntity(payment),
                "Payment recorded successfully",
                HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN')")
    public ApiResponse<PaymentResponse> updatePaymentStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String transactionId,
            @RequestParam(required = false) LocalDate paymentDate,
            @RequestParam(required = false) String notes) {

        Payment payment = paymentService.updatePaymentStatus(
                id,
                PaymentStatus.valueOf(status.toUpperCase()),
                transactionId);

        return ApiResponse.success(
                PaymentResponse.fromEntity(payment),
                "Payment status updated successfully",
                HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'COMPANY')")
    @Transactional(readOnly = true)
    public ApiResponse<PaymentResponse> getById(@PathVariable String id) {
        Payment payment = paymentService.getPaymentById(id);
        return ApiResponse.success(PaymentResponse.fromEntity(payment), "Payment retrieved successfully",
                HttpStatus.OK);
    }

    // Simulate payment success (Company click "Pay")
    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'COMPANY')")
    @Transactional
    public ApiResponse<PaymentResponse> confirmPayment(@PathVariable String id, Authentication authentication) {
        Payment payment = paymentService.getPaymentById(id);

        boolean isCompanyUser = authentication != null
                && authentication.getAuthorities() != null
                && authentication.getAuthorities().stream().anyMatch(a -> {
                    String auth = a.getAuthority();
                    return "ROLE_COMPANY".equals(auth) || "COMPANY".equals(auth);
                });

        // COMPANY can only confirm its own payments
        if (isCompanyUser) {
            var myCompany = companyService.getMyCompany();
            if (payment.getCompany() == null
                    || myCompany == null
                    || myCompany.getId() == null
                    || !Objects.equals(payment.getCompany().getId(), myCompany.getId())) {
                throw new AccessDeniedException("Payment does not belong to company");
            }
        }

        Payment updated = paymentService.confirmPayment(id);
        return ApiResponse.success(
                PaymentResponse.fromEntity(updated),
                "Payment confirmed successfully",
                HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'COMPANY')")
    @Transactional(readOnly = true)
    public ApiResponse<List<PaymentResponse>> getByProject(@PathVariable String projectId) {
        List<PaymentResponse> list = paymentService.getPaymentsByProject(projectId).stream()
                .map(PaymentResponse::fromEntity).toList();
        return ApiResponse.success(list, "Payments by project retrieved successfully", HttpStatus.OK);
    }

    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'COMPANY')")
    @Transactional(readOnly = true)
    public ApiResponse<List<PaymentResponse>> getByCompany(@PathVariable String companyId) {
        List<PaymentResponse> list = paymentService.getPaymentsByCompany(companyId).stream()
                .map(PaymentResponse::fromEntity).toList();
        return ApiResponse.success(list, "Payments by company retrieved successfully", HttpStatus.OK);
    }

    // Lấy URL ảnh QR để frontend hiển thị
    @GetMapping("/{id}/qr")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'LAB_ADMIN', 'COMPANY')")
    @Transactional(readOnly = true)
    public ApiResponse<String> getQrUrl(@PathVariable String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getNotes() == null || !payment.getNotes().contains("/qr/")) {
            return ApiResponse.error("Chưa tạo QR cho thanh toán này");
        }

        String qrPath = payment.getNotes().split("QR generated: ")[1].trim();
        String fullUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path(qrPath).toUriString();

        return ApiResponse.success(fullUrl, "URL ảnh QR code");
    }

    // Fake webhook/callback từ PayOS
    @PostMapping("/payos/callback-fake")
    public ApiResponse<String> fakePayOSCallback(@RequestBody Map<String, Object> payload) {
        String transactionId = (String) payload.getOrDefault("transactionId", "");
        String status = (String) payload.getOrDefault("status", "PAID");

        if (transactionId.isEmpty()) {
            return ApiResponse.error("Thiếu transactionId trong payload");
        }

        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán"));

        if ("PAID".equalsIgnoreCase(status)) {
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaymentDate(LocalDate.now());
        } else if ("CANCELLED".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
            payment.setStatus(PaymentStatus.FAILED);
        }

        paymentRepository.save(payment);

        return ApiResponse.success("Callback processed", "Trạng thái thanh toán đã được cập nhật");
    }
}