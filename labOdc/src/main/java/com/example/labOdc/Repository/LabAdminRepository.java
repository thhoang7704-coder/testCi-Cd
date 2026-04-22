package com.example.labOdc.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.LabAdmin;

@Repository
public interface LabAdminRepository extends JpaRepository<LabAdmin, String> {

	Optional<LabAdmin> findByUser_Id(String userId);
}
