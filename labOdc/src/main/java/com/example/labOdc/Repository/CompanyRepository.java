package com.example.labOdc.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.Company;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, String> {
    boolean existsByTaxCode(String taxCode);

    Optional<Company> findByUserId(String userId);
}
