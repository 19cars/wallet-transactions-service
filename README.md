# Wallet Transactions Service

A production-grade financial transactions service with ledger-based architecture, built with NestJS and PostgreSQL.

## 📋 Overview

**Wallet Transactions Service** is a **grado financiero (financial-grade)** system designed to handle:

- Debit and credit transactions
- Atomic transfers between wallets
- Transaction reversals with compensation entries
- Balance queries and transaction movements
- Idempotent operations with Idempotency-Key support
- Structured logging with correlation IDs
- Comprehensive error handling

### Key Features

- ✅ **Hexagonal Modular Architecture** — Clean separation of concerns
- ✅ **CQRS-lite Pattern** — Separate Write (Transaction) and Read (Ledger) models
- ✅ **Ledger-first Design** — Append-only ledger as the source of truth
- ✅ **ACID Transactions** — Strong consistency guarantees
- ✅ **Idempotency** — Request replay protection with 24-7 day TTL
- ✅ **JWT Authentication** — Mock JWT support for local development
- ✅ **Swagger/OpenAPI** — Interactive API documentation
- ✅ **Comprehensive Tests** — Unit, Integration, and E2E tests
- ✅ **Docker Support** — Full Docker Compose setup
- ✅ **CI/CD Pipeline** — GitHub Actions workflow

---

## 🏗️ Architecture

### Module Structure

```
src/modules
├── transaction          (Write Model - CQRS)
│   ├── dto/
│   ├── entities/
│   ├── services/
│   └── transaction.controller.ts
├── ledger              (Read Model - CQRS)
│   ├── entities/
│   ├── services/
│   └── ledger.controller.ts
└── common              (Shared utilities)
    ├── filters/
    ├── middleware/
    └── services/
```

### Request Flow

```
HTTP Request
    ↓
Global Pipes (Validation)
    ↓
Middleware (Correlation ID)
    ↓
Controller (Routing)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Database
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 8+
- **Docker** & **Docker Compose**
- **PostgreSQL** 16+ (or use Docker)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-org/wallet-transactions-service.git
cd wallet-transactions-service
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment**

```bash
cp .env.example .env
```

4. **Start with Docker Compose**

```bash
docker compose up --build
```

The API will be available at: `http://localhost:3000/api/v1`

### Local Development (without Docker)

1. **Start PostgreSQL**

```bash
docker run -d \
  --name postgres_wallet \
  -e POSTGRES_DB=WalletDB \
  -e POSTGRES_USER=wallet_user \
  -e POSTGRES_PASSWORD=wallet_password \
  -p 5432:5432 \
  postgres:16-alpine
```

2. **Run the application in development mode**

```bash
pnpm run start:dev
```

3. **Open Swagger UI**

Visit: `http://localhost:3000/api/v1/docs`

---

## 📚 API Summary

### Transaction Endpoints (Write Model)

#### Create Transaction

```http
POST /api/v1/transactions
Content-Type: application/json
Idempotency-Key: unique-key-123

{
  "type": "DEBIT",
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 100.00,
  "currency": "USD",
  "metadata": { "reference": "INV-001" }
}
```

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "type": "DEBIT",
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": "100.00",
  "currency": "USD",
  "status": "COMPLETED",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "completedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Create Transfer

```http
POST /api/v1/transactions/transfer
Content-Type: application/json
Idempotency-Key: unique-transfer-key-456

{
  "sourceWalletId": "550e8400-e29b-41d4-a716-446655440000",
  "targetWalletId": "550e8400-e29b-41d4-a716-446655440002",
  "amount": 50.00,
  "currency": "USD"
}
```

**Response (201 Created):**

```json
{
  "source": {
    /* debit transaction */
  },
  "target": {
    /* credit transaction */
  }
}
```

#### Reverse Transaction

```http
POST /api/v1/transactions/{transactionId}/reversal
Idempotency-Key: unique-reversal-key-789
```

### Ledger Endpoints (Read Model)

#### Get Wallet Balance

```http
GET /api/v1/wallets/{walletId}/balance
```

**Response (200 OK):**

