# Contributing to Wallet Transactions Service

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment

## Getting Started

### 1. Fork & Clone

```bash
git clone https://github.com/your-fork/wallet-transactions-service.git
cd wallet-transactions-service
pnpm install
```

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix-name
```

### 3. Development Workflow

```bash
# Start development server with watch mode
pnpm run start:dev

# In another terminal, run tests in watch mode
pnpm run test:watch

# Format and lint your code before committing
pnpm run format
pnpm run lint
```

## Git Workflow (Git Flow)

### Branch Naming Conventions

- `feature/add-user-authentication` — New feature
- `fix/resolve-balance-calculation` — Bug fix
- `refactor/improve-error-handling` — Code refactoring
- `docs/update-api-documentation` — Documentation
- `test/add-transaction-integration-tests` — Tests

### Commit Message Format

```
type(scope): subject

body

footer
```

#### Types

- `feat` — New feature
- `fix` — Bug fix
- `refactor` — Code refactoring (no functional change)
- `test` — Adding or updating tests
- `docs` — Documentation updates
- `chore` — Dependency updates, configuration
- `style` — Code style changes (formatting)

#### Examples

```
feat(transaction): add transaction reversal support

Implements transaction reversal endpoint with compensation entries
in the ledger. Reversals are idempotent and create opposite entries.

Closes #123
```

```
fix(ledger): correct balance calculation for concurrent transfers

Fixed race condition in balance calculation for simultaneous transfers
by implementing transaction-level locking.
```

## Code Standards

### TypeScript Best Practices

1. **Strict Mode** — All code must compile in strict mode

   ```typescript
   // ✅ Good - explicit types
   const walletId: string = req.params.walletId;

   // ❌ Bad - avoid any type
   const walletId: any = req.params.walletId;
   ```

2. **Async/Await** — Use async/await over `.then()`

   ```typescript
   // ✅ Good
   const transaction = await transactionService.findById(id);

   // ❌ Bad
   transactionService.findById(id).then((transaction) => {
     // handle
   });
   ```

### NestJS Best Practices

1. **Dependency Injection** — Use constructor injection

   ```typescript
   @Injectable()
   export class TransactionService {
     constructor(
       @InjectRepository(Transaction)
       private readonly repository: Repository<Transaction>,
     ) {}
   }
   ```

2. **DTOs with Validation** — All DTOs must use class-validator

   ```typescript
   export class CreateTransactionDto {
     @IsEnum(TransactionType)
     type: TransactionType;

     @IsUUID()
     walletId: string;

     @IsNumber()
     amount: number;
   }
   ```

3. **Error Handling** — Use NestJS HTTP exceptions

   ```typescript
   if (!transaction) {
     throw new NotFoundException('Transaction not found');
   }
   ```

4. **Separation of Concerns**
   - Controllers → Route handlers
   - Services → Business logic
   - Repositories → Data access (via TypeORM)

### Naming Conventions

- **Variables/Functions/Methods**: `camelCase`
- **Classes/DTOs/Entities**: `PascalCase`
- **Files**: `kebab-case`

```typescript
// ✅ Good
const getCurrentBalance = (): number => {
  /* ... */
};
class CreateTransactionDto {
  /* ... */
}
// File: create-transaction.dto.ts

// ❌ Bad
const Get_Current_Balance = (): number => {
  /* ... */
};
class create_transaction_dto {
  /* ... */
}
// File: CreateTransactionDTO.ts
```

## Testing Requirements

### Unit Tests

- Test services and business logic
- Mock external dependencies
- Minimum 80% coverage for modified code

```bash
pnpm run test
pnpm run test:cov
```

### Integration Tests

- Test database interactions
- Test transaction atomicity
- Test ledger consistency

```bash
pnpm run test:e2e
```

### Example Test

```typescript
describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TransactionService],
    }).compile();
    service = module.get<TransactionService>(TransactionService);
  });

  it('should create a transaction', async () => {
    const dto: CreateTransactionDto = {
      /* ... */
    };
    const result = await service.createTransaction(dto);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });
});
```

## Pull Request Process

### Before Submitting

1. **Ensure all tests pass**

   ```bash
   pnpm run test
   pnpm run test:e2e
   ```

2. **Run linter and formatter**

   ```bash
   pnpm run lint
   pnpm run format
   ```

3. **Build the project**

   ```bash
   pnpm run build
   ```

4. **Update documentation** (if needed)
   - Update README.md for API changes
   - Add API examples to Swagger comments
   - Document breaking changes

### PR Title Format

Follow the same format as commit messages:

```
feat(transaction): add transaction approval workflow
fix(ledger): correct balance rounding issue
docs: update API documentation
```

### PR Description Template

```markdown
## Description

Brief description of what this PR does.

## Related Issues

Closes #123

## Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] All tests passing

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Coverage maintained
```

## Continuous Integration

All PRs are automatically checked by GitHub Actions:

1. **Linting** — ESLint validation
2. **Unit Tests** — Jest test suite
3. **Integration Tests** — E2E tests with PostgreSQL
4. **Build** — Production build verification

❌ PRs cannot be merged if any check fails.

## Security

### Sensitive Data

- Never commit `.env` files
- Don't log JWT tokens or passwords
- Validate all user inputs
- Use parameterized queries (TypeORM)

### Dependencies

- Keep dependencies up to date
- Check for CVEs: `npm audit`
- Review dependency licenses

## Documentation

### Code Comments

Add comments for complex logic:

```typescript
// Calculate new balance applying FIFO method for transaction settlement
const newBalance = previousBalance + creditAmount - debitAmount;

// Idempotency key valid for 24 hours (86400 seconds)
const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
```

### API Documentation

Use Swagger decorators:

```typescript
@Post()
@ApiCreatedResponse({ description: 'Transaction created successfully' })
@ApiConflictResponse({ description: 'Idempotency conflict' })
async create(@Body() dto: CreateTransactionDto): Promise<Transaction> {
  // ...
}
```

## Performance Considerations

- Avoid N+1 queries (use `eager` loading when necessary)
- Index database columns for frequently queried fields
- Use database transactions for atomic operations
- Cache idempotency keys (24-hour TTL)

## Getting Help

- 📖 Read the [README.md](./README.md)
- 💬 Open an issue for discussions
- 📝 Check existing PRs for similar changes
- 🐛 Report bugs with detailed reproduction steps

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
