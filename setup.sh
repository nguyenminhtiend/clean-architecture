#!/bin/bash

echo "🚀 Setting up Clean Architecture NestJS Project..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one from .env.example"
    echo "   cp .env.example .env"
    echo "   Then update DATABASE_URL with your PostgreSQL credentials"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🔄 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "   1. Start the dev server: pnpm run start:dev"
echo "   2. Visit http://localhost:3000/api for Swagger documentation"
echo "   3. Test the API endpoints"
echo ""
echo "📚 For more information, check:"
echo "   - README.md for project overview"
echo "   - SETUP.md for detailed setup guide"
echo ""

