# API Documentation

## Base URL
```
https://api.ghostyoutube.com/v1
```

## Authentication
All API endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication
#### POST /auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "username": "username"
}
```

#### POST /auth/login
Login user
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

#### POST /auth/refresh
Refresh JWT token
```json
{
  "refreshToken": "refresh_token"
}
```

### Content Requests
#### POST /content/request
Request AI-generated content
```json
{
  "topic": "How to build a robot",
  "duration": 300,
  "style": "educational",
  "language": "en"
}
```

#### GET /content/requests
Get user's content requests
```
Query parameters:
- page: number (default: 1)
- limit: number (default: 10)
- status: string (pending, processing, completed, failed)
```

#### GET /content/:id
Get specific content item
```
Path parameters:
- id: content id
```

### User Management
#### GET /user/profile
Get user profile

#### PUT /user/profile
Update user profile
```json
{
  "username": "new_username",
  "email": "new_email@example.com"
}
```

#### GET /user/subscriptions
Get user's subscription information

### Payments
#### POST /payments/subscribe
Create subscription
```json
{
  "plan": "premium",
  "paymentMethodId": "pm_12345"
}
```

#### GET /payments/history
Get payment history

### AI Service (Internal)
#### POST /ai/generate
Generate content (internal use)
```json
{
  "script": "video script content",
  "duration": 300,
  "style": "educational"
}
```

## Error Responses
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2023-01-01T00:00:00Z"
}
```

## Rate Limiting
- Auth endpoints: 10 requests per minute
- Content requests: 100 requests per hour
- Other endpoints: 1000 requests per hour
