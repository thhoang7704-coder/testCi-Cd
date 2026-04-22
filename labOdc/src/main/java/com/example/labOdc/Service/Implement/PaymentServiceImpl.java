package com.example.labOdc.Service.Implement;

import com.example.labOdc.DTO.PaymentDTO;
import com.example.labOdc.Model.*;
import com.example.labOdc.Repository.CompanyRepository;
import com.example.labOdc.Repository.PaymentRepository;
import com.example.labOdc.Repository.ProjectRepository;
import com.example.labOdc.Service.PaymentService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final ProjectRepository projectRepository;
    private final CompanyRepository companyRepository;

    /* =====================================
     * CREATE
     * ===================================== */

    @Override
    public Payment createPayment(PaymentDTO dto) {

        Project project = dto.getProjectId() != null
                ? projectRepository.findById(dto.getProjectId())
                        .orElseThrow(() -> new RuntimeException("Project not found"))
                : null;

        Company company = dto.getCompanyId() != null
                ? companyRepository.findById(dto.getCompanyId())
                        .orElseThrow(() -> new RuntimeException("Company not found"))
                : null;

        // If companyId is not provided, infer company from the project (project.company is required)
        if (company == null && project != null) {
            company = project.getCompany();
        }

        if (company == null) {
            throw new IllegalArgumentException("companyId is required");
        }

        // Mã giao dịch nội bộ 
        String transactionId = "ORD-" + UUID.randomUUID();

        Payment payment = Payment.builder()
                .project(project)
                .company(company)
                .amount(dto.getAmount())
                .paymentType(
                        dto.getPaymentType() != null
                                ? dto.getPaymentType()
                                : PaymentType.INITIAL
                )
                .status(PaymentStatus.PENDING)
                .transactionId(transactionId)
                .dueDate(dto.getDueDate())
                .notes(dto.getNotes())
                .build();

        Payment saved = paymentRepository.save(payment);

        // Demo PayOS
        if (Boolean.TRUE.equals(dto.getUsePayOS())) {

            String checkoutLink =
                    "https://demo.payos.vn/checkout/"
                            + saved.getId()
                            + "?amount="
                            + saved.getAmount();

            String qrFileName = "payos-qr-" + saved.getId() + ".png";

            generateQrCodeImage(checkoutLink, qrFileName);

            saved.setNotes("QR generated: /qr/" + qrFileName);

            saved = paymentRepository.save(saved);
        }

        return saved;
    }

    @Override
    public Payment createAdvancePayment(
            String projectId,
            String companyId,
            PaymentType paymentType,
            String note
    ) {

        Project project = projectId != null
                ? projectRepository.findById(projectId).orElse(null)
                : null;

        Company company = companyId != null
                ? companyRepository.findById(companyId).orElse(null)
                : null;

        Payment payment = Payment.builder()
            .project(project)
            .company(company)
            .amount(BigDecimal.ZERO)
            .paymentType(
                paymentType != null
                    ? paymentType
                    : PaymentType.ADVANCE
            )
            .status(PaymentStatus.COMPLETED)
            .paymentDate(LocalDate.now())
            .notes(note)
            .build();

        return paymentRepository.save(payment);
    }

    /* =====================================
     * STATUS FLOW
     * ===================================== */

    @Override
    public Payment updatePaymentStatus(
            String paymentId,
            PaymentStatus status,
            String transactionId
    ) {

        Payment payment = getPaymentById(paymentId);

        if (status != null) {
            payment.setStatus(status);
        }

        if (transactionId != null) {
            payment.setTransactionId(transactionId);
        }

        return paymentRepository.save(payment);
    }

    @Override
    public Payment confirmPayment(String paymentId) {

        Payment payment = getPaymentById(paymentId);

        // Idempotent confirm: if already completed, treat as success
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            return payment;
        }

        if (payment.getStatus() != PaymentStatus.PENDING
                && payment.getStatus() != PaymentStatus.PROCESSING) {
            throw new IllegalStateException("Payment is not eligible for confirmation");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentDate(LocalDate.now());

        return paymentRepository.save(payment);
    }

    @Override
    public void cancelPayment(String paymentId, String reason) {

        Payment payment = getPaymentById(paymentId);

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Completed payment cannot be cancelled");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setNotes(reason);

        paymentRepository.save(payment);
    }

    /* =====================================
     * QUERY
     * ===================================== */

    @Override
    @Transactional(readOnly = true)
    public Payment getPaymentById(String paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByProject(String projectId) {
        return paymentRepository.findByProjectId(projectId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByCompany(String companyId) {
        return paymentRepository.findByCompanyId(companyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByStatus(PaymentStatus status) {
        return paymentRepository.findByStatus(status);
    }

    @Override
    public boolean isProjectFullyPaid(String projectId) {

        if (projectId == null) {
            return false;
        }

        BigDecimal totalPaid = getTotalPaidAmountByProject(projectId);
        return totalPaid.compareTo(BigDecimal.ZERO) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getOverduePayments(LocalDate currentDate) {

        LocalDate finalDate = currentDate != null
                ? currentDate
                : LocalDate.now();

        return paymentRepository.findAll().stream()
                .filter(p -> p.getDueDate() != null)
                .filter(p -> p.getDueDate().isBefore(finalDate))
                .filter(p ->
                        p.getStatus() == PaymentStatus.PENDING
                                || p.getStatus() == PaymentStatus.PROCESSING
                )
                .toList();
    }

    /* =====================================
     * BUSINESS CHECK
     * ===================================== */

    @Override
    public BigDecimal getTotalPaidAmountByProject(String projectId) {
        return paymentRepository.findByProjectId(projectId).stream()
                .filter(p -> p.getStatus() == PaymentStatus.COMPLETED)
                .map(Payment::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public void validatePaymentOwnership(String paymentId, String companyId) {

        Payment payment = getPaymentById(paymentId);

        if (payment.getCompany() == null
                || !payment.getCompany().getId().equals(companyId)) {
            throw new SecurityException("Payment does not belong to company");
        }
    }

    /* =====================================
     * UTIL
     * ===================================== */

    private void generateQrCodeImage(String content, String fileName) {

        try {
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(
                    content,
                    BarcodeFormat.QR_CODE,
                    350,
                    350
            );

            // Always persist QR into source folder (portable across machines/drives)
            Path sourceQrDir = resolveSourceQrDir();
            Files.createDirectories(sourceQrDir);
            MatrixToImageWriter.writeToPath(matrix, "PNG", sourceQrDir.resolve(fileName));

            // Also mirror to runtime static folder when running from IDE (so /qr/... serves immediately)
            Path runtimeQrDir = resolveRuntimeStaticQrDir();
            if (runtimeQrDir != null) {
                Files.createDirectories(runtimeQrDir);
                MatrixToImageWriter.writeToPath(matrix, "PNG", runtimeQrDir.resolve(fileName));
            }

        } catch (WriterException | IOException e) {
            throw new RuntimeException("Cannot generate QR code", e);
        }
    }

    private Path resolveSourceQrDir() {
        Path projectRoot = findProjectRoot();
        return projectRoot
                .resolve("src")
                .resolve("main")
                .resolve("resources")
                .resolve("static")
                .resolve("qr");
    }

    private Path resolveRuntimeStaticQrDir() {
        URL staticUrl = PaymentServiceImpl.class.getClassLoader().getResource("static");
        if (staticUrl == null) {
            return null;
        }

        try {
            URI uri = staticUrl.toURI();
            if (!"file".equalsIgnoreCase(uri.getScheme())) {
                // e.g. running from a packaged jar; can't reliably write into classpath
                return null;
            }

            return Paths.get(uri).resolve("qr");
        } catch (URISyntaxException e) {
            return null;
        }
    }

    private Path findProjectRoot() {
        // Strategy: walk upwards from current working directory until we find pom.xml
        // and src/main/resources. This makes it portable across different machines/drives.
        Path start = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path found = findUpwards(start);
        if (found != null) {
            return found;
        }

        // Fallback: also try from the compiled classes location (often .../target/classes)
        try {
            Path codeSource = Paths.get(
                    PaymentServiceImpl.class
                            .getProtectionDomain()
                            .getCodeSource()
                            .getLocation()
                            .toURI()
            ).toAbsolutePath().normalize();

            found = findUpwards(codeSource);
            if (found != null) {
                return found;
            }
        } catch (Exception ignored) {
            // best-effort fallback
        }

        // Last resort: use working directory (may still be correct in many setups)
        return start;
    }

    private Path findUpwards(Path start) {
        Path current = start;
        for (int i = 0; i < 12 && current != null; i++) {
            if (Files.exists(current.resolve("pom.xml"))
                    && Files.exists(current.resolve("src/main/resources"))) {
                return current;
            }

            current = current.getParent();
        }

        return null;
    }
}