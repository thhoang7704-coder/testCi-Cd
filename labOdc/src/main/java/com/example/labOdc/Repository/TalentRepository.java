package com.example.labOdc.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.Talent;

@Repository
public interface TalentRepository extends JpaRepository<Talent, String> {
    boolean existsByStudentCode(String studentCode);

    List<Talent> findByMajor(String major);

    List<Talent> findByStatus(Talent.Status status);
    Optional<Talent> findByUserId(String userId);

}
