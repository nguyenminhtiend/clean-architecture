# CI/CD Guide

This document explains the Continuous Integration and Continuous Deployment setup for this project.

## Overview

This project uses GitHub Actions for CI/CD automation. The pipeline ensures code quality, runs comprehensive tests, and prepares the application for deployment.

## Pipeline Stages

### 1. Lint

- **Purpose**: Ensure code quality and consistency
- **Actions**:
  - ESLint checks
  - Prettier formatting checks
- **Trigger**: On every push and PR
- **Duration**: ~1-2 minutes

### 2. Unit Tests

- **Purpose**: Verify individual components work correctly
- **Actions**:
  - Run Jest unit tests
  - Generate coverage report
  - Upload to Codecov (optional)
- **Requirements**: None
- **Duration**: ~2-3 minutes

### 3. Integration Tests

- **Purpose**: Verify module interactions
- **Actions**:
  - Spin up PostgreSQL container
  - Run Prisma migrations
  - Execute integration tests
- **Requirements**: PostgreSQL database
- **Duration**: ~3-4 minutes

### 4. E2E Tests

- **Purpose**: Test complete API workflows
- **Actions**:
  - Spin up PostgreSQL container
  - Run Prisma migrations
  - Execute E2E tests with real HTTP server
- **Requirements**: PostgreSQL database
- **Duration**: ~3-5 minutes

### 5. Build

- **Purpose**: Verify application builds successfully
- **Actions**:
  - Compile TypeScript
  - Generate production artifacts
  - Upload build artifacts
- **Requirements**: All previous stages pass
- **Duration**: ~2-3 minutes

## Workflow Files

### Main CI/CD Pipeline

`.github/workflows/ci-cd.yml`

Runs on:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

### Dependabot Auto-merge

`.github/workflows/dependabot.yml`

Automatically approves and merges:

- Patch version updates
- Security updates

### Dependabot Configuration

`.github/dependabot.yml`

Manages:

- npm dependencies (weekly)
- GitHub Actions updates (weekly)

## Environment Variables

### Required for CI

```yaml
DATABASE_URL: 'postgresql://testuser:testpass@localhost:5432/testdb'
```

### Optional

```yaml
CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }} # For coverage reports
```

## Setup Instructions

### 1. Enable GitHub Actions

1. Go to your repository settings
2. Navigate to Actions → General
3. Enable "Allow all actions and reusable workflows"

### 2. Configure Secrets (Optional)

For Codecov integration:

1. Sign up at [codecov.io](https://codecov.io)
2. Add repository
3. Copy the token
4. Add to GitHub: Settings → Secrets → New repository secret
   - Name: `CODECOV_TOKEN`
   - Value: Your Codecov token

### 3. Branch Protection Rules

Recommended settings for `main` branch:

1. Go to Settings → Branches
2. Add rule for `main`
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Status checks: lint, unit-tests, integration-tests, e2e-tests, build

## Local CI Simulation

Run the same checks as CI locally:

```bash
# 1. Lint
pnpm run lint
pnpm run format

# 2. Unit tests with coverage
pnpm run test:cov

# 3. Integration tests
export DATABASE_URL="postgresql://user:pass@localhost:5432/testdb"
pnpm run prisma:migrate
pnpm run test:integration

# 4. E2E tests
pnpm run test:e2e

# 5. Build
pnpm run build

# Or run everything at once
pnpm run test:ci
```

## Monitoring

### View Pipeline Status

1. Go to your repository
2. Click "Actions" tab
3. View all workflow runs

### Badge Setup

Add CI status badge to README.md:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
```

### Coverage Badge

If using Codecov:

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)
```

## Deployment (Optional)

### Setup Deployment

Uncomment the deploy job in `.github/workflows/ci-cd.yml`:

```yaml
deploy:
  name: Deploy to Environment
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: dist
        path: dist/

    - name: Deploy to server
      run: |
        # Add your deployment script here
        # Examples:
        # - Deploy to Heroku
        # - Deploy to AWS
        # - Deploy to DigitalOcean
        # - Deploy to Vercel
        # - Deploy via SSH
```

### Deployment Options

1. **Heroku**

```yaml
- uses: akhileshns/heroku-deploy@v3.12.14
  with:
    heroku_api_key: ${{secrets.HEROKU_API_KEY}}
    heroku_app_name: 'your-app-name'
    heroku_email: 'your-email@example.com'
```

2. **AWS ECS**

```yaml
- name: Deploy to Amazon ECS
  uses: aws-actions/amazon-ecs-deploy-task-definition@v1
  with:
    task-definition: task-definition.json
    service: your-service
    cluster: your-cluster
```

3. **Docker Registry**

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    push: true
    tags: user/app:latest
```

## Optimization Tips

### Speed Up Pipeline

1. **Cache Dependencies**
   - Already configured with `cache: 'pnpm'`

2. **Parallel Jobs**
   - Unit tests run independently
   - Integration and E2E tests run in parallel

3. **Matrix Strategy** (for multiple Node versions)

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]
```

### Reduce Costs

1. **Skip CI on docs**

```yaml
on:
  push:
    paths-ignore:
      - '**.md'
      - 'docs/**'
```

2. **Conditional Jobs**

```yaml
if: github.event_name == 'pull_request'
```

## Troubleshooting

### Tests Failing in CI but Pass Locally

Common causes:

- Timezone differences
- Environment variables not set
- Database connection issues
- Race conditions in tests

Solutions:

```bash
# Run tests with same environment as CI
NODE_ENV=test pnpm test:ci
```

### PostgreSQL Connection Issues

Check:

- Service container health checks
- Port mappings
- DATABASE_URL format

### Timeout Issues

Increase timeout for long-running tests:

```yaml
- name: Run E2E tests
  run: pnpm run test:e2e
  timeout-minutes: 15 # Default is 360
```

## Best Practices

1. **Keep Workflows Fast**: Aim for < 10 minutes total
2. **Fail Fast**: Run quick checks (lint) first
3. **Parallel Execution**: Run independent jobs in parallel
4. **Cache Dependencies**: Use pnpm/npm cache
5. **Secure Secrets**: Never commit secrets, use GitHub Secrets
6. **Test Locally**: Use `act` to test workflows locally
7. **Monitor Costs**: Review GitHub Actions usage monthly

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NestJS Deployment](https://docs.nestjs.com/deployment)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)

## Support

If you encounter issues with CI/CD:

1. Check workflow logs in GitHub Actions
2. Run tests locally with `pnpm test:ci`
3. Verify environment variables
4. Check service container logs
5. Review recent workflow changes
