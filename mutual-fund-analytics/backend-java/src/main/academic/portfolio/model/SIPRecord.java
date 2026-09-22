package com.academic.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SIPRecord {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String fundId;

    @Column(nullable = false)
    private String fundName;

    @Column(nullable = false)
    private Double amount;

    private String frequency; // Monthly, Quarterly

    private String startDate;

    private Integer dayOfMonth;

    private Boolean active;

    private Double totalInvested;

    private Double unitsAccumulated;
}
