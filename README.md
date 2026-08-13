# AI-Assisted Full-Stack Authentication Application

A secure full-stack authentication application developed with **Angular**, **Spring Boot**, **PostgreSQL**, **Spring Security**, **BCrypt**, and **JWT**. The project demonstrates both full-stack development and an AI-assisted engineering workflow using prompt engineering, context engineering, iterative testing, and code review.

## Features

- User registration with frontend and backend validation
- Unique, normalized email addresses
- BCrypt password hashing
- User login with generic credential-error handling
- Signed, expiring JWT access tokens
- Protected Angular dashboard
- Protected backend endpoint for the current user
- Angular route guard and HTTP interceptor
- Automatic handling of invalid or expired tokens
- Stateless logout
- Consistent API error responses
- Clean Git configuration for generated files and secrets

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Angular, TypeScript, Reactive Forms, Angular Router |
| Backend | Java, Spring Boot, Spring Web, Spring Security |
| Persistence | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| Authentication | JWT and BCrypt |
| Build tools | npm and Maven |
| API testing | Postman |
| AI assistance | GitHub Copilot / LLM-based coding assistant |
| Version control | Git and GitHub |

## Architecture

```text
User
  ↓
Angular Component
  ↓
Angular AuthService
  ↓ HTTP/JSON
Spring Security Filter Chain
  ↓
REST Controller
  ↓
Service
  ↓
Spring Data Repository
  ↓
PostgreSQL
```

For protected requests, the Angular interceptor attaches the JWT and the backend JWT filter validates it before allowing access to the controller.

## Project Structure

```text
ai-fsapplication/
├── .github/
│   └── copilot-instructions.md
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   ├── app.component.css
│   │   │   ├── app.config.ts
│   │   │   ├── signup.component.ts
│   │   │   ├── signup.component.html
│   │   │   ├── login.component.ts
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.css
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── environments/
│   │   ├── styles.css
│   │   └── main.ts
│   ├── angular.json
│   ├── package.json
│   └── package-lock.json
├── backend/
│   ├── src/main/java/com/example/auth/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── filter/
│   │   ├── repository/
│   │   ├── service/
│   │   ├── util/
│   │   └── AuthBackendApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── .gitignore
└── README.md
```

Generated directories such as `frontend/node_modules`, `frontend/dist`, `frontend/.angular`, and `backend/target` are intentionally ignored by Git.

## Frontend Responsibilities

### SignupComponent

- Manages the registration form with Angular Reactive Forms
- Validates name, email, password, and password confirmation
- Displays field-level and server-side errors
- Calls the registration API through `AuthService`
- Redirects to `/login` after successful registration

### LoginComponent

- Validates email and password
- Calls the login API through `AuthService`
- Stores the returned JWT under the `auth_token` key
- Redirects authenticated users to `/dashboard`
- Displays a generic message for invalid credentials

### DashboardComponent

- Represents the protected page
- Calls `GET /api/users/me` to obtain current user details
- Displays the authenticated user's name and email
- Provides the logout action

### AuthService

Centralizes frontend authentication operations:

- `signup()` — registers a user
- `login()` — authenticates a user and stores the JWT
- `me()` — retrieves the authenticated user
- `getToken()` — retrieves the stored access token
- `logout()` — removes authentication state

### Authentication Guard

The route guard checks whether `auth_token` exists before allowing navigation to `/dashboard`. It improves navigation behavior, but it is not the application's actual security boundary. Backend authorization remains authoritative.

### HTTP Interceptor

The interceptor:

- Attaches `Authorization: Bearer <token>` to protected requests
- Avoids attaching the token to signup and login requests
- Clears an invalid or expired token after a protected `401 Unauthorized` response
- Redirects the user to `/login`

## Backend Responsibilities

### Entity

The `User` entity represents the `users` database table and contains fields such as:

- `id`
- `name`
- `email`
- `password`
- `createdAt`

Only the BCrypt password hash is stored. The plaintext password is never persisted or returned.

### Repository

`UserRepository` uses Spring Data JPA to:

- Save users
- Find users by ID
- Find users by normalized email
- Check whether an email is already registered

### DTOs

Request and response DTOs define safe API contracts, including:

- `SignUpRequest`
- `SignUpResponse`
- `LoginRequest`
- `LoginResponse`
- `UserResponse`

