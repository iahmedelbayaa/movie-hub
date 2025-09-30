# Movie Hub - TMDB Integration Application

A full-stack NestJS application that integrates with The Movie Database (TMDB) API to provide a comprehensive movie management system with ratings, watchlists, and advanced search capabilities.

## 🚀 Features

- **🎬 Movie Management**: Browse, search, and filter movies from TMDB
- **⭐ Rating System**: Rate movies and view average ratings
- **📝 Watchlist & Favorites**: Personal movie lists management
- **🔍 Advanced Search**: Search by title, genre, and various filters
- **📄 Pagination**: Efficient data loading with pagination
- **🔒 Authentication**: JWT-based secure user authentication
- **⚡ Caching**: Redis-powered caching for optimal performance
- **🐳 Docker Ready**: Complete containerization with Docker Compose
- **📊 Database**: PostgreSQL with TypeORM
- **🧪 Testing**: Comprehensive unit test suite (85%+ coverage)

## 🏗️ Architecture

```
src/
├── controllers/        # REST API controllers
├── services/          # Business logic services
├── entities/          # TypeORM database entities
├── dtos/             # Data Transfer Objects
├── modules/          # NestJS modules
├── strategies/       # Authentication strategies
└── guards/           # Authorization guards
```

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- TMDB API Key (free at https://www.themoviedb.org/)

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/iahmedelbayaa/movie-hub.git
cd movie-hub
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# TMDB Configuration
TMDB_API_KEY=your-tmdb-api-key-here
TMDB_BASE_URL=https://api.themoviedb.org/3

# Application Configuration
PORT=3000
NODE_ENV=development
```

### 3. Get TMDB API Key

1. Visit [TMDB Website](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API → Create API Key
4. Copy your API key to the `.env` file

### 4. Run with Docker Compose

```bash
docker-compose up --build
```

The application will be available at: **http://localhost:8080**

## 🔧 Development Setup

### Install Dependencies

```bash
npm install
```

### Run Locally (requires PostgreSQL and Redis)

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### Testing

```bash
# Unit tests
npm test

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Movie Endpoints

#### Get Movies (with pagination, search, filters)

```http
GET /movies?page=1&limit=10&search=batman&genres=28,12&sortBy=popularity&sortOrder=DESC
```

#### Get Movie by ID

```http
GET /movies/:id
```

### Rating Endpoints

#### Rate a Movie

```http
POST /ratings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "movieId": 1,
  "rating": 8,
  "review": "Great movie!"
}
```

### Watchlist Endpoints

#### Add to Watchlist

```http
POST /watchlist
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "movieId": 1,
  "type": "watchlist"
}
```

## 🧪 Testing

The project includes comprehensive unit tests covering:

- **Services**: Business logic testing
- **Controllers**: API endpoint testing
- **Authentication**: JWT and security testing
- **Database**: Repository and entity testing

```bash
# Run all tests
npm test

# Run with coverage (target: 85%+)
npm run test:cov

# Watch mode for development
npm run test:watch
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=very-secure-production-secret
DATABASE_PASSWORD=secure-production-password
```

### Docker Production Build

```bash
# Build production image
docker build -t movie-hub:prod .

# Run with production environment
docker-compose -f docker-compose.prod.yml up
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: class-validator for request validation
- **CORS Protection**: Configurable CORS policies
- **Rate Limiting**: Redis-based rate limiting (configurable)

## ⚡ Performance Features

- **Redis Caching**: Automatic caching of frequently accessed data
- **Database Indexing**: Optimized database queries
- **Pagination**: Efficient data loading
- **Query Optimization**: TypeORM query optimization

## 🛠️ Tech Stack

- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT with Passport
- **Testing**: Jest
- **Containerization**: Docker & Docker Compose
- **API Integration**: TMDB API
- **Validation**: class-validator

## 📊 Database Schema

### Core Entities

- **Users**: User accounts and authentication
- **Movies**: Movie data synchronized from TMDB
- **Genres**: Movie genre classifications
- **Ratings**: User movie ratings and reviews
- **UserWatchlist**: Personal movie lists and favorites

## 🔄 Data Synchronization

The application automatically synchronizes with TMDB:

- **Initial Sync**: On application startup
- **Scheduled Sync**: Daily at 2 AM (configurable)
- **Incremental Updates**: Efficient updates for existing movies
- **Genre Management**: Automatic genre synchronization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie data API
- [NestJS](https://nestjs.com/) for the excellent framework
- [TypeORM](https://typeorm.io/) for database management

---

**Happy Coding! 🚀**
