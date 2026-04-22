package com.example.labOdc.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.PermissionEntity;

@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, String> {
    Optional<PermissionEntity> findByCode(String code);

    boolean existsByCode(String code);
}
