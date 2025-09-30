# Movie Hub API - Postman Collection

This directory contains a comprehensive Postman collection for testing the Movie Hub API.

## 📁 Files Included

1. **`Movie-Hub-API.postman_collection.json`** - Main API collection with all endpoints
2. **`Movie-Hub-Environment.postman_environment.json`** - Environment variables and configuration
3. **`POSTMAN_USAGE.md`** - This usage guide

## 🚀 Quick Start

### 1. Import into Postman

1. Open Postman
2. Click **Import** in the top left
3. Drag and drop both files or click **Upload Files**:
   - `Movie-Hub-API.postman_collection.json`
   - `Movie-Hub-Environment.postman_environment.json`

### 2. Set Environment

1. In Postman, select **Movie Hub Environment** from the environment dropdown (top right)
2. The base URL is already set to `http://localhost:8080/api/v1`

### 3. Test the API

1. **Start with Authentication**: Run the "Register User" request
2. **Login**: Run the "Login User" request (this will auto-save your JWT token)
3. **Browse Movies**: Run "Get Movies (Paginated)"
4. **Test Protected Endpoints**: Rate movies, manage watchlists

## 📋 Collection Structure

### 🔐 Authentication

- **Register User** - Create a new account
- **Login User** - Get JWT token (auto-saved to environment)

### 🎬 Movies

- **Get Movies (Paginated)** - Browse movies with filters and search
- **Get Movie by ID** - Get detailed movie information

### ⭐ Ratings

- **Create Rating** - Rate a movie (1-10 scale)
- **Get My Ratings** - View your ratings
- **Update Rating** - Modify existing ratings
- **Delete Rating** - Remove ratings
- **Get Movie Ratings** - View all ratings for a movie
- **Get Movie Average Rating** - Get average rating stats

### 📝 Watchlist

- **Add to Watchlist** - Add movies to watchlist or favorites
- **Get My Watchlist** - View your saved movies
- **Remove from Watchlist** - Remove movies
- **Get Watchlist Statistics** - View your stats
- **Check Movie in Watchlist** - Check if movie is saved

## 🛠️ Environment Variables

The environment includes pre-configured variables:

### 🔧 API Configuration

- `base_url` - API base URL (`http://localhost:8080/api/v1`)

### 👤 User Data

- `user_email` - Test user email
- `username` - Test username
- `password` - Test password
- `first_name` - Test first name
- `last_name` - Test last name

### 🔑 Authentication

- `auth_token` - JWT token (auto-populated on login)
- `user_id` - Current user ID (auto-populated)

### 🎯 Test Data

- `movie_id` - Movie ID for testing (default: 1)
- `rating_id` - Rating ID for testing
- `watchlist_id` - Watchlist entry ID
- `rating_score` - Rating value (1-10)
- `review_text` - Sample review text

### 📄 Pagination & Filters

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search_term` - Search query (default: "batman")
- `genre_ids` - Genre filter (default: "28,12" for Action/Adventure)
- `sort_by` - Sort field (default: "popularity")
- `sort_order` - Sort direction (default: "DESC")

## 🧪 Testing Workflow

### Basic Workflow

1. **Register** → **Login** → **Browse Movies** → **Rate Movies** → **Manage Watchlist**

### Sample Test Sequence

```
1. POST /auth/register     (Create account)
2. POST /auth/login        (Get JWT token)
3. GET  /movies           (Browse movies)
4. POST /ratings          (Rate a movie)
5. GET  /ratings/my-ratings (View your ratings)
6. POST /watchlist        (Add to watchlist)
7. GET  /watchlist        (View watchlist)
8. GET  /watchlist/stats  (View statistics)
```

## 🔍 Advanced Usage

### Custom Filters

**Search Movies:**

```
GET /movies?search=batman&limit=5
```

**Filter by Genre:**

```
GET /movies?genres=28,12&sortBy=voteAverage&sortOrder=DESC
```

**Filter by Rating:**

```
GET /movies?minRating=8&maxRating=10&year=2008
```

### Batch Testing

Use **Postman Runner** to run the entire collection:

1. Click **Runner** in Postman
2. Select **Movie Hub API** collection
3. Select **Movie Hub Environment**
4. Click **Run Movie Hub API**

## 📊 Response Examples

### Movies List Response

```json
{
  "data": [
    {
      "id": 1,
      "title": "The Dark Knight",
      "overview": "Batman raises the stakes...",
      "voteAverage": 8.5,
      "genres": [{ "name": "Action" }],
      "averageRating": 8.7
    }
  ],
  "meta": {
    "total": 126,
    "page": 1,
    "limit": 10,
    "totalPages": 13
  }
}
```

### Authentication Response

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "username": "johndoe"
  }
}
```

## 🚨 Troubleshooting

### Common Issues

**❌ Connection Refused**

- Ensure Docker containers are running: `docker-compose ps`
- Check if app is on port 8080: `curl http://localhost:8080/api/v1/movies`

**❌ 401 Unauthorized**

- Login first to get JWT token
- Check if `auth_token` environment variable is set
- Token may have expired (24h default) - login again

**❌ 404 Not Found**

- Verify base URL is correct: `http://localhost:8080/api/v1`
- Check endpoint paths match API documentation

**❌ Validation Errors**

- Check request body format
- Ensure required fields are provided
- Verify data types (numbers vs strings)

### Debug Mode

Enable Postman Console to see detailed request/response logs:

1. **View** → **Show Postman Console**
2. Run requests to see full HTTP details

## 🔄 Auto-Features

### Automatic Token Management

- Login request automatically saves JWT token to environment
- All protected endpoints use the saved token
- No manual token copying required

### Response Validation

- Each request includes test scripts
- Automatic validation of response structure
- Performance testing (< 5 seconds response time)

### Environment Auto-Setup

- Pre-request scripts set default values
- Base URL auto-configured
- Common pagination values pre-set

## 📈 Performance Testing

Use **Postman Monitor** for continuous testing:

1. Create a Monitor from your collection
2. Schedule regular runs
3. Monitor API health and performance

## 🤝 Contributing

To extend the collection:

1. Add new requests to appropriate folders
2. Include test scripts for validation
3. Update environment variables as needed
4. Add response examples
5. Update this documentation

---

**Happy Testing! 🚀**

Need help? Check the main [API Documentation](../API_DOCUMENTATION.md) or [README](../README.md).
