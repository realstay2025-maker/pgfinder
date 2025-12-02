#!/bin/bash

# Production deployment script
set -e

echo "🚀 Starting production deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | xargs)
fi

# Build frontend
echo "📦 Building frontend..."
cd client
npm ci --production
npm run build
cd ..

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🏥 Running health checks..."
curl -f http://localhost/api/health || exit 1

# Clean up old images
echo "🧹 Cleaning up..."
docker image prune -f

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running at: https://yourdomain.com"