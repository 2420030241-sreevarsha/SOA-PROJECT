AI-Powered Mutual Fund Portfolio Analysis & Investment Tracking System
1. Project Overview
The AI-Powered Mutual Fund Portfolio Analysis & Investment Tracking System is a microservices-based application that helps users manage and analyze their mutual fund investments.
The system allows users to track investments, monitor NAV, calculate profit/loss and returns, analyze portfolio risk, compare mutual funds, and identify performance gaps.
Note: The current project does not use Machine Learning. The term "AI-Powered" can be replaced with "Smart" if required.
2. Objectives
Track mutual fund investments and transactions. Monitor NAV and portfolio value. Calculate returns and profit/loss. Analyze portfolio risk and diversification. Compare different mutual funds. Identify underperforming funds. Provide a centralized portfolio dashboard. Demonstrate Microservices and SOA architecture.
3. System Architecture
copy


               +----------------+
               |    Frontend    |
               |     React      |
               +-------+--------+
                       |
                       v
               +---------------+
               |  API Gateway  |
               +-------+-------+
                       |
    +------------------+------------------+
    |          |          |       |       |
    v          v          v       v       v
 User       Fund      Portfolio Analysis Comparison
Service    Service     Service   Service   Service
    |          |          |       |       |
    +----------+----------+-------+-------+
                       |
                       v
                 +-----------+
                 |   MySQL   |
                 +-----------+
                       |
                       v
               Notification
                 Service

4. Microservices
User Service Registration and login User profile management Investor preferences Mutual Fund Service Fund search and details NAV information Fund categories Historical NAV Portfolio Service Add/update/delete investments Buy/sell transactions Track units and invested amount Calculate current portfolio value Analysis Service Return calculation Profit/loss calculation Risk analysis Diversification analysis Performance gap identification Comparison Service Compare fund returns Compare NAV Compare risk Compare expense ratios Compare historical performance Notification Service NAV alerts Performance alerts Risk alerts Portfolio notifications API Gateway Single entry point for frontend requests Routes requests to appropriate services Handles centralized API access
5. Dataset and Database
https://www.kaggle.com/datasets/tharunreddy2911/mutual-fund-data
The system uses an Indian mutual fund dataset containing:
Scheme name Scheme code Fund category Fund type NAV NAV date AMC AUM Expense ratio Historical NAV
MySQL is used to store users, mutual funds, investments, transactions, and NAV history.
6. Key Features
Portfolio Tracking Invested Amount ↓ Current Value ↓ Profit/Loss ↓ Return % Risk Analysis
The portfolio can be classified as:
LOW MEDIUM HIGH
based on factors such as volatility, diversification, and concentration.
Performance Gap Benchmark Return : 12% Portfolio Return : 8% Performance Gap : -4%
A negative gap can generate an underperformance alert.
7. Technology Stack
Backend
Java Spring Boot Spring Data JPA Hibernate REST APIs Maven
Frontend
React.js HTML CSS JavaScript
Database
MySQL
Tools
IntelliJ IDEA / VS Code Postman Git GitHub
8. Project Workflow
User Login ↓ View Mutual Funds ↓ Select Fund ↓ Add Investment ↓ Portfolio Service ↓ Calculate Value, Return and Profit/Loss ↓ Analyze Risk and Diversification ↓ Compare with Benchmark ↓ Display Results on Dashboard
9. Advantages
Modular architecture Independent services Easy maintenance Independent scalability Fault isolation Centralized portfolio management Easy integration with external financial APIs Supports future cloud deployment
10. Future Enhancements and Conclusion
Future Enhancements Live NAV API integration Automated SIP tracking Email/SMS notifications JWT authentication Advanced portfolio charts Docker and Kubernetes deployment Kafka/RabbitMQ integration Cloud deployment Machine Learning-based financial analysis
