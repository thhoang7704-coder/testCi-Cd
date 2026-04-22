package com.example.labOdc.Service.Implement;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.labOdc.DTO.ImportResult;
import com.example.labOdc.Model.Mentor;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.MentorRepository;
import com.example.labOdc.Repository.RoleRepository;
import com.example.labOdc.Repository.UserRepository;

import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MentorExcelImportService {
    private final UserRepository userRepository;
    private final MentorRepository mentorRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    private String generateUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int count = 1;

        while (userRepository.findByUsername(username).isPresent()) {
            username = baseUsername + count;
            count++;
        }

        return username;
    }

    public ImportResult importMentor(MultipartFile file) throws Exception {

        ImportResult result = new ImportResult();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheet("MENTORS");

        int total = 0, success = 0, failed = 0;

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            total++;

            try {
                String email = getCellString(row, 0);
                String fullName = getCellString(row, 1);
                String phone = getCellString(row, 2);
                String expertise = getCellString(row, 3);
                Integer expYears = getCellInt(row, 4);

                // ===== VALIDATE =====
                if (email == null || email.isBlank()) {
                    throw new RuntimeException("Email is empty");
                }

                if (userRepository.existsByEmail(email)) {
                    throw new RuntimeException("Email already exists");
                }
                String username = generateUsername(email);
                // ===== CREATE USER =====
                RoleEntity mentorRole = roleRepository.findByRole(UserRole.MENTOR)
                        .orElseThrow(() -> new RuntimeException("Role MENTOR not found"));
                User user = User.builder()
                        .email(email)
                        .fullName(fullName)
                        .username(username)
                        .phone(phone)
                        .password(passwordEncoder.encode("123456"))
                        .roles(Set.of(mentorRole))
                        .isActive(true)
                        .build();

                userRepository.save(user);

                // ===== CREATE MENTOR =====
                Mentor mentor = Mentor.builder()
                        .user(user)
                        .expertise(expertise)
                        .yearsExperience(expYears)
                        .status(Mentor.Status.AVAILABLE)
                        .build();

                mentorRepository.save(mentor);

                success++;

            } catch (Exception e) {
                failed++;
                result.getErrors().add("Row " + (i + 1) + ": " + e.getMessage());
            }
        }

        result.setTotal(total);
        result.setSuccess(success);
        result.setFailed(failed);
        workbook.close();

        return result;
    }

    // ===== Helper =====
    private String getCellString(Row row, int index) {
        Cell cell = row.getCell(index);
        return cell == null ? null : cell.toString().trim();
    }

    private Integer getCellInt(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null)
            return null;
        return (int) cell.getNumericCellValue();
    }
}
