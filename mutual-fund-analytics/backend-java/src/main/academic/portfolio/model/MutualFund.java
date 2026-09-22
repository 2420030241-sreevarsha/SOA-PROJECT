package com.academic.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "mutual_funds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MutualFund {

    @Id
    private String id;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(length = 500)
    private String schemeName;

    private String category;

    private String fundHouse;

    private Double nav;

    private String navDate;

    private Double expenseRatio;

    private Double aum; // In Crores

    private String risk; // Low, Moderate, High, Very High

    private Double returns1y;

    private Double returns3y;

    private Double returns5y;

    private Double equityAllocation;
    private Double debtAllocation;
    private Double cashAllocation;

    @OneToMany(mappedBy = "fund", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<NavHistoryPoint> historicalNav = new ArrayList<>();
}
