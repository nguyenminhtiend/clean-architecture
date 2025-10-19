# CI/CD Setup Guide

## Overview

This project has been configured with comprehensive code quality tools and CI/CD best practices.

## Available Scripts

### Development Scripts

- `pnpm format` - Format code with Prettier (auto-fix)
- `pnpm lint` - Lint code with ESLint (auto-fix)
- `pnpm build` - Build the project

### CI/CD Scripts

- `pnpm format:check` - Check code formatting (no auto-fix)
- `pnpm lint:check` - Check linting (no auto-fix)
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm validate` - Run all checks (lint, format, typecheck)
- `pnpm ci` - Full CI pipeline (validate + build + test)
- `pnpm test:ci` - Run all tests with coverage

## Tools & Configuration

### 1. Prettier (Code Formatting)

- **Config**: `.prettierrc`
- **Ignore**: `.prettierignore`
- **Settings**: Single quotes, trailing commas, 100 char width, LF line endings (only non-default values)

### 2. ESLint (Linting)

- **Config**: `eslint.config.mjs`
- **Rules**: TypeScript ESLint + Prettier integration
- **Type-aware linting enabled**

### 3. TypeScript (Type Checking)

- **Config**: `tsconfig.json`
- **Strict Config**: `tsconfig.strict.json` (for gradual adoption)
- Current settings: Moderate strictness
- Strict settings available in `tsconfig.strict.json` for future migration

### 4. EditorConfig

- **Config**: `.editorconfig`
- Ensures consistent coding styles across editors

### 5. Node Version Management

- **Files**: `.nvmrc` and `.node-version`
- Specifies Node.js 20

## GitHub Actions CI Workflow

The project includes a complete CI workflow in `.github/workflows/ci.yml`:

### Features:

- ✅ Runs on push/PR to main and develop branches
- ✅ PostgreSQL service container for tests
- ✅ pnpm package manager
- ✅ Node.js 22
- ✅ Prisma migrations
- ✅ All quality checks (lint, format, typecheck)
- ✅ Build verification
- ✅ Full test suite (unit + integration + e2e)
- ✅ Coverage reporting to Codecov

### Required GitHub Secrets:

None required for basic CI. Optional:

- `CODECOV_TOKEN` - For Codecov integration

## Local Development Workflow

### Before Committing:

```bash
# Run all checks
pnpm validate

# Or run individually
pnpm lint:check
pnpm format:check
pnpm typecheck
```

### Fix Issues:

```bash
# Auto-fix linting issues
pnpm lint

# Auto-fix formatting issues
pnpm format
```

### Full CI Test Locally:

```bash
pnpm ci
```

## Pre-commit Hooks (Optional)

To add pre-commit hooks with Husky:

```bash
# Install Husky
pnpm add -D husky lint-staged

# Initialize Husky
npx husky init

# Add pre-commit hook
echo "pnpm validate" > .husky/pre-commit
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.ts": ["eslint --fix", "prettier --write"]
  }
}
```

## Migration to Stricter TypeScript

To adopt stricter TypeScript settings:

1. Use `tsconfig.strict.json` for the build:

```json
// In package.json, update scripts:
"typecheck": "tsc --noEmit -p tsconfig.strict.json"
```

2. Fix errors incrementally
3. Once all errors are fixed, merge `tsconfig.strict.json` settings into `tsconfig.json`

## Best Practices

1. **Never commit without validation**
   - Always run `pnpm validate` before committing

2. **Keep dependencies updated**
   - Regularly update dependencies for security fixes

3. **Write tests**
   - Maintain high test coverage
   - Run `pnpm test:ci` to check coverage

4. **Follow the code style**
   - Let Prettier handle formatting
   - Let ESLint catch issues

5. **Type safety**
   - Fix TypeScript errors immediately
   - Don't use `any` unless necessary

## Troubleshooting

### ESLint Warning about .eslintignore

The `.eslintignore` file is deprecated in ESLint 9+. Ignore this warning - we've configured ignores in `eslint.config.mjs`.

### TypeScript Errors After Update

Run `pnpm typecheck` to see all errors. Fix them one by one.

### Tests Failing

Ensure your database is set up:

```bash
# Set up test database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test_db" pnpm prisma:migrate
```

## CI Pipeline Flow

```
Push/PR → GitHub Actions
  ↓
Install Dependencies (pnpm)
  ↓
Generate Prisma Client
  ↓
Run Migrations
  ↓
Lint Check (eslint)
  ↓
Format Check (prettier)
  ↓
Type Check (tsc)
  ↓
Build (nest build)
  ↓
Test Suite (jest)
  ├── Unit Tests
  ├── Integration Tests
  └── E2E Tests
  ↓
Coverage Report (codecov)
  ↓
✅ Success / ❌ Failure
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://typescript-eslint.io/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
