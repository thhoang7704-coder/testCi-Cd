package com.example.labOdc.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.User;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.RoleRepository;
import com.example.labOdc.Repository.UserRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class ApplicationConfig {

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Bean
        ApplicationRunner applicationRunner(UserRepository userRepository,
                        RoleRepository roleRepository, org.springframework.context.ApplicationContext context) {
                return args -> {

                        // ================================
                        // 1. Seed role USER nếu chưa tồn tại
                        // ================================
                        RoleEntity userRole = roleRepository.findByRole(UserRole.USER)
                                        .orElseGet(() -> {
                                                log.info("Creating default USER role...");
                                                return roleRepository.save(RoleEntity.builder()
                                                                .role(UserRole.USER)
                                                                .build());
                                        });

                        // ================================
                        // 2. Seed role SYSTEM_ADMIN nếu chưa tồn tại
                        // ================================
                        RoleEntity systemAdminRole = roleRepository.findByRole(UserRole.SYSTEM_ADMIN)
                                        .orElseGet(() -> {
                                                log.info("Creating SYSTEM_ADMIN role as it doesn't exist...");
                                                return roleRepository.save(RoleEntity.builder()
                                                                .role(UserRole.SYSTEM_ADMIN)
                                                                .build());
                                        });

                        RoleEntity companyRole = roleRepository.findByRole(UserRole.COMPANY)
                                        .orElseGet(() -> roleRepository
                                                        .save(RoleEntity.builder().role(UserRole.COMPANY).build()));
                        RoleEntity mentorRole = roleRepository.findByRole(UserRole.MENTOR)
                                        .orElseGet(() -> roleRepository
                                                        .save(RoleEntity.builder().role(UserRole.MENTOR).build()));
                        RoleEntity talentRole = roleRepository.findByRole(UserRole.TALENT)
                                        .orElseGet(() -> roleRepository
                                                        .save(RoleEntity.builder().role(UserRole.TALENT).build()));
                        RoleEntity labAdminRole = roleRepository.findByRole(UserRole.LAB_ADMIN)
                                        .orElseGet(() -> roleRepository
                                                        .save(RoleEntity.builder().role(UserRole.LAB_ADMIN).build()));

                        // ================================
                        // 4. Seed Users
                        // ================================

                        // ================================
                        // 4. Seed Users with FIXED IDs (matching Postman)
                        // ================================

                        // ADMIN
                        if (userRepository.findByUsername("admin").isEmpty()) {
                                User adminUser = User.builder()
                                                .id("1") // Fixed ID
                                                .username("admin")
                                                .email("admin@gmail.com")
                                                .password(passwordEncoder.encode("admin"))
                                                .isActive(true)
                                                .emailVerified(true)
                                                .build();
                                adminUser.getRoles().add(systemAdminRole);
                                adminUser.getRoles().add(labAdminRole);
                                userRepository.save(adminUser);

                                // Seed Lab Admin Profile
                                com.example.labOdc.Repository.LabAdminRepository labAdminRepo = context
                                                .getBean(com.example.labOdc.Repository.LabAdminRepository.class);
                                if (labAdminRepo.findById("dddddddd-dddd-dddd-dddd-dddddddddddd").isEmpty()) {
                                        labAdminRepo.save(com.example.labOdc.Model.LabAdmin.builder()
                                                        .id("dddddddd-dddd-dddd-dddd-dddddddddddd")
                                                        .user(adminUser)
                                                        .department("Phòng Đào Tạo")
                                                        .position("Quản lý Lab")
                                                        .build());
                                }
                                log.info("Seeded user 'admin' (Fixed ID) with password '123456'");
                        }

                        // COMPANY
                        if (userRepository.findByUsername("company1").isEmpty()) {
                                User companyUser = User.builder()
                                                .id("11111111-1111-1111-1111-111111111111")
                                                .username("company1")
                                                .email("company1@test.com")
                                                .password(passwordEncoder.encode("123456"))
                                                .isActive(true)
                                                .emailVerified(true)
                                                .build();
                                companyUser.getRoles().add(companyRole);
                                userRepository.save(companyUser);

                                // Seed Company Profile
                                com.example.labOdc.Repository.CompanyRepository companyRepo = context
                                                .getBean(com.example.labOdc.Repository.CompanyRepository.class);
                                if (companyRepo.findById("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa").isEmpty()) {
                                        companyRepo.save(com.example.labOdc.Model.Company.builder()
                                                        .id("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
                                                        .user(companyUser)
                                                        .companyName("Công Ty ABC")
                                                        .taxCode("TAX001")
                                                        .companySize(com.example.labOdc.Model.Company.Size.ONE_TO_10) // Fixed
                                                                                                                      // enum
                                                                                                                      // reference
                                                        .status(com.example.labOdc.Model.Company.Status.APPROVED)
                                                        .build());
                                }
                                log.info("Seeded user 'company1' (Fixed ID) with password '123456'");
                        }

                        // MENTOR
                        if (userRepository.findByUsername("mentor1").isEmpty()) {
                                User mentorUser = User.builder()
                                                .id("22222222-2222-2222-2222-222222222222")
                                                .username("mentor1")
                                                .email("mentor1@test.com")
                                                .password(passwordEncoder.encode("123456"))
                                                .isActive(true)
                                                .emailVerified(true)
                                                .build();
                                mentorUser.getRoles().add(mentorRole);
                                userRepository.save(mentorUser);

                                // Seed Mentor Profile
                                com.example.labOdc.Repository.MentorRepository mentorRepo = context
                                                .getBean(com.example.labOdc.Repository.MentorRepository.class);
                                if (mentorRepo.findById("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb").isEmpty()) {
                                        mentorRepo.save(com.example.labOdc.Model.Mentor.builder()
                                                        .id("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb")
                                                        .user(mentorUser)
                                                        .expertise("Java Backend")
                                                        .status(com.example.labOdc.Model.Mentor.Status.AVAILABLE)
                                                        .build());
                                }
                                log.info("Seeded user 'mentor1' (Fixed ID) with password '123456'");
                        }

                        // TALENT
                        if (userRepository.findByUsername("talent1").isEmpty()) {
                                User talentUser = User.builder()
                                                .id("33333333-3333-3333-3333-333333333333")
                                                .username("talent1")
                                                .email("talent1@test.com")
                                                .password(passwordEncoder.encode("123456"))
                                                .isActive(true)
                                                .emailVerified(true)
                                                .build();
                                talentUser.getRoles().add(talentRole);
                                userRepository.save(talentUser);

                                // Seed Talent Profile
                                com.example.labOdc.Repository.TalentRepository talentRepo = context
                                                .getBean(com.example.labOdc.Repository.TalentRepository.class);
                                if (talentRepo.findById("cccccccc-cccc-cccc-cccc-cccccccccccc").isEmpty()) {
                                        talentRepo.save(com.example.labOdc.Model.Talent.builder()
                                                        .id("cccccccc-cccc-cccc-cccc-cccccccccccc")
                                                        .user(talentUser)
                                                        .studentCode("SV2024001")
                                                        .status(com.example.labOdc.Model.Talent.Status.AVAILABLE)
                                                        .build());
                                }
                                log.info("Seeded user 'talent1' (Fixed ID) with password '123456'");
                        }
                };
        }
}
