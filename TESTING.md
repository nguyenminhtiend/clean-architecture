# Testing Guide

This document provides a comprehensive guide to testing in this Clean Architecture NestJS project.

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Test Structure](#test-structure)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

## Testing Strategy

This project follows a comprehensive testing strategy with three levels of tests:

1. **Unit Tests** - Test individual components in isolation
2. **Integration Tests** - Test module interactions
3. **E2E Tests** - Test complete user flows through the API

### Test Coverage Goals

- **Unit Tests**: 70%+ coverage
- **Integration Tests**: Critical business flows
- **E2E Tests**: All API endpoints

## Test Structure

All tests are organized in the `test/` directory:

```
test/
├── unit/                        # Unit tests
│   └── modules/
│       ├── product/
│       │   ├── commands/
│       │   ├── queries/
│       │   └── infrastructure/
│       └── order/
│           ├── commands/
│           ├── queries/
│           └── infrastructure/
├── integration/                 # Integration tests
│   └── modules/
│       ├── product/
│       └── order/
├── e2e/                        # E2E tests
│   ├── app.e2e-spec.ts
│   ├── products.e2e-spec.ts
│   └── orders.e2e-spec.ts
├── helpers/                    # Test utilities
│   ├── factories/
│   └── mock-prisma.service.ts
├── jest-integration.json       # Integration test config
└── jest-e2e.json              # E2E test config
```

This centralized structure:

- ✅ Keeps all tests in one place
- ✅ Mirrors the source code structure
- ✅ Makes tests easy to find and maintain
- ✅ Separates concerns by test type

## Test Types

### Unit Tests

Unit tests focus on testing individual components (handlers, repositories, services) in isolation using mocks.

**Location**: `test/unit/**/*.spec.ts`

**Examples**:

- Command/Query Handlers
- Repositories
- Mappers
- Entities
- Services

**Run Command**:

```bash
pnpm test
pnpm test:watch     # Watch mode
pnpm test:cov       # With coverage
```

### Integration Tests

Integration tests verify that different parts of a module work together correctly.

**Location**: `test/integration/**/*.integration-spec.ts`

**Examples**:

- Module-level tests
- CQRS flow tests
- Repository + Database tests

**Run Command**:

```bash
pnpm test:integration
```

### E2E Tests

E2E tests verify complete user flows through the HTTP API with a real database.

**Location**: `test/**/*.e2e-spec.ts`

**Examples**:

- API endpoint tests
- Complete workflows
- Error handling

**Run Command**:

```bash
pnpm test:e2e
```

## Running Tests

### All Tests

```bash
# Run all test suites
pnpm test:all

# Run all tests for CI
pnpm test:ci
```

### Individual Test Suites

```bash
# Unit tests
pnpm test

# Unit tests in watch mode
pnpm test:watch

# Unit tests with coverage
pnpm test:cov

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e
```

### Running Specific Tests

```bash
# Run tests in a specific file
pnpm test path/to/file.spec.ts

# Run tests matching a pattern
pnpm test --testNamePattern="ProductRepository"

# Run in debug mode
pnpm test:debug
```

## Writing Tests

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateProductHandler,
  CreateProductCommand,
} from './create-product.handler';
import { IProductRepository } from '../interfaces';
import { ProductFactory } from '../../../../test/helpers';

describe('CreateProductHandler', () => {
  let handler: CreateProductHandler;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductHandler,
        {
          provide: 'IProductRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    handler = module.get<CreateProductHandler>(CreateProductHandler);
  });

  it('should create a product successfully', async () => {
    // Arrange
    const command = new CreateProductCommand(
      'Test Product',
      'Description',
      100,
      10,
    );
    const mockProduct = ProductFactory.createProduct();
    mockRepository.create.mockResolvedValue(mockProduct);

    // Act
    const result = await handler.execute(command);

    // Assert
    expect(mockRepository.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
```

### Integration Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ProductModule } from './product.module';
import { ProductController } from './product.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';

describe('ProductModule Integration', () => {
  let controller: ProductController;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module = await Test.createTestingModule({
      imports: [ProductModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should create product through full flow', async () => {
    // Test complete CQRS flow
  });
});
```

### E2E Test Example

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Products API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /products', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send({ name: 'Test', price: 100, stock: 10 })
      .expect(201);
  });
});
```

## Test Helpers

### Factories

Located in `test/helpers/factories/`, factories provide reusable test data:

```typescript
import { ProductFactory, OrderFactory } from '../../../test/helpers';

// Create test entities
const product = ProductFactory.createProduct();
const productDto = ProductFactory.createProductDto();
const prismaProduct = ProductFactory.createPrismaProduct();

// With custom data
const customProduct = ProductFactory.createProduct({
  name: 'Custom Product',
  price: 200,
});
```

### Mock Prisma Service

```typescript
import { createMockPrismaService } from '../../../test/helpers';

const prismaMock = createMockPrismaService();
```

## Best Practices

### General

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One Assertion Per Test**: Focus each test on one behavior
3. **Clear Test Names**: Use descriptive names that explain what is being tested
4. **Independent Tests**: Tests should not depend on each other
5. **Clean Up**: Always clean up after tests (database, mocks, etc.)

### Unit Tests

1. **Mock Dependencies**: All external dependencies should be mocked
2. **Test Business Logic**: Focus on business rules and validations
3. **Edge Cases**: Test error conditions and boundary cases
4. **Fast Execution**: Unit tests should run quickly

### Integration Tests

1. **Test Interactions**: Verify components work together
2. **Use Test Database**: Use a separate test database
3. **Test Critical Flows**: Focus on important business workflows
4. **Module-Level**: Test at module boundaries

### E2E Tests

1. **Real Environment**: Use real database and HTTP server
2. **Complete Flows**: Test full user journeys
3. **Setup/Teardown**: Clean database between tests
4. **Error Scenarios**: Test error handling and edge cases

## Coverage Requirements

The project enforces minimum coverage thresholds:

```json
{
  "coverageThresholds": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}
```

View coverage report:

```bash
pnpm test:cov
open coverage/lcov-report/index.html
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Pipeline Stages

1. **Lint**: Code quality checks
2. **Unit Tests**: Run with coverage
3. **Integration Tests**: With PostgreSQL
4. **E2E Tests**: Full API testing
5. **Build**: Compile application

### Local CI Simulation

Run the same tests as CI:

```bash
pnpm test:ci
```

## Troubleshooting

### Tests Hanging

If tests hang, ensure:

- All async operations use `await`
- Test teardown properly closes connections
- No infinite loops in test code

### Database Connection Issues

For integration/e2e tests:

```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://user:pass@localhost:5432/testdb"

# Run migrations
pnpm prisma:migrate
```

### Mock Issues

If mocks aren't working:

- Verify mock setup in `beforeEach`
- Check that `jest.clearAllMocks()` is in `afterEach`
- Ensure correct provider tokens in tests

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)

## Test Commands Reference

```bash
# Development
pnpm test                    # Run unit tests
pnpm test:watch              # Run unit tests in watch mode
pnpm test:cov                # Run unit tests with coverage
pnpm test:debug              # Debug unit tests
pnpm test:integration        # Run integration tests
pnpm test:e2e                # Run e2e tests

# CI/CD
pnpm test:all                # Run all test suites
pnpm test:ci                 # Run all tests with coverage (CI mode)

# Utilities
pnpm run lint                # Run linter
pnpm run format              # Format code
```
