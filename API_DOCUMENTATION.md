# Movie Hub API Documentation

Complete API documentation for the Movie Hub application.

## Base URL

```
http://localhost:8080/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-20T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `400` - Validation errors or user already exists
- `500` - Internal server error

---

### Login User

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

**Error Responses:**

- `401` - Invalid credentials
- `400` - Validation errors

---

## 🎬 Movie Endpoints

### Get Movies (Paginated)

**GET** `/movies`

Retrieve movies with optional filtering, searching, and sorting.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by movie title
- `genres` (string, optional): Comma-separated genre IDs (e.g., "28,12,16")
- `sortBy` (string, optional): Sort field (`title`, `releaseDate`, `popularity`, `voteAverage`)
- `sortOrder` (string, optional): Sort direction (`ASC`, `DESC`)
- `minRating` (number, optional): Minimum vote average (0-10)
- `maxRating` (number, optional): Maximum vote average (0-10)
- `year` (number, optional): Release year
- `language` (string, optional): Original language code

**Example Request:**

```
GET /movies?page=1&limit=20&search=batman&genres=28,12&sortBy=popularity&sortOrder=DESC&minRating=7
```

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "tmdbId": 155,
      "title": "The Dark Knight",
      "overview": "Batman raises the stakes...",
      "posterPath": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      "backdropPath": "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
      "releaseDate": "2008-07-18",
      "voteAverage": 8.5,
      "voteCount": 32000,
      "popularity": 98.5,
      "originalLanguage": "en",
      "runtime": 152,
      "budget": 185000000,
      "revenue": 1004934033,
      "genres": [
        {
          "id": 1,
          "tmdbId": 28,
          "name": "Action"
        },
        {
          "id": 2,
          "tmdbId": 80,
          "name": "Crime"
        }
      ],
      "averageRating": 8.7,
      "totalRatings": 150
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 20,
  "totalPages": 25
}
```

---

### Get Movie by ID

**GET** `/movies/:id`

Retrieve a specific movie by its ID.

**Parameters:**

- `id` (number): Movie ID

**Response (200):**

```json
{
  "id": 1,
  "tmdbId": 155,
  "title": "The Dark Knight",
  "overview": "Batman raises the stakes in his war on crime...",
  "posterPath": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  "backdropPath": "/hqkIcbrOHL86UncnHIsHVcVmzue.jpg",
  "releaseDate": "2008-07-18",
  "voteAverage": 8.5,
  "voteCount": 32000,
  "popularity": 98.5,
  "originalLanguage": "en",
  "runtime": 152,
  "budget": 185000000,
  "revenue": 1004934033,
  "genres": [
    {
      "id": 1,
      "tmdbId": 28,
      "name": "Action"
    },
    {
      "id": 2,
      "tmdbId": 80,
      "name": "Crime"
    }
  ],
  "averageRating": 8.7,
  "totalRatings": 150
}
```

**Error Responses:**

- `404` - Movie not found

---

## ⭐ Rating Endpoints

### Create Rating

**POST** `/ratings` 🔒

Rate a movie (requires authentication).

**Request Body:**

```json
{
  "movieId": 1,
  "rating": 8,
  "review": "Amazing movie! Christopher Nolan at his best."
}
```

**Response (201):**

```json
{
  "id": 1,
  "rating": 8,
  "review": "Amazing movie! Christopher Nolan at his best.",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T10:30:00.000Z",
  "movie": {
    "id": 1,
    "title": "The Dark Knight"
  },
  "user": {
    "id": 1,
    "username": "johndoe"
  }
}
```

**Error Responses:**

- `400` - Invalid rating (must be 1-10) or movie not found
- `401` - Unauthorized
- `409` - User has already rated this movie

---

### Get User Ratings

**GET** `/ratings` 🔒

Get all ratings by the authenticated user.

**Query Parameters:**

- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "rating": 8,
      "review": "Amazing movie!",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "movie": {
        "id": 1,
        "title": "The Dark Knight",
        "posterPath": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
      }
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

---

### Update Rating

**PUT** `/ratings/:id` 🔒

Update an existing rating (only by the rating owner).

**Parameters:**

- `id` (number): Rating ID

**Request Body:**

```json
{
  "rating": 9,
  "review": "Even better on second viewing!"
}
```

**Response (200):**

