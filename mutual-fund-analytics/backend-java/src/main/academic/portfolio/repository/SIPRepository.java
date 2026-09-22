package com.academic.portfolio.repository;

import com.academic.portfolio.model.SIPRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SIPRepository extends JpaRepository<SIPRecord, String> {
    List<SIPRecord> findByUserId(String userId);
    List<SIPRecord> findByUserIdAndActiveTrue(String userId);
}
