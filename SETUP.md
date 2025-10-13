# Quick Setup Guide

## 🚀 Getting Started

### 1. Database Setup

First, make sure PostgreSQL is running on your machine. Then create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE clean_architecture;

# Exit
\q
```

### 2. Environment Configuration

Update the `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/clean_architecture?schema=public"
PORT=3000
```

### 3. Database Migration

Run the initial migration to create the Product table:

```bash
npx prisma migrate dev --name init
```

### 4. Start the Application

```bash
# Development mode with hot-reload
pnpm run start:dev
```

The application will be available at:

- API: http://localhost:3000
- Swagger UI: http://localhost:3000/api

## 📦 Package Versions

All packages are using the latest versions as of October 2025:

- **NestJS**: 10.x
- **Prisma**: 6.17.1
- **@nestjs/cqrs**: 11.0.3
- **@nestjs/config**: 4.0.2
- **@nestjs/swagger**: 11.2.0
- **TypeScript**: 5.9.3
- **Node**: 22.20.0
- **pnpm**: 10.18.2

## 🧪 Testing the API

### Create a Product

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MacBook Pro",
    "description": "M3 Max, 16-inch",
    "price": 2499.99,
    "stock": 10
  }'
```

### Get All Products

```bash
curl http://localhost:3000/products
```

### Get a Product by ID

```bash
curl http://localhost:3000/products/{product-id}
```

### Update a Product

```bash
curl -X PATCH http://localhost:3000/products/{product-id} \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2299.99,
    "stock": 15
  }'
```

### Delete a Product

```bash
curl -X DELETE http://localhost:3000/products/{product-id}
```

## 🛠️ Development Commands

```bash
# Start in dev mode (hot-reload)
pnpm run start:dev

# Build for production
pnpm run build

# Start production server
pnpm run start:prod

# Run tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Lint
pnpm run lint

# Format code
pnpm run format
```

## 🗄️ Prisma Commands

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Format schema file
npx prisma format
```

## 📁 Project Structure Overview

```
src/
├── modules/product/           # Product module (CQRS pattern)
│   ├── commands/             # Write operations
│   │   ├── handlers/        # Command handlers
│   │   └── *.command.ts     # Command definitions
│   ├── queries/             # Read operations
│   │   ├── handlers/        # Query handlers
│   │   └── *.query.ts       # Query definitions
│   ├── dtos/                # Data Transfer Objects
│   ├── product.controller.ts
│   ├── product.repository.ts
│   └── product.module.ts
├── shared/                   # Shared utilities
│   ├── interfaces/          # Common interfaces
│   ├── exceptions/          # Custom exceptions
│   └── filters/             # Global filters
├── prisma/                   # Prisma service
└── main.ts                   # Application entry point
```

## ✅ What's Included

- ✅ Clean Architecture with CQRS
- ✅ Complete Product CRUD operations
- ✅ Input validation with class-validator
- ✅ Swagger API documentation
- ✅ Global exception handling
- ✅ Repository pattern
- ✅ Type-safe database access with Prisma
- ✅ Environment configuration
- ✅ CORS enabled
- ✅ Production-ready structure

## 🎯 Next Steps

1. Add authentication (JWT, Passport)
2. Add more modules following the same pattern
3. Add unit and e2e tests
4. Set up CI/CD pipeline
5. Add logging (Winston, Pino)
6. Add caching (Redis)
7. Add rate limiting
8. Add database seeding

## 📝 Notes

- The project uses UUID for primary keys
- Timestamps (createdAt, updatedAt) are automatically managed
- All endpoints are validated using DTOs
- Repository pattern allows easy mocking for tests
- CQRS pattern separates reads and writes for better scalability
