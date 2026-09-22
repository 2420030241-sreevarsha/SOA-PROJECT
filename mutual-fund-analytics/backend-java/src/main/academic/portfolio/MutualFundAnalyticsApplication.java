package com.academic.portfolio;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * College Academic Project based on Service-Oriented Architecture (SOA)
 * Project: AI-Powered Mutual Fund Portfolio Analysis and Investment Tracking System
 */
@SpringBootApplication
public class MutualFundAnalyticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(MutualFundAnalyticsApplication.class, args);
        System.out.println("====================================================================");
        System.out.println("Mutual Fund Analytics SOA Backend is active on http://localhost:8080");
        System.out.println("H2 Console available at: http://localhost:8080/h2-console");
        System.out.println("====================================================================");
    }
}
