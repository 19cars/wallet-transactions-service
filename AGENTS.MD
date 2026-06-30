# AGENTS.md

# Servicio de Transacciones de Billetera (Wallet Transactions Service)

## 1. Propósito

Este servicio es un **sistema de transacciones de billetera de grado financiero** construido sobre una arquitectura basada en libros contables (ledger).

Se encarga de:

- Transacciones de Débito / Crédito
- Transferencias (débito + crédito atómicos entre billeteras)
- Reversiones (asientos contables de compensación)
- Consultas de saldos y movimientos basados en el libro contable (ledger)

El sistema prioriza:

- Consistencia
- Auditabilidad
- Idempotencia
- Comportamiento determinista

---

## 2. Stack Tecnológico

- Node.js 20+
- NestJS (LTS)
- TypeScript (modo estricto)
- PostgreSQL
- TypeORM
- pnpm
- Autenticación JWT (se permite Mock JWT localmente)
- Swagger (OpenAPI)
- class-validator + class-transformer
- Jest (unitarias, integración, e2e)
- ESLint + Prettier
- CI/CD con GitHub Actions
- Docker + Docker Compose

---

## 3. Arquitectura

### 3.1 Estilo

- Arquitectura Hexagonal Modular
- CQRS-lite (separación de los modelos de lectura y escritura)
- Diseño basado primero en el libro contable / Ledger-first (fuente única de verdad)
- Consistencia transaccional fuerte (se requiere ACID)

---

## 4. Módulos

```

src/modules
├── transaction   (MODELO DE ESCRITURA / WRITE MODEL)
└── ledger        (MODELO DE LECTURA / READ MODEL)

```

---

## 5. Diseño de la API

### 5.1 Transacciones (ESCRITURA)

Endpoints para operaciones que modifican el estado financiero:

```

POST /transactions
POST /transactions/transfer

```

#### Cuerpo (Body) para `POST /transactions`:

```json
{
  "type": "DEBIT | CREDIT",
  "walletId": "uuid",
  "amount": 100,
  "currency": "USD",
  "metadata": {}
}
```

#### Cuerpo (Body) para `POST /transactions/transfer`:

```json
{
  "sourceWalletId": "uuid",
  "targetWalletId": "uuid",
  "amount": 50,
  "currency": "USD"
}
```

---

### 5.2 Reversiones (Reversal)

```
POST /transactions/{id}/reversal

```

Reglas:

- Debe ser idempotente
- No debe mutar la transacción original
- Debe generar asientos contables de compensación en el libro contable (ledger)

---

### 5.3 Libro Contable / Ledger (LECTURA)

```
GET /wallets/{walletId}/balance
GET /wallets/{walletId}/movements
GET /transactions/{id}

```

El Ledger es de SOLO LECTURA.

---

## 6. Reglas de CQRS-Lite

### MODELO DE ESCRITURA (WRITE MODEL)

- El módulo de transacciones maneja únicamente comandos
- Comandos:
- CreateTransactionCommand
- CreateTransferCommand
- CreateReversalCommand

### MODELO DE LECTURA (READ MODEL)

- El módulo del ledger maneja únicamente consultas (queries)
- No se permite lógica de negocio en este modelo

---

## 7. Reglas de Idempotencia

Aplica ÚNICAMENTE a:

- POST /transactions
- POST /transactions/transfer
- POST /transactions/{id}/reversal

### Mecanismo

- Encabezado (Header): `Idempotency-Key`
- Almacenamiento:
- clave (key)
- hash de la petición (cuerpo canónico SHA-256)
- payload de la respuesta
- código de estado HTTP

### Reglas

- Misma clave + mismo cuerpo → retornar la respuesta en caché
- Misma clave + diferente cuerpo → 409 Conflict
- Se requiere un tiempo de vida (TTL) de 24h a 7d

---

## 8. Base de Datos y Entorno

### Configuración y Conexión

- El sistema debe conectarse a la base de datos llamada `WalletDB`.
- Se requiere la existencia de un archivo `.env` en la raíz del proyecto que contenga las credenciales y la cadena de conexión bajo la variable `DATABASE_URL`.

### Reglas

- **Entorno de Desarrollo:** Se permite y requiere la sincronización automática de esquemas (`synchronize: true`) únicamente en entornos locales y de desarrollo para generar los objetos de base de datos al iniciar la aplicación de forma automática.
- **Entorno de Producción:** Queda estrictamente prohibido el uso de `synchronize: true`. Los cambios en producción deberán gestionarse mediante TypeORM migrations.
- Las tablas del libro contable (ledger) son de SOLO ADICIÓN (APPEND-ONLY).
- NUNCA actualizar ni eliminar registros del ledger.
- Reversión = asiento de compensación, no una mutación.

---

## 9. Docker Compose (Entorno Local)

El sistema debe ejecutarse con:

```bash
docker compose up --build

```

