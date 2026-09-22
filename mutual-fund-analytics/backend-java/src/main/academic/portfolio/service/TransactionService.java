package com.academic.portfolio.service;

import com.academic.portfolio.model.MutualFund;
import com.academic.portfolio.model.SIPRecord;
import com.academic.portfolio.model.Transaction;
import com.academic.portfolio.repository.MutualFundRepository;
import com.academic.portfolio.repository.SIPRepository;
import com.academic.portfolio.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

/**
 * SOA Service 4: Transaction Service
 * Responsibilities: Buy, Sell, SIP transactions, Unit calculation (Units = Amount / NAV), Transaction Ledger
 */
@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final MutualFundRepository mutualFundRepository;
    private final SIPRepository sipRepository;

    public TransactionService(TransactionRepository transactionRepository,
                              MutualFundRepository mutualFundRepository,
                              SIPRepository sipRepository) {
        this.transactionRepository = transactionRepository;
        this.mutualFundRepository = mutualFundRepository;
        this.sipRepository = sipRepository;
    }

    public List<Transaction> getUserTransactions(String userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId);
    }

    public Transaction addTransaction(String userId, String fundId, String type, Double amount, Double customNav, String notes, String date) {
        MutualFund fund = mutualFundRepository.findById(fundId)
                .orElseThrow(() -> new IllegalArgumentException("Mutual Fund not found with ID: " + fundId));

        double nav = (customNav != null && customNav > 0) ? customNav : (fund.getNav() != null ? fund.getNav() : 0.0);
        if (nav <= 0) {
            throw new IllegalArgumentException("A valid current NAV is required to execute this transaction.");
        }
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Transaction amount must be strictly greater than zero.");
        }

        // Formula: Units = Investment Amount / NAV
        double units = Math.round((amount / nav) * 10000.0) / 10000.0;

        if ("SELL".equalsIgnoreCase(type)) {
            // Validate user holdings
            List<Transaction> userTxs = transactionRepository.findByUserIdAndFundId(userId, fundId);
            double totalUnitsHeld = 0;
            for (Transaction tx : userTxs) {
                if ("BUY".equalsIgnoreCase(tx.getType()) || "SIP".equalsIgnoreCase(tx.getType())) {
                    totalUnitsHeld += tx.getUnits();
                } else if ("SELL".equalsIgnoreCase(tx.getType())) {
                    totalUnitsHeld -= tx.getUnits();
                }
            }
            if (totalUnitsHeld < units) {
                throw new IllegalArgumentException("Insufficient units held to execute sale. Available units: " + Math.round(totalUnitsHeld * 10000.0) / 10000.0);
            }
        }

        Transaction tx = Transaction.builder()
                .id("tx-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4))
                .userId(userId)
                .fundId(fund.getId())
                .fundName(fund.getName())
                .type(type.toUpperCase())
                .date(date != null && !date.isBlank() ? date : LocalDate.now().toString())
                .amount(amount)
                .nav(nav)
                .units(units)
                .notes(notes)
                .build();

        return transactionRepository.save(tx);
    }

    public Transaction updateTransaction(String id, String userId, Double amount, Double customNav, String notes, String date) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found."));

        if (!tx.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to modify this transaction.");
        }

        if (amount != null && amount > 0) {
            tx.setAmount(amount);
        }
        if (customNav != null && customNav > 0) {
            tx.setNav(customNav);
        }
        tx.setUnits(Math.round((tx.getAmount() / tx.getNav()) * 10000.0) / 10000.0);
        if (notes != null) tx.setNotes(notes);
        if (date != null && !date.isBlank()) tx.setDate(date);

        return transactionRepository.save(tx);
    }

    public void deleteTransaction(String id, String userId) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found."));
        if (!tx.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized access to delete this transaction.");
        }
        transactionRepository.delete(tx);
    }

    // SIP Support
    public List<SIPRecord> getUserSIPs(String userId) {
        return sipRepository.findByUserId(userId);
    }

    public SIPRecord registerSIP(String userId, String fundId, Double amount, Integer dayOfMonth) {
        MutualFund fund = mutualFundRepository.findById(fundId)
                .orElseThrow(() -> new IllegalArgumentException("Mutual Fund not found with ID: " + fundId));

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("SIP amount must be greater than zero.");
        }

        double nav = fund.getNav() != null ? fund.getNav() : 100.0;
        double units = Math.round((amount / nav) * 10000.0) / 10000.0;

        SIPRecord sip = SIPRecord.builder()
                .id("sip-" + System.currentTimeMillis())
                .userId(userId)
                .fundId(fund.getId())
                .fundName(fund.getName())
                .amount(amount)
                .frequency("Monthly")
                .startDate(LocalDate.now().toString())
                .dayOfMonth(dayOfMonth != null ? dayOfMonth : 5)
                .active(true)
                .totalInvested(amount)
                .unitsAccumulated(units)
                .build();

        // Create initial installment transaction
        addTransaction(userId, fundId, "SIP", amount, nav, "First installment of monthly SIP", LocalDate.now().toString());

        return sipRepository.save(sip);
    }

    public SIPRecord toggleSIP(String sipId, String userId) {
        SIPRecord sip = sipRepository.findById(sipId)
                .orElseThrow(() -> new IllegalArgumentException("SIP not found."));
        if (!sip.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized.");
        }
        sip.setActive(!Boolean.TRUE.equals(sip.getActive()));
        return sipRepository.save(sip);
    }

    public void deleteSIP(String sipId, String userId) {
        SIPRecord sip = sipRepository.findById(sipId)
                .orElseThrow(() -> new IllegalArgumentException("SIP not found."));
        if (!sip.getUserId().equals(userId)) {
            throw new SecurityException("Unauthorized.");
        }
        sipRepository.delete(sip);
    }
}
