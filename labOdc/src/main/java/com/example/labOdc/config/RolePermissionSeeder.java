package com.example.labOdc.config;

import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.labOdc.Enum.Permission;
import com.example.labOdc.Model.PermissionEntity;
import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.UserRole;
import com.example.labOdc.Repository.PermissionRepository;
import com.example.labOdc.Repository.RoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class RolePermissionSeeder {
    private final PermissionRepository permissionRepo;
    private final RoleRepository roleRepo;

    @Bean
    ApplicationRunner seedRolesPermissions() {
        return args -> {

            /*
             * ==================================================
             * 1. SEED ALL PERMISSIONS
             * ==================================================
             */
            for (Permission p : Permission.values()) {
                permissionRepo.findByCode(p.name())
                        .orElseGet(() -> permissionRepo.save(
                                PermissionEntity.builder()
                                        .code(p.name()) // PK
                                        .groupName(p.name().split("_")[0]) // SYSTEM / LAB / ...
                                        .description(p.name()) // tạm
                                        .build()));
            }

            log.info("✅ Permissions seeded");

            /*
             * ==================================================
             * 2. ROLE → PERMISSION MAPPING
             * ==================================================
             */
            Map<UserRole, Set<Permission>> rolePermissionMap = Map.of(
                    UserRole.SYSTEM_ADMIN, Set.of(Permission.values()),
                    UserRole.USER, Set.of(),
                    UserRole.LAB_ADMIN, filter("LAB_"),
                    UserRole.COMPANY, filter("COMPANY_"),
                    UserRole.MENTOR, filter("MENTOR_"),
                    UserRole.TALENT, filter("TALENT_", "LEADER_"));

            /*
             * ==================================================
             * 3. SEED ROLES + ROLE_PERMISSIONS
             * ==================================================
             */
            for (var entry : rolePermissionMap.entrySet()) {

                UserRole role = entry.getKey();
                Set<Permission> permissions = entry.getValue();

                // Create or get role
                RoleEntity roleEntity = roleRepo.findByRole(role)
                        .orElseGet(() -> roleRepo.save(
                                RoleEntity.builder()
                                        .role(role)
                                        .build()));

                // Convert Permission enum → PermissionEntity
                Set<PermissionEntity> permissionEntities = permissions.stream()
                        .map(p -> permissionRepo.findByCode(p.name()).orElseThrow())
                        .collect(Collectors.toSet());

                // Assign permissions to role
                roleEntity.setPermissions(permissionEntities);
                roleRepo.save(roleEntity);

                log.info("✅ Seeded role {} with {} permissions",
                        role, permissionEntities.size());
            }
        };
    }

    /*
     * ==================================================
     * HELPER: filter permission by prefix
     * ==================================================
     */
    private static Set<Permission> filter(String... prefixes) {
        return Arrays.stream(Permission.values())
                .filter(p -> Arrays.stream(prefixes)
                        .anyMatch(prefix -> p.name().startsWith(prefix)))
                .collect(Collectors.toSet());
    }

}