Entities are not returned directly, preventing password hashes and persistence details from being exposed.

### Controllers

- `AuthController` handles signup and login requests.
- `UserController` exposes the protected current-user endpoint.

Controllers handle HTTP concerns and delegate business logic to the service layer.

### AuthService

The authentication service:

- Normalizes email addresses using trimming and lowercase conversion
- Checks duplicate registrations
- Hashes passwords with BCrypt
- Saves new users
- Verifies login credentials
- Generates JWTs after successful authentication

### SecurityConfig

Spring Security is configured to:

- Allow signup and login without authentication
- Require authentication for all other endpoints
- Use stateless authentication
- Register the JWT authentication filter
- Configure BCrypt password encoding
- Configure CORS for the Angular development origin

### JwtAuthenticationFilter

For protected requests, the filter:

1. Reads the `Authorization` header.
2. Extracts the bearer token.
3. Validates its signature and expiration.
4. Extracts the user ID from the JWT subject.
5. Loads the user from PostgreSQL.
6. Establishes the Spring Security authentication context.
7. Continues the request to the protected controller.

### JwtUtil

The JWT utility generates and validates HS256-signed tokens. Tokens contain only minimal claims:

- Subject: user ID
- Issued-at time
- Expiration time

Passwords, password hashes, secrets, and unnecessary personal data are not stored in tokens.

## Database Model

```text
users
────────────────────────────
id          BIGINT, primary key
name        VARCHAR, not null
email       VARCHAR, unique, not null
password    VARCHAR, not null
created_at  TIMESTAMP, not null
```

The database-level unique constraint protects against duplicate emails, including concurrent registration attempts.

## API Endpoints

### Register User

```http
POST /api/auth/signup
Content-Type: application/json
```

```json
{
  "name": "Deeksha M",
  "email": "deeksha@example.com",
  "password": "StrongPass@123",
  "confirmPassword": "StrongPass@123"
}
```

Successful response: `201 Created`

### Login

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "deeksha@example.com",
  "password": "StrongPass@123"
}
```

Example successful response:

```json
{
  "token": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "user": {
    "id": 1,
    "name": "Deeksha M",
    "email": "deeksha@example.com"
  }
}
```

Invalid credentials return `401 Unauthorized` with a generic message.

### Get Current User

```http
GET /api/users/me
Authorization: Bearer <jwt>
```

Example response:

```json
{
  "id": 1,
  "name": "Deeksha M",
  "email": "deeksha@example.com"
}
```

Missing, malformed, invalid, or expired tokens return `401 Unauthorized`.

## Application Workflows

### Registration

```text
User submits form
→ Angular validates the values
→ POST /api/auth/signup
→ Backend validates and normalizes the request
→ Repository checks whether the email exists
→ BCrypt hashes the password
→ User is saved in PostgreSQL
→ 201 Created
→ Angular redirects to login
```

### Login

```text
User submits credentials
→ POST /api/auth/login
→ Backend finds the normalized email
→ BCrypt verifies the password
→ Backend generates an expiring JWT
→ Angular stores auth_token
→ User is redirected to dashboard
```

### Protected Dashboard

```text
User opens /dashboard
→ Route guard checks token presence
→ Dashboard calls GET /api/users/me
→ Interceptor attaches Bearer token
→ JWT filter validates the token
→ Backend loads the user
→ Safe profile data is returned
```

### Logout

```text
User clicks Logout
→ auth_token is removed
→ User is redirected to login
→ Dashboard navigation is blocked
```

Logout is client-side because the application currently uses stateless access tokens without a server-side revocation list.

## Local Setup

### Prerequisites

- Java 21
- Node.js LTS and npm
- Angular CLI through `npx`
- Maven 3.9+
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Deeksha2595/ai-fsapplication.git
cd ai-fsapplication
```

### 2. Create the PostgreSQL Database

```sql
CREATE DATABASE ai_auth_db;
```

Configure the datasource values expected by `backend/src/main/resources/application.properties`. Keep real database credentials outside version control.

### 3. Set Backend Environment Variables

PowerShell example:

```powershell
$env:JWT_SECRET="replace-with-a-random-secret-at-least-32-bytes-long"
$env:JWT_EXPIRATION_SECONDS="3600"
```