```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "balance": "450.00",
  "currency": "USD",
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

#### Get Wallet Movements

```http
GET /api/v1/wallets/{walletId}/movements?limit=50&offset=0
```

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "type": "DEBIT",
    "amount": "100.00",
    "balance": "900.00",
    "currency": "USD",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Health Check

```http
GET /api/v1/health
```

---

## 🧪 Testing

### Unit Tests

```bash
pnpm run test
pnpm run test:watch       # Watch mode
pnpm run test:cov         # With coverage
```

### Integration Tests

```bash
pnpm run test:e2e
```

### Coverage Report

```bash
pnpm run test:cov
```

Reports are generated in `./coverage` directory.

---

## 🔧 Development

### Formatting & Linting

```bash
pnpm run lint              # Run ESLint with auto-fix
pnpm run format            # Format with Prettier
```

### Build

```bash
pnpm run build             # Production build
pnpm run start:prod        # Start production server
```

### Database Migrations

```bash
pnpm run migration:generate -- -n MigrationName
pnpm run migration:run
pnpm run migration:revert
```

---

## 🐳 Docker

### Docker Compose (Recommended)

```bash
docker compose up --build        # Start services
docker compose down              # Stop services
docker compose logs -f api       # View API logs
docker compose logs -f postgres  # View database logs
```

Services:

- **API**: Port 3000
- **PostgreSQL**: Port 5432

### Docker Build Manually

```bash
docker build -t wallet-transactions-service:latest .
docker run -p 3000:3000 --env-file .env wallet-transactions-service:latest
```

---

## 📊 Environment Variables

| Variable               | Default         | Description                  |
| ---------------------- | --------------- | ---------------------------- |
| `DATABASE_URL`         | —               | PostgreSQL connection string |
| `DATABASE_HOST`        | localhost       | Database host                |
| `DATABASE_PORT`        | 5432            | Database port                |
| `DATABASE_NAME`        | WalletDB        | Database name                |
| `DATABASE_USER`        | wallet_user     | Database user                |
| `DATABASE_PASSWORD`    | wallet_password | Database password            |
| `DATABASE_SYNCHRONIZE` | true            | Auto-sync schema (dev only)  |
| `JWT_SECRET`           | your_secret     | JWT signing secret           |
| `JWT_EXPIRATION`       | 7d              | JWT token expiration         |
| `NODE_ENV`             | development     | Node environment             |
| `LOG_LEVEL`            | debug           | Logging level                |
| `API_PORT`             | 3000            | API server port              |
| `API_GLOBAL_PREFIX`    | api/v1          | API global prefix            |

---

## 📋 Conventions

### Code Style

- **camelCase**: Variables, functions, methods
- **PascalCase**: Classes, DTOs, Entities
- **kebab-case**: File names

### Git Workflow (Git Flow)

- `main` → Production
- `develop` → Integration
- `feature/*` → Development
- `hotfix/*` → Production fixes

### Commit Conventions

```
feat: add transaction creation
fix: correct reversal logic
refactor: improve ledger queries
test: add integration tests
chore: update dependencies
docs: update README
```

---

## ✅ Database Rules

### Development (`DATABASE_SYNCHRONIZE=true`)

- Automatic schema synchronization on startup
- TypeORM auto-generates tables and migrations
- Suitable for local development only

### Production (`DATABASE_SYNCHRONIZE=false`)

- Schema changes managed via TypeORM migrations
- **NEVER use synchronize in production**
- Manual migration deployment required

### Ledger Design (Append-Only)

- Ledger entries are immutable
- **No UPDATE or DELETE operations**
- Reversals create compensation entries, not mutations
- Single source of truth for wallet balances

---

## 📦 Dependencies

### Core

- **@nestjs/core** v10.3+ — NestJS framework
- **@nestjs/typeorm** v9.0+ — ORM integration
- **typeorm** v0.3+ — SQL ORM
- **pg** v8.11+ — PostgreSQL driver
- **@nestjs/swagger** v7.1+ — OpenAPI documentation

### Utilities

- **class-validator** v0.14+ — DTO validation
- **class-transformer** v0.5+ — Object transformation
- **uuid** v9.0+ — UUID generation

### Development

- **@nestjs/cli** v10.3+ — NestJS CLI
- **typescript** v5.3+ — TypeScript compiler
- **jest** v29.7+ — Testing framework
- **eslint** v8.56+ — Linting
- **prettier** v3.1+ — Code formatting

---

## 🔒 Security

- ✅ Strict TypeScript mode
- ✅ Request validation with class-validator
- ✅ JWT authentication support
- ✅ Correlation ID for audit trails
- ✅ Error handling without stack traces
- ✅ No sensitive data in logs

---

## 📈 Performance Considerations

- Connection pooling via TypeORM
- Indexed ledger queries (wallet, transaction)
- Idempotency cache with TTL
- Async/await for non-blocking I/O
- Lazy module loading

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "feat: add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open a Pull Request

### Pre-commit Checks

- ESLint must pass
- All tests must pass
- Code coverage maintained

---

## 📝 License

MIT

---

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository or contact the development team.

---

## 🎓 Architecture Principles

1. **Single Responsibility** — Each service handles one concern
2. **Dependency Injection** — All dependencies are injected
3. **Separation of Concerns** — Controllers, Services, Repositories
4. **CQRS-lite** — Separate write and read models
5. **Ledger-first** — Immutable append-only ledger
6. **Idempotency** — Safe request replays
7. **ACID** — Strong consistency for financial operations
8. **Auditability** — All changes are logged and traceable

---

**Developed with ❤️ using NestJS and TypeScript**
