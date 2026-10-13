# Leave Management & Approval System

A full-stack, enterprise-grade **Employee Leave Management & Approval System** crafted with **Java 17 + Spring Boot 3.x**, a secondary **Node.js + Express audit microservice**, **MySQL 8.0**, and a modern, high-contrast, responsive **Frontend (HTML5, Vanilla ES6 JavaScript, Bootstrap 5.3)**.

---

## 1. Project Directory Structure

The project is cleanly structured into dedicated folders for frontend, backend, database, and documentation:

```
Leave_Management_System/
├── frontend/                     # All client-side web application code
│   ├── assets/
│   │   └── lottie/              # Branding logo, illustrations & animations
│   ├── css/
│   │   └── style.css            # Custom CSS styling (curvy radius, design tokens)
│   ├── js/                      # Frontend JavaScript modules & controllers
│   ├── *.html                   # UI page templates
│   ├── package.json             # Frontend server package descriptor
│   └── server.js                # Zero-dependency static server (port 3000)
│
├── backend/                      # All server-side backend code
│   ├── spring-boot/             # Primary REST API (Java + Spring Boot 3.x)
│   │   ├── src/                 # Controllers, Services, Repositories, DTOs, Models
│   │   ├── pom.xml              # Maven project configuration
│   │   ├── mvnw                 # Maven wrapper (Linux/macOS)
│   │   └── mvnw.cmd             # Maven wrapper (Windows)
│   │
│   └── audit-service/           # Secondary Audit Microservice (Node.js + Express)
│       ├── server.js            # Express server (port 5000)
│       ├── package.json         # Node.js dependencies
│       └── audit_logs.json      # Resilient local JSON audit trail
│
├── database/                     # Database initializers & DDL/DML scripts
│   ├── schema.sql               # MySQL table definitions
│   └── data.sql                 # Initial seed accounts & sample records
│
├── docs/                         # Project guides, interview resources & API docs
│   ├── Leave_Management_System_Interview_Guide.html
│   ├── Leave_Management_System_Interview_Guide.pdf
│   └── postman_collection.json
│
├── scripts/                      # Automated automation & monitoring scripts
│   ├── start-all.ps1            # Automated one-shot launcher for all services
│   └── check-services.ps1       # Comprehensive port & API health checker
│
├── screenshots/                 # Application UI screenshots & demonstrations
├── start-all.bat                # Windows 1-click startup batch script
├── check-services.bat           # Windows 1-click health check batch script
├── package.json                 # Root npm project runner scripts
├── schema.sql                   # Root copy for convenience
├── data.sql                     # Root copy for convenience
├── index.html                   # Gateway redirect to frontend
└── README.md                    # Project documentation & setup manual
```

---

## 2. Default User Credentials

Both accounts are pre-seeded in the database with secure BCrypt hashes. Credentials are kept confidential and are **not displayed on the UI screens**:

| Role | Email | Password | Allowed Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `adminajay@gmail.com` | `ajay 1234` *(or `ajay1234`)* | Access Admin Console, view all team leave requests, approve leaves, and reject leaves with customized reply reasons. |
| **Employee** | `ajaydeveloper@gmail.com` | `ajay1234` | Access Employee Portal, check leave balance, submit new leave requests, and view admin decisions & rejection replies. |

*Alternative demo accounts pre-seeded:*
- Admin: `admin@company.com` / `admin123`
- Employee: `john@company.com` / `emp123`

---

## 3. Technology Stack

- **Primary Backend**: Java 17, Spring Boot 3.x, Spring Data JPA, Hibernate, Spring Validation, BCrypt password hashing, Tomcat HTTP server (Port `8080`).
- **Secondary Microservice**: Node.js, Express, MongoDB client with automatic local JSON fallback (Port `5000`).
- **Relational Database**: MySQL 8.0 (Port `3306`), schema: `leave_management`.
- **Frontend**: HTML5, Vanilla ES6 JavaScript, Bootstrap 5.3, Bootstrap Icons, Lottie Animations, Node static server (Port `3000`).
- **Design System**: Curvy corner philosophy (`--radius-lg: 24px`, `--radius-pill: 9999px`), high-contrast Midnight & Royal Violet palette (`#20123A`, `#693BCC`, `#CB1F9C`, `#F35F1C`).

---

## 4. Quick Setup & Run Instructions

### ⚡ Option A: One-Click Instant Startup (Windows)
Simply run the included root launcher:
```cmd
start-all.bat
```
*(Or via PowerShell: `powershell -ExecutionPolicy Bypass -File .\scripts\start-all.ps1` or `npm start`)*
This script automatically:
1. Verifies that MySQL 8.0 is running on port 3306.
2. Starts the Node.js Audit microservice on port 5000.
3. Launches the Spring Boot backend on port 8080.
4. Serves the Frontend on port 3000 and opens `http://localhost:3000` in your default browser.
5. Runs a comprehensive health check.