```json
{
  "id": 1,
  "rating": 9,
  "review": "Even better on second viewing!",
  "createdAt": "2024-01-20T10:30:00.000Z",
  "updatedAt": "2024-01-20T15:45:00.000Z",
  "movie": {
    "id": 1,
    "title": "The Dark Knight"
  }
}
```

**Error Responses:**

- `404` - Rating not found
- `403` - Not authorized to update this rating

---

### Delete Rating

**DELETE** `/ratings/:id` 🔒

Delete a rating (only by the rating owner).

**Parameters:**

- `id` (number): Rating ID

**Response (200):**

```json
{
  "message": "Rating deleted successfully"
}
```

---

## 📝 Watchlist Endpoints

### Add to Watchlist

**POST** `/watchlist` 🔒

Add a movie to user's watchlist or favorites.

**Request Body:**

```json
{
  "movieId": 1,
  "type": "watchlist"
}
```

**Valid Types:**

- `watchlist` - Movies to watch later
- `favorites` - Favorite movies

**Response (201):**

```json
{
  "id": 1,
  "type": "watchlist",
  "addedAt": "2024-01-20T10:30:00.000Z",
  "movie": {
    "id": 1,
    "title": "The Dark Knight",
    "posterPath": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "releaseDate": "2008-07-18",
    "voteAverage": 8.5
  }
}
```

**Error Responses:**

- `400` - Movie not found or invalid type
- `409` - Movie already in watchlist/favorites

---

### Get User Watchlist

**GET** `/watchlist` 🔒

Get user's watchlist and/or favorites.

**Query Parameters:**

- `type` (string, optional): Filter by type (`watchlist`, `favorites`)
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response (200):**

```json
{
  "data": [
    {
      "id": 1,
      "type": "watchlist",
      "addedAt": "2024-01-20T10:30:00.000Z",
      "movie": {
        "id": 1,
        "title": "The Dark Knight",
        "posterPath": "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        "releaseDate": "2008-07-18",
        "voteAverage": 8.5,
        "genres": [
          {
            "id": 1,
            "name": "Action"
          }
        ]
      }
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10,
  "totalPages": 2
}
```

---

### Remove from Watchlist

**DELETE** `/watchlist/:id` 🔒

Remove a movie from watchlist/favorites.

**Parameters:**

- `id` (number): Watchlist entry ID

**Response (200):**

```json
{
  "message": "Movie removed from watchlist successfully"
}
```

---

### Get Watchlist Statistics

**GET** `/watchlist/stats` 🔒

Get user's watchlist statistics.

**Response (200):**

```json
{
  "totalWatchlist": 12,
  "totalFavorites": 8,
  "totalMovies": 20,
  "genreBreakdown": [
    {
      "genre": "Action",
      "count": 6
    },
    {
      "genre": "Drama",
      "count": 4
    }
  ],
  "averageRating": 7.8
}
```

---

## 🏷️ Genre Endpoints

### Get All Genres

**GET** `/movies/genres`

Get all available movie genres.

**Response (200):**

```json
[
  {
    "id": 1,
    "tmdbId": 28,
    "name": "Action"
  },
  {
    "id": 2,
    "tmdbId": 12,
    "name": "Adventure"
  },
  {
    "id": 3,
    "tmdbId": 16,
    "name": "Animation"
  }
]
```

---

## 📊 Error Response Format

All error responses follow this format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email must be a valid email address"
    }
  ]
}
```

---

## 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **Search endpoints**: 50 requests per minute per user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

---

## 📝 Notes

1. **Pagination**: All list endpoints support pagination with `page` and `limit` parameters
2. **Caching**: Frequently accessed data is cached with Redis for better performance
3. **TMDB Sync**: Movie data is automatically synchronized from TMDB API
4. **Search**: Search functionality uses full-text search for optimal performance
5. **Validation**: All request data is validated using class-validator
6. **Security**: All sensitive endpoints require valid JWT authentication

---

## 🛠️ Testing the API

### Using cURL

**Register a user:**

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get movies (with token):**

```bash
curl -X GET "http://localhost:8080/movies?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import the API collection (if available)
2. Set up environment variables:
   - `base_url`: `http://localhost:8080`
   - `token`: Your JWT token after login
3. Use the collection to test all endpoints

---

For additional support or questions, please refer to the main [README.md](./README.md) file.