Set any datasource environment variables referenced by `application.properties` in the same terminal session.

### 4. Run the Backend

From `backend`:

```powershell
& 'C:\tools\apache-maven-3.9.9\bin\mvn.cmd' spring-boot:run '-Dspring-boot.run.arguments=--server.port=8081'
```

If Maven is available in `PATH`:

```bash
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

Backend URL:

```text
http://localhost:8081
```

### 5. Run the Frontend

From `frontend`:

```bash
npm install
npx ng serve
```

Frontend URL:

```text
http://localhost:4200
```

## Build Commands

Frontend:

```bash
cd frontend
npm run build
```

Backend:

```powershell
cd backend
& 'C:\tools\apache-maven-3.9.9\bin\mvn.cmd' clean package -DskipTests
```

Build outputs are created in `frontend/dist` and `backend/target`. Both directories are ignored by Git.

## Verification Checklist

- Open `/dashboard` without a token and confirm redirection to `/login`.
- Register a user and confirm a BCrypt hash, not a plaintext password, is stored.
- Log in with valid credentials and confirm dashboard access.
- Log in with an incorrect password and confirm a generic error.
- Refresh `/dashboard` and confirm the session continues while the JWT is valid.
- Confirm `/api/users/me` includes an `Authorization: Bearer <token>` header.
- Replace the token with invalid text and confirm redirection to login.
- Log out and confirm `/dashboard` becomes inaccessible.

## HTTP Status Codes

| Status | Use |
|---:|---|
| `200 OK` | Successful login or protected request |
| `201 Created` | Successful registration |
| `400 Bad Request` | Validation failure |
| `401 Unauthorized` | Invalid credentials or invalid/missing token |
| `409 Conflict` | Email already registered |

## Security Decisions

- Passwords are hashed using BCrypt and never decrypted.
- Email addresses are normalized before lookup and storage.
- Passwords and hashes are excluded from API responses and JWT claims.
- The JWT signing secret is supplied through configuration, not committed source.
- Authentication is stateless; the server does not maintain login sessions.
- Frontend and backend validation are both used. Backend validation is authoritative.
- The Angular guard improves navigation, while Spring Security provides actual protection.
- Invalid credentials use a generic response to avoid revealing whether an account exists.

## AI-Assisted Development

This project was built through a controlled AI-assisted workflow.

### Prompt Engineering

Each feature prompt included:

- Current application state
- Exact feature scope
- API request and response contracts
- Validation and security constraints
- Files that could be changed
- Required tests and expected outputs

### Context Engineering

`.github/copilot-instructions.md` provided persistent project-level context, including:

- Technology stack
- Architecture and directory conventions
- Security requirements
- Coding standards
- API contracts
- Validation rules

Existing code, terminal errors, configuration, ports, and database details were also supplied as task-specific context.

### Iterative Verification

AI-generated changes were reviewed, compiled, and tested rather than accepted blindly. Issues corrected during development included:

- Angular CLI execution
- Maven installation and command formatting
- PostgreSQL database configuration
- Port conflicts
- Angular routing
- Component-scoped CSS after refactoring
- JWT interceptor registration
- Spring Boot JAR packaging and file locks
- Generated build files being tracked by Git

The AI acted as a development assistant; design decisions, constraints, testing, and final verification remained human-controlled.

## Current Limitations

This is a learning-oriented implementation. Current limitations include:

- JWT is stored in `localStorage`, which increases exposure if an XSS vulnerability exists.
- Logout does not revoke the JWT server-side.
- No refresh-token flow.
- No email verification or password reset.
- No role-based authorization.
- No login rate limiting or temporary account lockout.
- Limited automated integration and end-to-end tests.
- Local development uses HTTP.

## Planned Improvements

- Secure, HttpOnly, SameSite cookie-based token handling with defined CSRF protection
- Refresh-token rotation and token revocation
- Email verification and password reset
- Role-based authorization
- Rate limiting and brute-force protection
- Flyway or Liquibase database migrations
- Automated unit, integration, and end-to-end tests
- Docker Compose for frontend, backend, and PostgreSQL
- HTTPS, CI/CD, secret management, and production monitoring

## Author

**Deeksha M**

GitHub: [Deeksha2595](https://github.com/Deeksha2595)

