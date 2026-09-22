package com.academic.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String fundId;

    @Column(nullable = false)
    private String fundName;

    @Column(nullable = false)
    private String type; // BUY, SELL, SIP

    @Column(nullable = false)
    private String date;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double nav;

    @Column(nullable = false)
    private Double units;

    private String notes;
}
