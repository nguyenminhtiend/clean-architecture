# Test Directory

This directory contains all test files and test-related utilities for the Clean Architecture project.

## Structure

```
test/
├── e2e/                     # End-to-end tests (API level)
├── integration/             # Integration tests (module level)
├── unit/                    # Unit tests (isolated components)
├── helpers/                 # Test utilities and factories
│   ├── factories/           # Factory functions for test data
│   ├── assertions.helper.ts # Custom assertion helpers
│   ├── e2e-test.setup.ts    # E2E test setup utilities
│   ├── mock-prisma.service.ts
│   ├── mock-repository.factory.ts
│   ├── test-data.builder.ts
│   ├── test-db-setup.ts
│   └── test-module.builder.ts
├── scripts/                 # Test setup scripts
│   └── setup-test-db.sh     # Database setup for tests
├── jest-e2e.json            # E2E test configuration
├── jest-integration.json    # Integration test configuration
└── setup-e2e.ts             # Global E2E setup file
```

## Test Isolation

All tests are **fully isolated** and do not depend on each other:

### E2E Tests

- Use `beforeEach` to clear database state
- Each test creates its own test data
- No shared variables between tests
- Database is cleaned up after each test

### Integration Tests

- Each test creates a fresh module instance
- Mocks are recreated in `beforeEach`
- Proper cleanup in `afterEach`
- No shared state between tests

### Unit Tests

- Fresh mocks created in `beforeEach`
- Mocks cleared in `afterEach`
- Completely isolated from other tests
- No external dependencies

## Running Tests

```bash
# Run all unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Run all tests
pnpm test:all

# Run tests with coverage
pnpm test:cov

# CI test run
pnpm test:ci
```

## Test Setup

### Database Setup for E2E Tests

Before running E2E tests, set up the test database:

```bash
./test/scripts/setup-test-db.sh
```

This script will:

- Create `.env.test` file with test database URL
- Create the test database
- Run migrations on the test database

### Environment Variables

E2E tests use a separate test database configured in `.env.test`:

```
DATABASE_URL="postgresql://admin:123456@localhost:5432/clean_architecture_test?schema=public"
NODE_ENV=test
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on execution order
2. **Clean Setup**: Use `beforeEach` to set up fresh test state
3. **Clean Teardown**: Use `afterEach` to clean up mocks and state
4. **Factory Functions**: Use factories from `helpers/factories/` for consistent test data
5. **Descriptive Names**: Test names should clearly describe what they test
6. **Arrange-Act-Assert**: Follow AAA pattern for test structure
7. **Mock External Dependencies**: Unit tests should mock all external dependencies
8. **Real Database for E2E**: E2E tests use real database with cleanup

## Helpers

### Factories

Factories provide consistent test data creation:

```typescript
import { ProductFactory, OrderFactory } from '../helpers';

const product = ProductFactory.createProduct({ name: 'Test Product' });
const order = OrderFactory.createOrder({ customerName: 'John' });
```

### Test Module Builder

Simplifies test module creation:

```typescript
import { createTestModuleBuilder } from '../helpers';

const module = await createTestModuleBuilder()
  .withProvider(MyHandler)
  .withMockProvider('IMyRepository', mockRepository)
  .build();
```

### E2E Test Setup

Provides standardized app setup for E2E tests:

```typescript
import { createE2ETestApp, closeE2ETestApp } from '../helpers';

const { app, prismaService } = await createE2ETestApp();
// ... run tests
await closeE2ETestApp({ app, prismaService });
```

### Assertions

Custom assertion helpers for common checks:

```typescript
import {
  expectCreatedResponse,
  expectArrayResponse,
  expectProductShape,
} from '../helpers';

expectCreatedResponse(response);
expectArrayResponse(response, 5); // expects exactly 5 items
expectProductShape(response.body);
```