Servicios:

- API (NestJS)
- PostgreSQL (Base de datos: `WalletDB`)

No se permite la configuración manual.

---

## 10. Convenciones de Código

### 10.1 Reglas de Nomenclatura

- camelCase: variables, funciones
- PascalCase: clases, DTOs, entidades
- kebab-case: archivos

### 10.2 Reglas para DTOs

- Todos los DTOs DEBEN usar `class-validator`
- Todas las entradas deben estar validadas
- No se permiten cuerpos de petición genéricos o sin tipo (untyped)

Ejemplo:

```ts
export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type: TransactionType;

  @IsUUID()
  walletId: string;

  @IsNumber()
  amount: number;
}
```

---

### 10.3 Capas de la Arquitectura

```
Controlador → Aplicación → Dominio → Infraestructura

```

Reglas:

- Sin lógica de negocio en los controladores
- Sin acceso a repositorios desde los controladores
- El dominio contiene todas las reglas de negocio
- La infraestructura maneja únicamente la persistencia

---

## 11. Reglas de Nomenclatura e Idioma

- Las funciones DEBEN usar camelCase
- Las variables DEBEN usar camelCase
- Los métodos DEBEN usar camelCase
- Las clases DEBEN usar PascalCase
- Los archivos DEBEN usar kebab-case
- No se permiten excepciones

---

## 12. Manejo de Errores

- Todos los errores deben ser excepciones controladas
- No se deben exponer trazas de pila (stack traces) a los clientes
- No se deben filtrar errores de la base de datos
- Formato estándar:

```json
{
  "code": "ERROR_CODE",
  "message": "Human readable message"
}
```

---

## 13. Reglas de Registro (Logging)

- Únicamente registros estructurados (structured logs)
- Nunca registrar:
- Tokens JWT
- Contraseñas
- Datos sensibles de la billetera

- Siempre incluir un `correlationId`

---

## 14. Estrategia de Pruebas

### Pruebas Unitarias

- Reglas de negocio
- Lógica de dominio
- Lógica de idempotencia

### Pruebas de Integración

- Transacciones de PostgreSQL
- Atomicidad de las transferencias
- Consistencia del libro contable (ledger)
- Flujos de reversión

### Pruebas E2E

- Flujos HTTP completos a través de Supertest

---

## 15. CI/CD (GitHub Actions)

La canalización (pipeline) debe incluir:

- linter
- pruebas unitarias
- pruebas de integración
- compilación (build)

No se permite la fusión (merge) si la canalización falla.

---

## 16. Flujo de Trabajo en Git (Git Workflow)

Git Flow:

- main → producción
- develop → integración
- feature/\* → desarrollo
- hotfix/\* → corrección en producción

---

## 17. Convención de Commits

```
feat: add transaction creation
fix: correct reversal logic
refactor: improve ledger queries
test: add integration tests
chore: update dependencies

```

---

## 18. Reglas del README.md

### Requisitos Obligatorios

- El archivo README.md DEBE crearse y mantenerse actualizado
- DEBE describir:
- Resumen de la arquitectura
- Cómo ejecutar el proyecto
- Uso de Docker
- Resumen de la API
- Variables de entorno
- Instrucciones para pruebas

### Regla de Actualización

- Cualquier cambio estructural en:
- módulos
- rutas de la API
- configuración de docker
- esquema de la base de datos

👉 DEBE activar una actualización del README.md en el mismo Pull Request (PR).

---

## 19. DIVULGACIÓN DEL USO DE IA

Este proyecto se desarrolla con la asistencia de herramientas de IA.

### Reglas:

- La IA se puede utilizar para la generación de código, refactorización y documentación
- La revisión humana es obligatoria para todo el código generado por IA
- Ningún código generado por IA puede fusionarse sin validación
- Las decisiones de lógica de negocio deben ser confirmadas explícitamente por un humano

---

## 20. REGLA DE VALIDACIÓN DE DTOS

- Todos los DTOs DEBEN usar `class-validator`
- No se permite ningún DTO sin decoradores de validación
- No se permiten tipos `any` en los DTOs

---

## 21. REGLA DE NOMENCLATURA DE FUNCIONES Y VARIABLES

- Todas las funciones DEBEN ser camelCase
- Todas las variables DEBEN ser camelCase
- Todos los métodos DEBEN ser camelCase
- No se permiten excepciones

---

## 22. REGLA FINAL PARA AGENTES DE IA

Al generar código:

- Respetar siempre los límites de los módulos
- Nunca eludir la capa de aplicación
- Garantizar siempre la consistencia del libro contable (ledger)
- Garantizar siempre la idempotencia para operaciones de escritura
- Asegurar siempre la compatibilidad con Docker Compose
- Validar siempre los DTOs usando class-validator
- Seguir siempre las reglas de nomenclatura camelCase
- Actualizar siempre el README.md cuando cambie la arquitectura
