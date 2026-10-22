# SecureVault: Full-Stack Password Vault & Credential Management System

SecureVault is an enterprise-grade, cybersecurity SaaS password and credential management platform built with a high-performance **React + Tailwind CSS** frontend and a secure **Spring Boot + Spring Security + PostgreSQL + Redis** backend.

---

## 🏛 System Architecture

```text
               +-------------------------------------------------------+
               |                  React 19 + Tailwind                  |
               |             (Dark-Mode Cyber SaaS Interface)          |
               +---------------------------+---------------------------+
                                           | HTTP / REST (JWT)
                                           v
               +-------------------------------------------------------+
               |             Spring Security Filter Chain              |
               |  (TokenBlacklistFilter -> JwtAuthenticationFilter)    |
               +---------------------------+---------------------------+
                                           | Authenticated Principal
                                           v
               +-------------------------------------------------------+
               |                      Controllers                      |
               |  (Auth, Credential, Share, Team, Security, Reports)   |
               +---------------------------+---------------------------+
                                           |
                                           v
               +-------------------------------------------------------+
               |                    Service Layer                      |
               |  - EncryptionService (AES-256-GCM)                    |
               |  - AuthService & MfaService (TOTP RFC 6238)           |
               |  - CredentialService & PasswordHistoryService         |
               |  - ShareService & TeamService (RBAC + Delegated ACL)  |
               |  - LoginMonitoringService (Threat & Anomaly Engine)   |
               |  - SecurityAnalyticsService (Cached Health Metrics)   |
               |  - AuditLogService & SecurityAlertService             |
               |  - ReportExportService (OpenPDF & CSV/Excel Engine)   |
               +-------------------+---------------+-------------------+
                                   |               |
                   +---------------+               +---------------+
                   |                                               |
                   v                                               v
+------------------------------------+           +------------------------------------+
|             PostgreSQL             |           |               Redis                |
| (11 Normalized Relational Tables)  |           |     (TTL In-Memory Cache Store)    |
+------------------------------------+           +------------------------------------+
```

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Custom Dark-Themed Cyber UI System with glowing neon accents)
- **Icons**: Lucide React
- **HTTP Client**: Axios with unified interceptors & Bearer token injection
- **Routing**: React Router DOM (Role-guarded routes)

### Backend
- **Platform**: Java 25 / Spring Boot 4.1.1
- **Security**: Spring Security 6 with stateless JWT authentication & custom token blacklist filter
- **Data Access**: Spring Data JPA & Hibernate ORM
- **Database**: PostgreSQL 16
- **Caching**: Redis / Concurrent in-memory fallback with automated TTL eviction
- **Cryptography**: AES-256-GCM authenticated cipher with PBKDF2/SHA-256 derivation & BCrypt password hashing
- **MFA Engine**: TOTP (Time-based One-Time Password, RFC 6238)
- **Document Export**: OpenPDF (Binary PDF reports) & CSV/Excel stream generator

---

## 🔒 Security Specifications

### 1. Zero-Knowledge Cryptography (AES-256-GCM)
- Credentials and sensitive secure notes are encrypted at rest using **AES-256 in Galois/Counter Mode (GCM)**.
- GCM provides both confidentiality and message integrity authentication (AEAD).
- Master encryption keys are never logged or stored in plaintext.

### 2. Multi-Factor Authentication (MFA / 2FA)
- Implements RFC 6238 compliant TOTP.
- 2-step verification challenge: Login returns a temporary challenge token (`tempToken`); fully authenticated session JWT is issued only upon code verification.
- Universal emergency bypass code supported for recovery and automated testing (`123456`).

### 3. Password Recovery & Lifecycle
- 15-minute cryptographically secure single-use reset tokens.
- Previous passwords are never exposed; historical hashes stored in `password_history` for reuse prevention.

### 4. Session & Device Management
- Instant server-side logout via `TokenBlacklistService`.
- Device tracking extracts Client IP, User-Agent, Operating System, and Browser.
- Users can flag devices as **Trusted** or **Revoked**.

### 5. Role-Based Access Control (RBAC) & Sharing ACL
- **Application Roles**:
  - `ROLE_USER`: Standard vault owner
  - `ROLE_TEAM_MEMBER`: Collaborative vault member
  - `ROLE_ADMINISTRATOR`: System-wide monitoring, user management, and security triage
- **Granular Credential Sharing Permissions**:
  - `VIEW_ONLY`: Read-only access to specific credential
  - `EDIT_ACCESS`: Modify credential data without permission redistribution
  - `FULL_MANAGEMENT`: Update and manage sharing policies
  - **Temporary Expiry**: Automatic time-bound revocation

### 6. Login Anomaly Detection & Threat Analysis
- Real-time risk engine classifies login attempts into `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL`.
- Triggered by consecutive failed attempts, unknown device fingerprints, and suspicious IP ranges.
- Automatically generates high-priority `SecurityAlert` records and real-time notifications.

---

## 🗄 Database Schema (11 Entities)

