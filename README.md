# Wallet Transactions Service

Un servicio de transacciones financieras de grado de producción con arquitectura basada en libros contables (ledger-first), construido con NestJS y PostgreSQL.

## 📋 Descripción General

**Wallet Transactions Service** es un sistema de grado financiero diseñado para gestionar:

- Transacciones de débito y crédito
- Transferencias atómicas entre billeteras (wallets)
- Reversiones de transacciones mediante asientos de compensación
- Consultas de saldo y movimientos transaccionales
- Operaciones idempotentes con soporte para Idempotency-Key
- Registro de logs estructurado con IDs de correlación (correlation IDs)
- Manejo integral de errores

### Características Clave

- ✅ **Arquitectura Modular Hexagonal** — Separación clara de responsabilidades
- ✅ **Patrón CQRS-lite** — Modelos separados de Escritura (Transaction) y Lectura (Ledger)
- ✅ **Diseño Ledger-first** — Libro contable de solo adición (append-only) como fuente única de verdad
- ✅ **Transacciones ACID** — Garantías estrictas de consistencia
- ✅ **Idempotencia** — Protección contra la repetición de peticiones con un TTL de 24 horas
- ✅ **Autenticación JWT** — Soporte de Mock JWT para desarrollo local
- ✅ **Swagger/OpenAPI** — Documentación interactiva de la API
- ✅ **Pruebas Exhaustivas** — Pruebas unitarias, de integración y E2E
- ✅ **Soporte para Docker** — Configuración completa con Docker Compose
- ✅ **Pipeline de CI/CD** — Flujo de trabajo con GitHub Actions

---

## 🏗️ Arquitectura

### Estructura de Módulos

```

src/modules
├── transaction          (Write Model - CQRS)
│   ├── dto/
│   ├── entities/
│   ├── services/
│   └── transaction.controller.ts
├── ledger               (Read Model - CQRS)
│   ├── entities/
│   ├── services/
│   └── ledger.controller.ts
└── common               (Utilidades compartidas)
├── filters/
├── middleware/
└── services/

```

### Flujo de las Peticiones

```

Petición HTTP
↓
Pipes Globales (Validación)
↓
Middleware (ID de Correlación)
↓
Controller (Enrutamiento)
↓
Service (Lógica de Negocio)
↓
Repository (Acceso a Datos)
↓
Base de Datos

```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 20+
- **pnpm** 8+
- **Docker** & **Docker Compose**
- **PostgreSQL** 16+ (o usar Docker)

### Instalación

1. **Clonar el repositorio**

```bash
git clone [https://github.com/your-org/wallet-transactions-service.git](https://github.com/your-org/wallet-transactions-service.git)
cd wallet-transactions-service

```

2. **Instalar dependencias**

```bash
pnpm install

```

3. **Configurar el entorno**

```bash
cp .env.example .env

```

4. **Iniciar con Docker Compose**

```bash
docker compose up --build

```

La API estará disponible en: `http://localhost:3000/api/v1`

### Desarrollo Local (sin Docker)

1. **Iniciar PostgreSQL**

```bash
docker run -d \
  --name postgres_wallet \
  -e POSTGRES_DB=WalletDB \
  -e POSTGRES_USER=wallet_user \
  -e POSTGRES_PASSWORD=wallet_password \
  -p 5432:5432 \
  postgres:16-alpine

```

2. **Ejecutar la aplicación en modo desarrollo**

```bash
pnpm run start:dev

```

3. **Abrir la interfaz de Swagger UI**

Visita: `http://localhost:3000/api/v1/docs`

---

## 📚 Resumen de la API

### Endpoints de Transacciones (Modelo de Escritura)

#### Crear Transacción

```http
POST /api/v1/transactions
Content-Type: application/json
Idempotency-Key: unique-key-123

{
  "type": "DEBIT",
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": "100.0000",
  "currency": "USD",
  "metadata": { "reference": "INV-001" }
}

```

**Respuesta (201 Created):**

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

#### Crear Transferencia

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

**Respuesta (201 Created):**

```json
{
  "source": {/* transaccion de debito */},
  "target": {/* transaccion de credito */}
}
```

