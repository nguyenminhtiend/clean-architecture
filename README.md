# Clean Architecture NestJS Project

A NestJS boilerplate project built with Clean Architecture principles, CQRS pattern, and Prisma ORM.

## Tech Stack

- **NestJS** 10.x - Progressive Node.js framework
- **Prisma** 6.x - Next-generation ORM
- **PostgreSQL** - Database
- **TypeScript** 5.x
- **pnpm** - Fast, disk space efficient package manager
- **Node** 22.x

## Features

- ✅ Clean Architecture with CQRS pattern
- ✅ Command and Query separation
- ✅ DTOs with validation (class-validator)
- ✅ Swagger API documentation
- ✅ Global exception filters
- ✅ Repository pattern for data access
- ✅ Environment configuration
- ✅ Type-safe Prisma ORM
- ✅ Comprehensive testing (Unit, Integration, E2E)
- ✅ CI/CD with GitHub Actions
- ✅ Test coverage reporting
- ✅ Automated dependency updates
- ✅ Docker multi-stage builds with pnpm 10
- ✅ Kubernetes manifests with health probes
- ✅ Health check endpoint (`/healthz`)

## Project Structure

```
src/
├── modules/
│   └── product/
│       ├── commands/              # Write operations
│       │   ├── handlers/         # Command handlers
│       │   └── *.command.ts      # Command definitions
│       ├── queries/               # Read operations
│       │   ├── handlers/         # Query handlers
│       │   └── *.query.ts        # Query definitions
│       ├── dtos/                  # Data Transfer Objects
│       ├── product.controller.ts  # HTTP endpoints
│       ├── product.repository.ts  # Data access layer
│       └── product.module.ts      # Module configuration
├── shared/
│   ├── interfaces/               # Shared interfaces
│   ├── exceptions/               # Custom exceptions
│   └── filters/                  # Global filters
├── prisma/
│   └── prisma.service.ts        # Prisma client service
├── app.module.ts
└── main.ts

test/
├── unit/                         # Unit tests mirror src structure
│   └── modules/
│       ├── product/
│       └── order/
├── integration/                  # Integration tests
├── e2e/                         # End-to-end tests
└── helpers/                     # Test utilities & factories
```

## Setup

### Prerequisites

- Node.js 22.x
- PostgreSQL
- pnpm

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
cp .env.example .env
# Update DATABASE_URL with your PostgreSQL credentials
```

3. Run database migrations:

```bash
npx prisma migrate dev --name init
```

4. Generate Prisma client:

```bash
npx prisma generate
```

## Running the Application

### Development

```bash
pnpm run start:dev
```

### Production

```bash
pnpm run build
pnpm run start:prod
```

### Docker

```bash
# Production with Docker Compose
docker-compose up -d

# Development with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Build Docker image
docker build -t clean-architecture:latest .
```

See [DOCKER.md](./DOCKER.md) for detailed Docker documentation.

## API Documentation

Once the application is running, access Swagger documentation at:

```
http://localhost:3000/api
```

## API Endpoints

### Health

- `GET /healthz` - Health check endpoint for K8s liveness/readiness probes

### Products

- `POST /products` - Create a new product
- `GET /products` - List all products (supports pagination with `skip` and `take`)
- `GET /products/:id` - Get a product by ID
- `PATCH /products/:id` - Update a product
- `DELETE /products/:id` - Delete a product

### Example Request

**Create Product:**

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 1299.99,
    "stock": 50
  }'
```

## Database

### Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema
npx prisma format
```

## Testing

This project includes comprehensive testing at three levels:

```bash
# Unit tests
pnpm test                    # Run unit tests
pnpm test:watch              # Run in watch mode
pnpm test:cov                # Run with coverage

# Integration tests
pnpm test:integration        # Test module interactions

# E2E tests
pnpm test:e2e                # Test complete API flows

# Run all tests
pnpm test:all                # Run all test suites
pnpm test:ci                 # Run all tests (CI mode)
```

For detailed testing documentation, see [TESTING.md](./TESTING.md).

## CI/CD

This project includes a complete CI/CD pipeline with GitHub Actions:

- ✅ Automated testing on all PRs
- ✅ Code quality checks (ESLint, Prettier)
- ✅ Test coverage reporting
- ✅ Automated dependency updates (Dependabot)
- ✅ Build verification

For CI/CD setup and configuration, see [CI-CD.md](./CI-CD.md).

## Deployment

### Docker Deployment

See [DOCKER.md](./DOCKER.md) for complete Docker documentation including:

- Multi-stage production builds
- Development environment setup
- Best practices and optimization

### Kubernetes Deployment

Kubernetes manifests are available in the `k8s/` directory:

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

See [k8s/README.md](./k8s/README.md) for complete Kubernetes deployment guide including:

- Deployment with liveness/readiness probes
- Horizontal Pod Autoscaler (HPA)
- Ingress configuration
- Database setup with persistent storage

## Adding a New Module

To add a new module following the same pattern:

1. Create module directory structure:

```bash
mkdir -p src/modules/your-module/{commands/handlers,queries/handlers,dtos}
```

2. Create the following files:
   - Commands and handlers
   - Queries and handlers
   - DTOs (create, update, response)
   - Repository
   - Controller
   - Module

3. Add the module to `app.module.ts`

4. Update Prisma schema and run migration

## Architecture Principles

### CQRS Pattern

- **Commands**: Handle write operations (create, update, delete)
- **Queries**: Handle read operations (get, list)
- Separation ensures scalability and maintainability

### Repository Pattern

- Abstracts data access logic
- Makes testing easier with mock repositories
- Single source of truth for data operations

### DTOs (Data Transfer Objects)

- Validate incoming data
- Transform data shape
- API documentation via decorators

## License

MIT
