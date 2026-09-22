package com.academic.portfolio.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Column(nullable = false)
    private String userId;

    private String type; // VALUE_CHANGE, VOLATILITY, CONCENTRATION, DATA_WARNING, SIP_REMINDER, SYSTEM

    private String title;

    @Column(length = 1000)
    private String message;

    private String createdAt;

    private Boolean read;
}
