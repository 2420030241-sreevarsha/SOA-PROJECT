# AI-Powered Mutual Fund Portfolio Analysis and Investment Tracking System
## College Academic Project based on Service-Oriented Architecture (SOA)

This backend is built entirely in **Java 17+** using the **Spring Boot** framework, implementing clean Service-Oriented Architecture (SOA) with 7 distinct logical services.

---

### SOA Services Architecture

```
                       React Frontend / Web Client
                                  │
                                  ▼
                     Spring Boot REST API Gateway
                                  │
    ┌──────────────┬──────────────┼──────────────┬──────────────┬──────────────┬──────────────┐
    ▼              ▼              ▼              ▼              ▼              ▼              ▼
1. User        2. Mutual      3. Portfolio   4. Transaction 5. Analysis    6. AI Insight  7. Notification
   Service        Fund Service   Service        Service        Service        Service        Service
   (Auth/BCrypt)  (Catalog/NAV)  (Holdings/P&L) (Buy/Sell/SIP) (Risk/Sharpe)  (Gemini API)   (Alerts/SIP)
    │              │              │              │              │              │              │
    └──────────────┴──────────────┴───────┬──────┴──────────────┴──────────────┴──────────────┘
                                          ▼
                             Spring Data JPA / H2 Database
```

---

### How to Run in Java (Maven)

#### Prerequisites:
- Java JDK 17 or higher (`java -version`)
- Apache Maven 3.8+ (`mvn -version`)

#### Steps to Execute:

1. Open terminal in the `backend-java` folder:
   ```bash
   cd backend-java
   ```

2. (Optional) Set your Gemini API Key in your terminal:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   ```

3. Build and run the Spring Boot project:
   ```bash
   mvn clean spring-boot:run
   ```

4. The server will start on:
   ```
   http://localhost:8080
   ```

5. Access the interactive H2 Database Console:
   ```
   URL: http://localhost:8080/h2-console
   JDBC URL: jdbc:h2:mem:funddb
   User: sa
   Password: (leave blank)
   ```

---

### REST API Endpoints

| Method | Endpoint | Description | Service |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/users/login` | User login with SHA-256 hashed passwords | User Service |
| `POST` | `/api/users/register` | Register new student or portfolio account | User Service |
| `GET` | `/api/funds` | Search, filter, and sort mutual funds | Mutual Fund Service |
| `GET` | `/api/funds/{id}` | Detailed fund metrics and historical NAV | Mutual Fund Service |
| `POST` | `/api/funds/compare` | Compare 2–4 mutual funds side-by-side | Mutual Fund Service |
| `GET` | `/api/portfolio` | Get active user holdings and metrics | Portfolio Service |
| `GET` | `/api/portfolio/summary`| Total invested, current value, P&L, returns % | Portfolio Service |
| `GET` | `/api/transactions` | Full buy/sell/SIP transaction history | Transaction Service |
| `POST` | `/api/transactions` | Execute Buy or Sell order ($Units = Amount / NAV$) | Transaction Service |
| `GET` | `/api/sip` | Retrieve active SIP schedules and accumulated units | Transaction Service |
| `POST` | `/api/sip` | Register new monthly SIP | Transaction Service |
| `GET` | `/api/analysis/risk` | Volatility, Sharpe ratio, Max drawdown, Risk score | Analysis Service |
| `GET` | `/api/analysis/diversification`| Category, fund house, and equity/debt distribution | Analysis Service |
| `GET` | `/api/analysis/ranking`| Weighted multi-factor mutual fund rankings | Analysis Service |
| `POST` | `/api/ai/insights` | Factual AI portfolio summary & observations | AI Insight Service |
| `POST` | `/api/ai/chat` | Conversational MF Portfolio Assistant | AI Insight Service |
| `POST` | `/api/dataset/upload` | Upload Kaggle mutual fund CSV with column mapping | Dataset Service |
| `GET` | `/api/notifications` | Concentration warnings, SIP reminders | Notification Service |