To verify system health anytime:
```cmd
check-services.bat
```
*(Or `npm run check`)*

---

### 🛠 Option B: Manual Step-by-Step Startup

### Step 1: Database Setup (MySQL)
1. Ensure MySQL Server 8.0 is running on port `3306`.
2. Create the database and seed the data:

```bash
# Using MySQL Command Line or MySQL Workbench:
mysql -u root -p < database/schema.sql
mysql -u root -p < database/data.sql
```

*(Database connection credentials are configured in `backend/spring-boot/src/main/resources/application.properties` with username `root` and password `root`)*

---

### Step 2: Start Secondary Node.js Audit Microservice
Open a terminal and start the audit service:

```bash
cd backend/audit-service
npm install
node server.js
```

- **Port**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/health`
- **Audit Logs**: `http://localhost:5000/logs`

---

### Step 3: Start Spring Boot Primary Backend
Open a second terminal and start the Spring Boot application:

```bash
cd backend/spring-boot

# On Windows:
.\mvnw.cmd spring-boot:run

# On Linux / macOS:
./mvnw spring-boot:run
```

- **Port**: `http://localhost:8080`
- **Base API**: `http://localhost:8080/api`

---

### Step 4: Start Frontend Web Server
Open a third terminal and serve the frontend:

```bash
cd frontend
npm start
# OR: node server.js
```

- **Frontend Portal**: [http://localhost:3000](http://localhost:3000) (auto-redirects to Employee Login)
- **Admin Login Direct Link**: [http://localhost:3000/admin-login.html](http://localhost:3000/admin-login.html)
- **Employee Login Direct Link**: [http://localhost:3000/employee-login.html](http://localhost:3000/employee-login.html)

---

## 5. Key Features

### 1. Clean & Authentic Authentication
- Both Employee and Administrator login cards feature custom illustrated hero headers (`employee.png` and `admin.png`) with curvy card frames.
- **Default username and password badges are hidden from the UI screen** to provide a production-ready user interface.

### 2. Admin Rejection with Reply Reason
- When an Administrator rejects a pending leave request, the confirmation dialog provides a dedicated **Rejection Reason / Reply to Employee** text field.
- The reason is validated, persisted into the MySQL database (`rejection_reason` column), and recorded in the audit microservice log.
- The Employee's dashboard, leave history, and details screen display the **Admin Rejection Reply** banner immediately, explaining why the leave was not approved.

### 3. Business Rule Enforcement
- **Date Constraints**: End date cannot precede start date. Dates in the past cannot be submitted.
- **Overlap Conflict Prevention**: Employees cannot submit duplicate or overlapping leave dates (returns `409 Conflict`).
- **Immutable Decisions**: Requests once Approved or Rejected cannot be transitioned again.

### 4. Audit Trail & Microservice Communication
- Every leave lifecycle transition (`LEAVE_APPLIED`, `LEAVE_APPROVED`, `LEAVE_REJECTED`) sends a non-blocking asynchronous event payload from Spring Boot to the Node.js audit microservice.

---

## 6. REST API Reference

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticates user credentials and creates session cookie |
| `POST` | `/api/auth/logout` | Public | Clears active user session |
| `GET` | `/api/auth/me` | Logged In | Returns currently authenticated user details |
| `POST` | `/api/leaves` | Employee | Submits a new leave request |
| `GET` | `/api/leaves/my` | Employee | Returns all leaves submitted by the current employee |
| `GET` | `/api/leaves` | Admin | Retrieves all employee leave requests with optional filter |
| `GET` | `/api/leaves/{id}` | Admin | Retrieves details for a specific leave application |
| `PUT` | `/api/leaves/{id}/approve` | Admin | Approves a pending leave request |
| `PUT` | `/api/leaves/{id}/reject` | Admin | Rejects a pending leave request with optional `{ "reason": "..." }` body |
| `GET` | `http://localhost:5000/logs` | Any | Returns audit log history from the audit microservice |

---

## 7. Verification & Testing

To test the application end-to-end:
1. Open [http://localhost:3000/employee-login.html](http://localhost:3000/employee-login.html) in your browser.
2. Sign in with Employee credentials: `ajaydeveloper@gmail.com` / `ajay1234`.
3. Click **Apply for Leave**, select **Casual Leave**, choose future dates, and submit.
4. Open [http://localhost:3000/admin-login.html](http://localhost:3000/admin-login.html) in a private/incognito window.
5. Sign in with Admin credentials: `adminajay@gmail.com` / `ajay 1234`.
6. On the pending request row, click **Reject**.
7. Enter a rejection reason (e.g., *"Cannot approve due to release milestone"*), then confirm.
8. Switch back to the Employee window, refresh or view **Leave History** — the rejection reason reply is clearly visible!
