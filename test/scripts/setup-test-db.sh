#!/bin/bash

# Test Database Setup Script

echo "Setting up test database..."

# Check if .env.test exists
if [ ! -f .env.test ]; then
    echo "Creating .env.test file..."
    cat > .env.test << 'EOF'
DATABASE_URL="postgresql://admin:123456@localhost:5432/clean_architecture_test?schema=public"
NODE_ENV=test
EOF
fi

# Create test database (will fail silently if it already exists)
echo "Creating test database..."
PGPASSWORD=123456 createdb -U admin -h localhost clean_architecture_test 2>/dev/null || echo "Database may already exist"

# Run migrations on test database
echo "Running migrations on test database..."
DATABASE_URL="postgresql://admin:123456@localhost:5432/clean_architecture_test?schema=public" npx prisma migrate deploy

echo "✓ Test database setup complete!"
echo ""
echo "You can now run tests with:"
echo "  pnpm test:e2e"

