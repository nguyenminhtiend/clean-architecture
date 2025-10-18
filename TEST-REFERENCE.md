# Quick Test Reference

## Test Commands

```bash
# Unit Tests
pnpm test                      # Run all unit tests
pnpm test:watch                # Watch mode
pnpm test:cov                  # With coverage
pnpm test -- product           # Run tests matching "product"

# Integration Tests
pnpm test:integration          # Run all integration tests

# E2E Tests
pnpm test:e2e                  # Run all E2E tests

# All Tests
pnpm test:all                  # Run unit + integration + e2e
pnpm test:ci                   # CI mode (all tests + coverage)
```

## Test Structure

```
├── test/
│   ├── unit/                                                # Unit tests
│   │   └── modules/
│   │       ├── product/
│   │       │   ├── commands/
│   │       │   │   └── create-product.handler.spec.ts      # Unit test
│   │       │   ├── queries/
│   │       │   │   └── get-product.handler.spec.ts         # Unit test
│   │       │   └── infrastructure/
│   │       │       └── repositories/
│   │       │           └── product.repository.spec.ts      # Unit test
│   │       └── order/
│   │           └── [similar structure]
│   ├── integration/                                         # Integration tests
│   │   └── modules/
│   │       ├── product/
│   │       │   └── product.module.integration-spec.ts      # Integration test
│   │       └── order/
│   │           └── order.module.integration-spec.ts        # Integration test
│   ├── e2e/                                                # E2E tests
│   │   ├── app.e2e-spec.ts
│   │   ├── products.e2e-spec.ts
│   │   └── orders.e2e-spec.ts
│   └── helpers/                                            # Test utilities
│       ├── factories/                                      # Test data factories
│       │   ├── product.factory.ts
│       │   └── order.factory.ts
│       └── mock-prisma.service.ts                          # Mock helpers
```

## Test Types by File Extension

- `*.spec.ts` → Unit tests
- `*.integration-spec.ts` → Integration tests
- `*.e2e-spec.ts` → E2E tests

## Coverage

View coverage report:

```bash
pnpm test:cov
open coverage/lcov-report/index.html
```

Minimum thresholds:

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Common Patterns

### Unit Test Template

```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<DependencyType>;

  beforeEach(async () => {
    mockDependency = { method: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        ServiceName,
        { provide: 'DEPENDENCY', useValue: mockDependency },
      ],
    }).compile();
    service = module.get(ServiceName);
  });

  it('should do something', async () => {
    // Arrange
    mockDependency.method.mockResolvedValue(expectedValue);

    // Act
    const result = await service.doSomething();

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

### Integration Test Template

```typescript
describe('ModuleName Integration', () => {
  let app: TestingModule;
  let controller: ControllerName;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();
    app = await Test.createTestingModule({
      imports: [ModuleName],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    controller = app.get(ControllerName);
  });

  it('should handle complete flow', async () => {
    // Test end-to-end module flow
  });
});
```

### E2E Test Template

```typescript
describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('POST /endpoint', () => {
    return request(app.getHttpServer())
      .post('/endpoint')
      .send({ data: 'test' })
      .expect(201);
  });
});
```

## Test Factories

```typescript
// Product test data
import { ProductFactory } from '../../../test/helpers';

const product = ProductFactory.createProduct();
const productDto = ProductFactory.createProductDto();
const prismaProduct = ProductFactory.createPrismaProduct();

// With overrides
const customProduct = ProductFactory.createProduct({
  name: 'Custom Name',
  price: 999,
});
```

## Debugging Tests

```bash
# Debug single test
pnpm test:debug -- --testNamePattern="test name"

# Run with verbose output
pnpm test -- --verbose

# Run specific file
pnpm test src/modules/product/commands/create-product.handler.spec.ts
```

## CI/CD Integration

Tests run automatically on:

- Push to main/develop
- Pull requests

Pipeline stages:

1. Lint
2. Unit tests (with coverage)
3. Integration tests (with PostgreSQL)
4. E2E tests (with PostgreSQL)
5. Build

## Tips

1. **Keep tests fast** - Mock external dependencies
2. **Test behavior, not implementation** - Focus on what, not how
3. **Use descriptive names** - Test name should explain what it tests
4. **One assertion per test** - Keep tests focused
5. **AAA pattern** - Arrange, Act, Assert
6. **Clean up** - Use afterEach/afterAll properly
7. **Avoid test interdependence** - Tests should run independently
