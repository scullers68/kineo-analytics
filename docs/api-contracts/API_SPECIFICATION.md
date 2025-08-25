# API Contract Specification

## Overview
This document defines the API contracts between Frontend (Developer A) and Backend (Developer B) to enable parallel development.

## Authentication Endpoints

### POST /api/v1/auth/login
```json
{
  "email": "user@customer.com",
  "password": "secure_password",
  "customer_domain": "customer001"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "refresh_token": "refresh_token_here",
  "user": {
    "id": "user_uuid",
    "email": "user@customer.com",
    "name": "John Doe",
    "role": "admin|manager|viewer",
    "customer_id": "customer_001",
    "permissions": ["dashboard.view", "reports.create"]
  },
  "expires_in": 3600
}
```

### POST /api/v1/auth/refresh
```json
{
  "refresh_token": "refresh_token_here"
}
```

## Customer Management Endpoints

### GET /api/v1/customers/me
**Headers:** `Authorization: Bearer {token}`
**Response:**
```json
{
  "id": "customer_001",
  "name": "Acme Corporation",
  "domain": "acme",
  "subscription_tier": "enterprise",
  "features_enabled": ["advanced_analytics", "custom_reports"],
  "data_retention_days": 2555,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/v1/customers/me/users
**Response:**
```json
{
  "users": [
    {
      "id": "user_uuid",
      "email": "user@customer.com",
      "name": "John Doe", 
      "role": "admin",
      "last_login": "2024-01-15T10:30:00Z",
      "active": true
    }
  ],
  "total": 25,
  "page": 1,
  "per_page": 50
}
```

## Analytics Data Endpoints

### GET /api/v1/analytics/dashboards
**Headers:** `Authorization: Bearer {token}`
**Query Params:**
- `type`: `course_completion|certification_tracking|program_progress|manager_reporting|learning_activity`
- `date_from`: `2024-01-01`
- `date_to`: `2024-12-31`
- `filters`: JSON object with additional filters

**Response:**
```json
{
  "dashboard_type": "course_completion",
  "data": {
    "summary": {
      "total_courses": 156,
      "completed_courses": 89,
      "in_progress": 45,
      "completion_rate": 0.571
    },
    "charts": {
      "completion_trend": [
        {"date": "2024-01-01", "completions": 12, "enrollments": 25},
        {"date": "2024-01-02", "completions": 8, "enrollments": 15}
      ],
      "top_courses": [
        {"course_name": "Safety Training", "completions": 45, "enrollment": 50},
        {"course_name": "Leadership", "completions": 32, "enrollment": 40}
      ]
    }
  },
  "filters_applied": {
    "date_range": "2024-01-01 to 2024-12-31",
    "departments": ["HR", "Engineering"],
    "user_groups": ["Managers"]
  },
  "generated_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/v1/analytics/users/{user_id}/progress
**Response:**
```json
{
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "department": "Engineering",
    "manager": "Jane Smith"
  },
  "progress": {
    "courses": {
      "completed": 12,
      "in_progress": 3,
      "assigned": 18,
      "overdue": 2
    },
    "certifications": {
      "active": 5,
      "expired": 1,
      "expiring_soon": 2
    },
    "learning_time": {
      "total_hours": 45.5,
      "this_month": 8.5,
      "target_hours": 40
    }
  }
}
```

### GET /api/v1/analytics/manager-hierarchy
**Query Params:**
- `user_id`: optional, get hierarchy for specific user
- `depth`: optional, limit hierarchy depth

**Response:**
```json
{
  "hierarchy": [
    {
      "user_id": "manager_uuid",
      "name": "CEO Name",
      "level": 1,
      "direct_reports": 5,
      "total_reports": 150,
      "children": [
        {
          "user_id": "director_uuid", 
          "name": "Director Name",
          "level": 2,
          "direct_reports": 8,
          "total_reports": 45,
          "children": [...]
        }
      ]
    }
  ]
}
```

## Data Export Endpoints

### POST /api/v1/analytics/export
```json
{
  "export_type": "csv|excel|pdf",
  "dashboard_type": "course_completion",
  "filters": {
    "date_from": "2024-01-01",
    "date_to": "2024-12-31",
    "departments": ["HR", "Engineering"]
  },
  "include_charts": true
}
```

**Response:**
```json
{
  "export_id": "export_uuid",
  "status": "processing|completed|failed",
  "download_url": "https://storage.azure.com/exports/file.csv",
  "expires_at": "2024-01-16T10:30:00Z"
}
```

## Real-time Updates (WebSocket)

### Connection: `/ws/analytics/{customer_id}`
**Authentication:** JWT token in connection headers

**Message Types:**
```json
{
  "type": "data_updated",
  "dashboard_type": "course_completion", 
  "updated_at": "2024-01-15T10:30:00Z"
}
```

```json
{
  "type": "system_notification",
  "message": "Data refresh completed",
  "level": "info|warning|error"
}
```

## Error Responses

All endpoints return consistent error format:
```json
{
  "error": {
    "code": "CUSTOMER_NOT_FOUND",
    "message": "Customer not found or access denied",
    "details": {
      "customer_id": "customer_001",
      "user_id": "user_uuid"
    }
  },
  "request_id": "req_uuid"
}
```

## Development Notes

### For Developer A (Frontend):
- All endpoints require `Authorization: Bearer {token}` header
- Customer context is automatically applied based on JWT token
- Use TypeScript interfaces generated from these schemas
- Implement loading states for all API calls
- Handle error responses consistently

### For Developer B (Backend):
- Implement customer data isolation in all endpoints
- Add comprehensive input validation with Pydantic
- Include rate limiting per customer
- Log all API calls for auditing
- Implement caching for frequently accessed data

## Mock Data
During parallel development, use mock responses matching these schemas for frontend development while backend APIs are being implemented.