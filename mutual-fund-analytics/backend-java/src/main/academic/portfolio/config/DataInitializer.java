package com.academic.portfolio.config;

import com.academic.portfolio.model.*;
import com.academic.portfolio.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   MutualFundRepository mutualFundRepository,
                                   TransactionRepository transactionRepository,
                                   SIPRepository sipRepository,
                                   NotificationRepository notificationRepository) {
        return args -> {
            // Seed Default User
            if (userRepository.count() == 0) {
                User defaultUser = User.builder()
                        .id("usr-default")
                        .name("Ananya Sharma")
                        .email("ananya.sharma@example.edu")
                        .passwordHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                        .build();
                userRepository.save(defaultUser);
            }

            // Seed Mutual Funds
            if (mutualFundRepository.count() == 0) {
                List<MutualFund> funds = new ArrayList<>();

                MutualFund f1 = MutualFund.builder()
                        .id("fund-1")
                        .name("Mirae Asset Large Cap Fund - Direct Plan - Growth")
                        .schemeName("Mirae Asset Large Cap Fund")
                        .category("Large Cap")
                        .fundHouse("Mirae Asset Mutual Fund")
                        .nav(118.45)
                        .navDate("2026-03-15")
                        .expenseRatio(0.54)
                        .aum(38250.0)
                        .risk("Very High")
                        .returns1y(18.6)
                        .returns3y(15.2)
                        .returns5y(16.8)
                        .equityAllocation(97.2)
                        .debtAllocation(1.1)
                        .cashAllocation(1.7)
                        .build();

                MutualFund f2 = MutualFund.builder()
                        .id("fund-2")
                        .name("Parag Parikh Flexi Cap Fund - Direct Plan - Growth")
                        .schemeName("Parag Parikh Flexi Cap Fund")
                        .category("Flexi Cap")
                        .fundHouse("PPFAS Mutual Fund")
                        .nav(78.92)
                        .navDate("2026-03-15")
                        .expenseRatio(0.62)
                        .aum(65400.0)
                        .risk("Very High")
                        .returns1y(24.8)
                        .returns3y(20.4)
                        .returns5y(22.1)
                        .equityAllocation(84.5)
                        .debtAllocation(10.2)
                        .cashAllocation(5.3)
                        .build();

                MutualFund f3 = MutualFund.builder()
                        .id("fund-3")
                        .name("HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth")
                        .schemeName("HDFC Mid-Cap Opportunities Fund")
                        .category("Mid Cap")
                        .fundHouse("HDFC Mutual Fund")
                        .nav(172.60)
                        .navDate("2026-03-15")
                        .expenseRatio(0.81)
                        .aum(68900.0)
                        .risk("Very High")
                        .returns1y(31.2)
                        .returns3y(25.6)
                        .returns5y(23.4)
                        .equityAllocation(94.8)
                        .debtAllocation(0.5)
                        .cashAllocation(4.7)
                        .build();

                MutualFund f4 = MutualFund.builder()
                        .id("fund-4")
                        .name("Nippon India Small Cap Fund - Direct Plan - Growth")
                        .schemeName("Nippon India Small Cap Fund")
                        .category("Small Cap")
                        .fundHouse("Nippon India Mutual Fund")
                        .nav(164.15)
                        .navDate("2026-03-15")
                        .expenseRatio(0.73)
                        .aum(52400.0)
                        .risk("Very High")
                        .returns1y(34.5)
                        .returns3y(28.1)
                        .returns5y(27.8)
                        .equityAllocation(96.1)
                        .debtAllocation(0.2)
                        .cashAllocation(3.7)
                        .build();

                MutualFund f5 = MutualFund.builder()
                        .id("fund-5")
                        .name("SBI Balanced Advantage Fund - Direct Plan - Growth")
                        .schemeName("SBI Balanced Advantage Fund")
                        .category("Hybrid")
                        .fundHouse("SBI Mutual Fund")
                        .nav(14.85)
                        .navDate("2026-03-15")
                        .expenseRatio(0.69)
                        .aum(31200.0)
                        .risk("Moderate")
                        .returns1y(14.2)
                        .returns3y(12.8)
                        .returns5y(null) // Demonstrates "Data not available"
                        .equityAllocation(62.4)
                        .debtAllocation(28.6)
                        .cashAllocation(9.0)
                        .build();

                MutualFund f6 = MutualFund.builder()
                        .id("fund-6")
                        .name("ICICI Prudential Corporate Bond Fund - Direct Plan - Growth")
                        .schemeName("ICICI Prudential Corporate Bond Fund")
                        .category("Debt")
                        .fundHouse("ICICI Prudential Mutual Fund")
                        .nav(27.42)
                        .navDate("2026-03-15")
                        .expenseRatio(0.32)
                        .aum(24800.0)
                        .risk("Low")
                        .returns1y(7.8)
                        .returns3y(7.2)
                        .returns5y(7.5)
                        .equityAllocation(0.0)
                        .debtAllocation(96.5)
                        .cashAllocation(3.5)
                        .build();

                funds.add(f1);
                funds.add(f2);
                funds.add(f3);
                funds.add(f4);
                funds.add(f5);
                funds.add(f6);
                mutualFundRepository.saveAll(funds);
            }

            // Seed initial transactions
            if (transactionRepository.count() == 0) {
                transactionRepository.save(Transaction.builder()
                        .id("tx-1")
                        .userId("usr-default")
                        .fundId("fund-1")
                        .fundName("Mirae Asset Large Cap Fund - Direct Plan - Growth")
                        .type("BUY")
                        .date("2024-04-10")
                        .amount(40000.0)
                        .nav(97.50)
                        .units(410.256)
                        .notes("Initial lumpsum allocation")
                        .build());

                transactionRepository.save(Transaction.builder()
                        .id("tx-2")
                        .userId("usr-default")
                        .fundId("fund-2")
                        .fundName("Parag Parikh Flexi Cap Fund - Direct Plan - Growth")
                        .type("SIP")
                        .date("2024-05-05")
                        .amount(15000.0)
                        .nav(66.80)
                        .units(224.551)
                        .notes("Monthly SIP installment")
                        .build());

                transactionRepository.save(Transaction.builder()
                        .id("tx-3")
                        .userId("usr-default")
                        .fundId("fund-3")
                        .fundName("HDFC Mid-Cap Opportunities Fund - Direct Plan - Growth")
                        .type("BUY")
                        .date("2024-07-20")
                        .amount(30000.0)
                        .nav(151.20)
                        .units(198.413)
                        .notes("Mid-cap equity allocation")
                        .build());
            }

            // Seed active SIP
            if (sipRepository.count() == 0) {
                sipRepository.save(SIPRecord.builder()
                        .id("sip-1")
                        .userId("usr-default")
                        .fundId("fund-2")
                        .fundName("Parag Parikh Flexi Cap Fund - Direct Plan - Growth")
                        .amount(15000.0)
                        .frequency("Monthly")
                        .startDate("2024-05-05")
                        .dayOfMonth(5)
                        .active(true)
                        .totalInvested(30000.0)
                        .unitsAccumulated(444.17)
                        .build());
            }

            // Seed initial notifications
            if (notificationRepository.count() == 0) {
                notificationRepository.save(Notification.builder()
                        .id("notif-1")
                        .userId("usr-default")
                        .type("SYSTEM")
                        .title("SOA Architecture Initialized")
                        .message("All 7 Java Spring Boot microservices are running in Service-Oriented Architecture mode.")
                        .createdAt("2026-03-21T10:00:00")
                        .read(false)
                        .build());
            }
        };
    }
}
