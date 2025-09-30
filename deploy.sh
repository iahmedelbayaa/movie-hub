#!/bin/bash

# Movie Hub Deployment Script
echo "🚀 Starting Movie Hub deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with the required environment variables."
    echo "See README.md for details."
    exit 1
fi

# Check if TMDB_API_KEY is set
if ! grep -q "TMDB_API_KEY=" .env || grep -q "TMDB_API_KEY=$" .env; then
    echo "❌ Error: TMDB_API_KEY not set in .env file!"
    echo "Please add your TMDB API key to the .env file."
    echo "Get your free API key at: https://www.themoviedb.org/"
    exit 1
fi

echo "✅ Environment configuration check passed"

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional - uncomment if needed)
# echo "🧹 Cleaning up old images..."
# docker image prune -f

# Build and start containers
echo "🏗️  Building and starting containers..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Show container status
echo "📊 Container status:"
docker-compose ps

# Check if containers are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Application is available at:"
    echo "   http://localhost:8080"
    echo ""
    echo "📊 Monitor logs with:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 Stop the application with:"
    echo "   docker-compose down"
else
    echo "❌ Deployment failed!"
    echo "Check the logs with: docker-compose logs"
    exit 1
fi