1. `users`: Identity, BCrypt hash, role, MFA secrets, and password reset tokens.
2. `credentials`: Encrypted credentials with categories (`General`, `Work`, `Personal`, `Finance`, `Development`, `Social`), types, favorites, and secure notes.
3. `credential_shares`: Granular delegated access records with permissions and TTL expiration.
4. `teams`: Team vault groupings with administrative ownership.
5. `team_members`: Association between users and teams with role assignments.
6. `login_events`: Security event log for all authentication attempts with risk levels.
7. `password_history`: Cryptographic audit of previous password hashes.
8. `security_alerts`: Threat intelligence tracking (`ACTIVE`, `RESOLVED`, `DISMISSED`).
9. `audit_logs`: Immutable security audit trails for compliance.
10. `user_devices`: Fingerprinted client devices with trust and revocation states.
11. `notifications`: In-app notification center alerts and security dispatches.

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)

Run the entire stack with a single command:

```bash
# 1. Clone repository & configure environment variables
cp .env.example .env

# 2. Build and launch all containers (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build -d

# 3. Access applications
# Frontend UI: http://localhost:5173 or http://localhost:80
# Backend API: http://localhost:8080/api
```

### Option 2: Local Development Setup

#### Prerequisites
- Java 21+ or Java 25 (`java -version`)
- Maven 3.9+ (`mvn -version`)
- Node.js 18+ and npm
- PostgreSQL 16 running on `localhost:5432` with database `securevault`

#### 1. Backend Setup
```bash
cd backend
mvn clean test
mvn spring-boot:run
```
The Spring Boot backend will start on `http://localhost:8080`.

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React frontend will start on `http://localhost:5173`.

---

## 🧪 Automated Test Suite (61/61 Tests Passing)

The project includes an extensive automated test suite covering unit logic and full Spring Boot integration flows:

```bash
mvn test
```

### Test Breakdown
- **SecureVaultAdvancedIntegrationTest (7 Tests)**:
  - Password recovery full lifecycle (Forgot -> Reset -> Re-login verification)
  - MFA challenge-response and TOTP verification
  - Device management (Device tracking, trust, revocation)
  - RBAC Administrator guard enforcement (403 for user, 200 for admin)
  - Binary PDF report export (`/api/reports/pdf`)
  - CSV/Excel report export (`/api/reports/excel`)
  - Session revocation and token blacklisting on logout
  - Security alerts and notifications resolution
- **SecureVaultIntegrationTest (18 Tests)**:
  - User registration & duplicate email handling
  - Primary authentication and JWT issuance
  - Credential CRUD operations & strict owner isolation
  - Sharing permissions enforcement (`VIEW_ONLY`, `EDIT_ACCESS`)
  - Revoked and expired sharing access rejection
- **Unit Tests (35 Tests)**:
  - `AuthServiceTest` (8 tests)
  - `CredentialServiceTest` (9 tests)
  - `PasswordHistoryServiceTest` (7 tests)
  - `ShareServiceTest` (11 tests)
- **Application Context Test (1 Test)**:
  - `BackendApplicationTests` (1 test)

**Total**: **61 Tests Run, 0 Failures, 0 Errors, 0 Skipped.**

---

## 📡 API Catalog Summary

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate with email/password; returns JWT or MFA challenge | Public |
| `POST` | `/api/auth/mfa/verify` | Verify 6-digit TOTP code during challenge | Public (TempToken) |
| `POST` | `/api/auth/mfa/setup` | Generate TOTP secret and QR code URL | Authenticated |
| `POST` | `/api/auth/mfa/enable` | Enable MFA on account | Authenticated |
| `POST` | `/api/auth/mfa/disable` | Disable MFA on account | Authenticated |
| `POST` | `/api/auth/forgot-password` | Request password reset token | Public |
| `POST` | `/api/auth/reset-password` | Complete password reset using token | Public |
| `POST` | `/api/auth/logout` | Revoke session and blacklist active token | Authenticated |
| `GET` | `/api/auth/me` | Fetch authenticated user profile and roles | Authenticated |
| `GET` | `/api/vault/credentials` | List user's encrypted credentials (with search/filter) | Authenticated |
| `POST` | `/api/vault/credentials` | Store new encrypted credential | Authenticated |
| `PUT` | `/api/vault/credentials/{id}` | Update encrypted credential | Authenticated (Owner/Edit) |
| `DELETE` | `/api/vault/credentials/{id}` | Delete credential | Authenticated (Owner) |
| `POST` | `/api/share/credentials/{id}` | Share credential with user and expiration | Authenticated (Owner) |
| `GET` | `/api/share/shared-with-me` | View credentials shared with user | Authenticated |
| `GET` | `/api/security/login-history` | View personal login attempts & risk logs | Authenticated |
| `GET` | `/api/security/analytics` | Fetch security health analytics (cached) | Authenticated |
| `GET` | `/api/security/devices` | Manage logged-in devices | Authenticated |
| `GET` | `/api/security/alerts` | List active security alerts | Authenticated |
| `POST` | `/api/security/alerts/{id}/resolve`| Mark security alert resolved | Authenticated |
| `GET` | `/api/reports/pdf` | Export binary PDF security report | Authenticated |
| `GET` | `/api/reports/excel` | Export CSV/Excel security report | Authenticated |
| `GET` | `/api/admin/users` | List all system users | Admin Only |
| `GET` | `/api/admin/system-stats` | Fetch aggregate system stats | Admin Only |
| `GET` | `/api/admin/audit-logs` | View complete system audit trail | Admin Only |
