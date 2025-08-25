# Frontend Development - Developer A

## Technology Stack
- **Framework**: Next.js 13+ with TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Charts**: D3.js + Custom Components
- **Authentication**: JWT with customer context

## Directory Structure
```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── charts/         # D3.js chart components
│   │   ├── dashboard/      # Dashboard layout components
│   │   ├── auth/          # Authentication components
│   │   └── common/        # Common UI components
│   ├── pages/             # Next.js pages
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API service layer
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions
├── public/                # Static assets
└── tests/                # Component tests
```

## Development Guidelines
- Use TypeScript strictly
- Follow component composition patterns
- Implement responsive design first
- Create reusable chart components
- Maintain 90%+ test coverage

## Primary Responsibilities
- React application architecture
- Interactive visualization components
- Customer authentication UI
- Dashboard layouts and navigation
- Multi-tenant UI patterns