#### Revertir Transacción

```http
POST /api/v1/transactions/{transactionId}/reversal
Idempotency-Key: unique-reversal-key-789

```

### Endpoints de Libro Contable (Modelo de Lectura)

#### Obtener Saldo de Billetera

```http
GET /api/v1/wallets/{walletId}/balance

```

**Respuesta (200 OK):**

```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "availableBalance": "450.0000",
  "currency": "USD",
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

#### Obtener Movimientos de Billetera

```http
GET /api/v1/wallets/{walletId}/movements?page=1&pageSize=50

```

**Respuesta (200 OK):**

```json
{
  "walletId": "550e8400-e29b-41d4-a716-446655440000",
  "total": 1,
  "movements": [
    {
      "transactionId": "550e8400-e29b-41d4-a716-446655440001",
      "type": "DEBIT",
      "amount": "100.0000",
      "status": "COMPLETED",
      "currency": "USD",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Comprobación de Estado (Health Check)

```http
GET /api/v1/health

```

---

## 🧪 Pruebas

### Pruebas Unitarias

```bash
pnpm run test
pnpm run test:watch       # Modo observador (watch)
pnpm run test:cov         # Con reporte de cobertura

```

### Pruebas de Integración

```bash
pnpm run test:e2e

```

### Reporte de Cobertura

```bash
pnpm run test:cov

```

Los reportes se generan dentro del directorio `./coverage`.

---

## 🔧 Desarrollo

### Formateo & Linting

```bash
pnpm run lint              # Ejecutar ESLint con corrección automática
pnpm run format            # Formatear con Prettier

```

### Compilación (Build)

```bash
pnpm run build             # Compilación para producción
pnpm run start:prod        # Iniciar el servidor de producción

```

### Migraciones de Base de Datos

```bash
pnpm run migration:generate -- -n NombreDeLaMigracion
pnpm run migration:run
pnpm run migration:revert

```

---

## 🐳 Docker

### Docker Compose (Recomendado)

```bash
docker compose up --build        # Iniciar servicios
docker compose down              # Detener servicios
docker compose logs -f api       # Ver logs de la API
docker compose logs -f postgres  # Ver logs de la base de datos

```

Servicios:

- **API**: Puerto 3000
- **PostgreSQL**: Puerto 5432

### Compilación Manual de Docker

```bash
docker build -t wallet-transactions-service:latest .
docker run -p 3000:3000 --env-file .env wallet-transactions-service:latest

```

---

## 📊 Variables de Entorno

| Variable               | Por Defecto     | Descripción                                             |
| ---------------------- | --------------- | ------------------------------------------------------- |
| `DATABASE_URL`         | —               | Cadena de conexión de PostgreSQL                        |
| `DATABASE_HOST`        | localhost       | Host de la base de datos                                |
| `DATABASE_PORT`        | 5432            | Puerto de la base de datos                              |
| `DATABASE_NAME`        | WalletDB        | Nombre de la base de datos                              |
| `DATABASE_USER`        | wallet_user     | Usuario de la base de datos                             |
| `DATABASE_PASSWORD`    | wallet_password | Contraseña de la base de datos                          |
| `DATABASE_SYNCHRONIZE` | true            | Sincronización automática del esquema (solo desarrollo) |
| `JWT_SECRET`           | your_secret     | Clave secreta de firma para JWT                         |
| `JWT_EXPIRATION`       | 7d              | Tiempo de expiración del token JWT                      |
| `NODE_ENV`             | development     | Entorno de ejecución de Node                            |
| `LOG_LEVEL`            | debug           | Nivel de registro de logs                               |
| `API_PORT`             | 3000            | Puerto del servidor de la API                           |
| `API_GLOBAL_PREFIX`    | api/v1          | Prefijo global de la API                                |

---

## 📋 Convenciones

### Estilo de Código

- **camelCase**: Variables, funciones, métodos
- **PascalCase**: Clases, DTOs, Entidades
- **kebab-case**: Nombres de archivos

### Flujo de Trabajo en Git (Git Flow)

- `main` → Producción
- `develop` → Integración
- `feature/*` → Desarrollo de características
- `hotfix/*` → Correcciones urgentes para producción

### Convenciones de Commits

```
feat: add transaction creation
fix: correct reversal logic
refactor: improve ledger queries
test: add integration tests
chore: update dependencies
docs: update README

```

---

## ✅ Reglas de la Base de Datos

### Desarrollo (`DATABASE_SYNCHRONIZE=true`)

- Sincronización automática del esquema de datos al iniciar
- TypeORM genera automáticamente las tablas y migraciones
- Adecuado únicamente para entornos de desarrollo local

### Producción (`DATABASE_SYNCHRONIZE=false`)

- Los cambios en el esquema son gestionados estrictamente vía migraciones de TypeORM
- **NUNCA utilices synchronize en producción**
- Se requiere el despliegue manual de las migraciones

### Diseño de Libro Contable (Append-Only)

- Los registros del libro contable son inmutables
- **No se permiten operaciones UPDATE ni DELETE**
- Las reversiones crean asientos de compensación, nunca mutaciones del registro original
- Fuente única de verdad para los saldos de las billeteras

---

## 📦 Dependencias

### Core

- **@nestjs/core** v10.3+ — Framework NestJS
- **@nestjs/typeorm** v9.0+ — Integración con el ORM
- **typeorm** v0.3+ — ORM SQL
- **pg** v8.11+ — Driver para PostgreSQL
- **@nestjs/swagger** v7.1+ — Documentación de OpenAPI

### Utilidades

- **class-validator** v0.14+ — Validación de DTOs
- **class-transformer** v0.5+ — Transformación de objetos
- **uuid** v9.0+ — Generación de UUIDs

### Desarrollo

- **@nestjs/cli** v10.3+ — CLI de NestJS
- **typescript** v5.3+ — Compilador de TypeScript
- **jest** v29.7+ — Framework de pruebas
- **eslint** v8.56+ — Linter
- **prettier** v3.1+ — Formateador de código

---

## 🔒 Seguridad

- ✅ Modo estricto de TypeScript activado
- ✅ Validación de peticiones mediante class-validator
- ✅ Soporte para autenticación por JWT
- ✅ ID de correlación implementado para pistas de auditoría
- ✅ Manejo de errores limpio sin exposición de trazas de pila (stack traces)
- ✅ Exclusión de datos sensibles en los logs

---

## 📈 Consideraciones de Rendimiento

- Agrupamiento de conexiones (connection pooling) gestionado vía TypeORM
- Consultas al libro contable optimizadas mediante índices (wallet, transaction)
- Caché de idempotencia provisto de TTL
- Uso riguroso de Async/await para operaciones de I/O no bloqueantes
- Carga perezosa (lazy loading) de módulos

---

## 🤝 Contribuciones

1. Crea una rama para tu característica: `git checkout -b feature/my-feature`
2. Realiza el commit de tus cambios: `git commit -m "feat: add my feature"`
3. Sube la rama al repositorio: `git push origin feature/my-feature`
4. Abre un Pull Request

### Verificaciones previas al Commit

- El análisis de ESLint debe pasar sin errores
- Todas las pruebas deben completarse con éxito
- Se debe mantener la cobertura de código acordada

---

## 📝 Licencia

MIT

---

## 📞 Soporte

Para reportar fallos, realizar preguntas o sugerencias, por favor abre un issue en este repositorio o contacta al equipo de desarrollo.

---

## 🎓 Principios de Arquitectura

1. **Responsabilidad Única** — Cada servicio gestiona una sola preocupación de negocio
2. **Inyección de Dependencias** — Todas las dependencias son inyectadas
3. **Separación de Responsabilidades** — Controladores, Servicios y Repositorios claramente definidos
4. **CQRS-lite** — Modelos separados de lectura y escritura
5. **Ledger-first** — Libro contable inmutable de solo adición
6. **Idempotencia** — Repetición segura de peticiones HTTP
7. **ACID** — Consistencia fuerte para operaciones financieras
8. **Auditabilidad** — Todos los cambios son registrados y rastreables

---

**Desarrollado con ❤️ usando NestJS y TypeScript**
