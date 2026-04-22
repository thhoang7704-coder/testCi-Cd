package com.example.labOdc.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.labOdc.Model.RoleEntity;
import com.example.labOdc.Model.UserRole;

public interface RoleRepository extends JpaRepository<RoleEntity, String> {
    Optional<RoleEntity> findByRole(UserRole role);
}
