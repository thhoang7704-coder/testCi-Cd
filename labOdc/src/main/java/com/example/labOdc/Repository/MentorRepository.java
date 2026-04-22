package com.example.labOdc.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.labOdc.Model.Mentor;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, String> {
    List<Mentor> findByStatus(Mentor.Status status);

    List<Mentor> findByRatingGreaterThanEqual(java.math.BigDecimal rating);

    boolean existsByUserId(String userId);

    Optional<Mentor> findByUserId(String userId);
}
