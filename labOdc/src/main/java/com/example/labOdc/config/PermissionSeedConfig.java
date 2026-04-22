package com.example.labOdc.config;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.labOdc.Enum.Permission;
import com.example.labOdc.Model.PermissionEntity;
import com.example.labOdc.Repository.PermissionRepository;

import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class PermissionSeedConfig {

    @Bean
    ApplicationRunner seedPermissions(PermissionRepository permissionRepository) {
        return args -> {

            for (Permission permission : Permission.values()) {

                if (!permissionRepository.existsByCode(permission.name())) {

                    PermissionEntity entity = PermissionEntity.builder()
                            .code(permission.name())
                            .description(permission.name().replace("_", " "))
                            .groupName(resolveGroup(permission))
                            .build();

                    permissionRepository.save(entity);
                    log.info("Seeded permission: {}", permission.name());
                }
            }
        };
    }

    private String resolveGroup(Permission permission) {
        if (permission.name().startsWith("SYSTEM_"))
            return "SYSTEM";
        if (permission.name().startsWith("LAB_"))
            return "LAB";
        if (permission.name().startsWith("COMPANY_"))
            return "COMPANY";
        if (permission.name().startsWith("MENTOR_"))
            return "MENTOR";
        if (permission.name().startsWith("TALENT_"))
            return "TALENT";
        if (permission.name().startsWith("LEADER_"))
            return "LEADER";
        return "OTHER";
    }
}
