# Databricks Development - Developer B

## Architecture
- **Multi-Customer Schema Isolation**: `customer_001`, `customer_002`, etc.
- **Medallion Architecture**: Bronze → Silver → Gold per customer
- **Processing**: PySpark with Delta Lake
- **Orchestration**: Databricks Workflows

## Directory Structure
```
databricks/
├── notebooks/
│   ├── bronze/           # Raw data ingestion notebooks
│   ├── silver/          # Data cleansing and transformation
│   └── gold/            # Business logic and aggregations
├── schemas/             # Schema definitions and DDL
├── jobs/               # Databricks job configurations
└── utils/              # Shared utilities and functions
```

## Key Components
- **Customer Schema Provisioning**: Automated schema creation
- **Manager Hierarchy Algorithm**: PySpark implementation of NetworkX logic
- **Data Quality Framework**: Great Expectations integration
- **Performance Optimization**: Z-ordering, partitioning, caching

## Development Guidelines
- Use Delta Lake for ACID transactions
- Implement schema evolution handling
- Follow medallion architecture patterns
- Optimize for multi-customer performance
- Maintain data lineage tracking