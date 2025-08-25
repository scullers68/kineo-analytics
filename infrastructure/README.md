# Infrastructure - Shared Responsibility

## Technology Stack
- **Cloud Provider**: Microsoft Azure
- **IaC**: Terraform + ARM templates
- **Containerization**: Docker + Azure Container Instances
- **CI/CD**: GitHub Actions
- **Monitoring**: Azure Monitor + Application Insights

## Directory Structure
```
infrastructure/
├── terraform/           # Infrastructure as Code
│   ├── modules/        # Reusable Terraform modules
│   ├── environments/   # Environment-specific configs
│   └── shared/        # Shared resources
├── kubernetes/         # K8s manifests (if needed)
└── docker/            # Docker configurations
```

## Environments
- **Development**: Single-region, minimal resources
- **Staging**: Production-like for testing
- **Production**: Multi-region, high availability

## Coordination Required
Both developers need to coordinate on:
- Environment provisioning
- Database connection strings
- API endpoint configurations
- Security group settings