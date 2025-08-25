# Backend Development - Developer B

## Technology Stack
- **Framework**: FastAPI with Python 3.11+
- **Database**: PostgreSQL (customer metadata) + Databricks (analytics data)
- **Caching**: Redis
- **Authentication**: JWT with multi-tenant support
- **ORM**: SQLAlchemy with Alembic migrations

## Directory Structure
```
backend/
├── app/
│   ├── api/               # API route handlers
│   │   ├── v1/           # API version 1 endpoints
│   │   ├── auth/         # Authentication endpoints
│   │   ├── customers/    # Customer management
│   │   └── analytics/    # Analytics data endpoints
│   ├── core/             # Core configuration and utilities
│   ├── models/           # SQLAlchemy models
│   ├── services/         # Business logic services
│   └── utils/            # Helper functions
├── tests/                # Unit and integration tests
└── migrations/           # Database migrations
```

## Development Guidelines
- Follow FastAPI best practices
- Implement async/await patterns
- Use Pydantic for data validation
- Maintain customer data isolation
- Implement comprehensive error handling

## Primary Responsibilities
- FastAPI application architecture
- Customer management APIs
- Multi-tenant authentication system
- Databricks integration layer
- Data query services and caching