package com.academic.portfolio.repository;

import com.academic.portfolio.model.MutualFund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MutualFundRepository extends JpaRepository<MutualFund, String> {

    List<MutualFund> findByCategoryIgnoreCase(String category);

    List<MutualFund> findByFundHouseIgnoreCase(String fundHouse);

    @Query("SELECT DISTINCT f.category FROM MutualFund f WHERE f.category IS NOT NULL ORDER BY f.category")
    List<String> findDistinctCategories();

    @Query("SELECT DISTINCT f.fundHouse FROM MutualFund f WHERE f.fundHouse IS NOT NULL ORDER BY f.fundHouse")
    List<String> findDistinctFundHouses();
}
