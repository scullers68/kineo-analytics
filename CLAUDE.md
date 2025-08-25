# Kineo Analytics Migration Project

## Project Overview

Kineo Analytics has evolved from a Sisense-dependent solution to a **standalone multi-customer SaaS platform** that Kineo owns and operates. This strategic transformation positions Kineo to serve hundreds of customers directly through a modern web-based analytics platform powered by Databricks.

### Strategic Platform Goals
- **Platform Ownership**: Kineo controls the entire customer experience and product roadmap
- **Multi-Customer SaaS**: Support hundreds of customers with isolated, secure data access
- **BI Tool Independence**: No dependency on customer BI tools or third-party licensing
- **Revenue Scalability**: SaaS subscription model with predictable recurring revenue
- **Technology Excellence**: Modern React/TypeScript + FastAPI + Databricks architecture

## Architecture Overview

### Target State (Multi-Customer Platform)
```
Customer Data Sources → Kineo Analytics Platform → Interactive Dashboards
(Totara, HRIS, CSV)    (React + FastAPI + Databricks)    (Web-based UI)
         ↓                        ↓                           ↓
    Multi-tenant           Customer Schema           Customer-specific
    Data Ingestion         Isolation per             Analytics & 
                          Customer (001, 002...)      Visualizations
```

### Platform Architecture Layers
```
┌─────────────────── Frontend Layer ───────────────────┐
│ React/TypeScript • D3.js • TailwindCSS • Next.js    │
├─────────────────── API Layer ────────────────────────┤
│ FastAPI • JWT Auth • Customer Context • Redis Cache  │
├─────────────────── Data Layer ───────────────────────┤
│ Databricks • Bronze/Silver/Gold • Customer Schemas   │
└───────────────────────────────────────────────────────┘
```

## Agent Architecture & Parallel Development

The project uses a **14-agent specialized architecture** optimized for **parallel development by two Claude Code developers**:

### **Developer A - Frontend Specialist Agents**
- 👨‍💻 **senior-fullstack-python-engineer** - React/TypeScript development and architecture
- 🧪 **tdd-expert** - Test-driven development and quality assurance
- 🎨 **complexity-eradicator** - Code simplification and maintainability
- 🚀 **devops-platform-engineer** - CI/CD coordination (shared)

### **Developer B - Backend/Data Specialist Agents**
- 🏗️ **databricks-platform-architect** - Infrastructure, lakehouse patterns, Unity Catalog
- 🔄 **etl-pipeline-engineer** - Pipeline development and orchestration  
- 🔀 **sql-migration-specialist** - SQL conversion and optimization
- 📊 **data-modeling-expert** - Dimensional modeling and design
- 🕸️ **graph-algorithms-specialist** - Manager hierarchy implementation (7,794 relationships)
- ⚡ **spark-optimization-expert** - Performance tuning, AQE, Z-ordering
- 🔍 **data-quality-engineer** - Data profiling, Great Expectations, lineage tracking
- ☁️ **azure-cloud-architect** - Cloud storage, networking, security, disaster recovery

### **Parallel Development Framework**
- **Two-Developer Workflow**: Frontend (A) + Backend/Data (B) specialists working simultaneously
- **Branching Strategy**: `main` → `develop` → `feature/frontend-foundation` / `feature/backend-platform`
- **Integration Points**: Weekly syncs at weeks 4, 8, 12, 16, 20 with API-first development
- **40-50% Time Reduction**: Achieved through specialized agent domains and minimal overlap

## Data Model Overview

### Source Data Scale
| Component | Volume | Complexity |
|-----------|--------|------------|
| **Source Files** | 13 CSV files | 230K+ total records |
| **Users** | 3,057 users | Complex org hierarchy |
| **Course Completions** | 19,858 records | Multi-source enrollment |
| **Certifications** | 9,767 records | Expiry tracking |
| **Cert Overview** | 92,146 records | Large fact optimization |
| **Manager Relationships** | 7,794 total | Self/direct/indirect types |

### Multi-Customer Data Architecture (Bronze-Silver-Gold per Customer)

#### **Customer Schema Isolation**
Each customer gets dedicated schemas: `customer_001`, `customer_002`, etc.
```python
# Customer-specific data processing
customer_schema = f"customer_{customer_id:03d}"
df.write.table(f"{customer_schema}.bronze.learning_data")
```

#### **Bronze Layer** - Customer Raw Data Ingestion  
- Customer-specific CSV ingestion with schema isolation
- Audit columns (_ingestion_timestamp, _source_file, _customer_id)
- Auto Loader monitoring per customer data sources
- Customer onboarding automation and data validation

#### **Silver Layer** - Customer Data Cleansing
- Customer-specific data quality rules and business logic
- Manager hierarchy algorithm per customer organization
- Standardized null handling (1900-01-01 for dates, -1 for unknowns)
- Incremental processing for large customer datasets

#### **Gold Layer** - Customer Business Model
**Per-Customer Dimensions (19 tables each)**:
- Core: Dim_User, Dim_Course, Dim_Cert, Dim_Programs
- Progress: Dim_Course_Progress, Dim_Certification_Progress, Dim_Program_Progress  
- Date: Dim_FY_Began, Dim_FY_Completed (2012-2036 range)
- Special: Dim_Manager_Relationship (customer-specific hierarchy)

**Per-Customer Facts (11 tables each)**:
- Progress: Fact_Course_Progress, Fact_Program_Progress, Fact_Certification_Progress
- Historical: Fact_Course_History, Fact_Program_History, Fact_Certification_History  
- Activity: Fact_Scorm, Fact_Seminar_Signup, Fact_LearningTime

## Critical Business Logic

### Manager Hierarchy Algorithm
**Complexity**: O(n²) transitive closure with cycle detection
```python
# Three relationship types created:
# 1. Self - Every user manages themselves (3,057 relationships)
# 2. Direct - Manager → Employee from source data  
# 3. Indirect - Transitive closure of management chain
# Total: 7,794 relationships requiring GraphFrames implementation
```

### Key Data Patterns
- **Null Dates**: `1900-01-01` represents null completion dates
- **Unknown Records**: `-1` for missing foreign key references
- **Fiscal Years**: 2012-2036 range for historical analysis
- **Status Logic**: Complex certification expiry and renewal cycles

## Performance Targets & Optimization

### Platform Performance Targets
| Metric | Current (Single Customer) | Target (500 Customers) | Scalability |
|--------|---------------------------|-------------------------|-------------|
| **Dashboard Load Time** | ~30 seconds | <2 seconds | 15x improvement |
| **Concurrent Users** | ~50 users | 100+ per customer | 1000x scale |
| **Customer Onboarding** | ~2 weeks | <24 hours | 14x faster |
| **Platform Cost per Customer** | $155,000/year | $50/month | 99.7% reduction |
| **Data Processing** | 230K records | 10M+ per customer | 40x capacity |

### Optimization Strategies
- **Z-ordering**: Optimize fact tables by user_id, date_completed, fiscal_year
- **Partitioning**: Historical facts partitioned by fiscal_year
- **Broadcast Joins**: Small dimensions (<50MB) broadcasted for join optimization
- **Delta Lake**: Auto-optimization with 128MB target file sizes
- **Materialized Views**: Pre-aggregated tables for dashboard performance

## Technology Stack

### Platform Technology Stack
- **Frontend**: React 18+, TypeScript, Next.js, TailwindCSS, D3.js
- **Backend**: FastAPI, Python 3.11+, SQLAlchemy, Redis, JWT authentication  
- **Data**: Azure Databricks Premium, Delta Lake, PySpark, Unity Catalog
- **Infrastructure**: Azure App Service, PostgreSQL, Azure Key Vault, Application Gateway
- **Storage**: Azure Data Lake Storage Gen2 with customer schema isolation

### Development & Operations
- **Parallel Development**: Two-developer workflow with specialized Claude Code agents
- **CI/CD**: GitHub Actions with automated testing and deployment
- **IaC**: Terraform for multi-customer infrastructure automation
- **Monitoring**: Azure Monitor, Application Insights, custom performance dashboards
- **Quality**: Jest/React Testing Library (frontend), pytest (backend), Great Expectations (data)
- **Documentation**: Auto-generated API docs, component library, coordination guides

## Migration Implementation Status

### ✅ Phase 0: Project Initiation & Platform Architecture (COMPLETED)
- [x] Strategic transformation from migration to platform ownership
- [x] 14-agent specialized architecture design and implementation
- [x] Parallel development framework for two Claude Code developers
- [x] Complete API contracts and coordination documentation
- [x] Multi-customer SaaS architecture specification
- [x] GitHub repository with branching strategy: https://github.com/scullers68/kineo-analytics

### 🔄 Phase 1: Platform Foundation Development (READY TO START)
**Developer A - Frontend Foundation (Weeks 2-6)**
- [ ] React/TypeScript application architecture with Next.js
- [ ] Authentication UI components and JWT token management
- [ ] Responsive dashboard framework with TailwindCSS
- [ ] Component library setup with Storybook

**Developer B - Backend Platform (Weeks 2-6)**  
- [ ] FastAPI application with multi-tenant authentication
- [ ] Azure cloud infrastructure deployment
- [ ] Customer management APIs and database models
- [ ] Databricks multi-customer schema architecture

## Key Technical Challenges

### Platform Development Challenges
1. **Multi-Customer Data Isolation**: Ensure 100% customer data separation across all layers
2. **Manager Hierarchy Algorithm**: Scale NetworkX algorithm to PySpark for multiple customers  
3. **Platform Performance**: Support 500+ customers with <2 second dashboard responses
4. **Customer Onboarding**: Automate schema provisioning and data migration in <24 hours
5. **Parallel Development Coordination**: Maintain API contracts and integration points

### Risk Mitigation & Learnings
- **Parallel Development Framework**: Specialized agent domains minimize integration conflicts
- **API-First Development**: Complete contracts enable independent frontend/backend work
- **Customer Schema Isolation**: `customer_001` pattern ensures data separation by design
- **Weekly Integration Points**: Scheduled syncs prevent blocking issues and technical debt
- **Comprehensive Testing**: Unit (90%+), integration, and end-to-end test coverage

## Project Resources

### Repository Structure
```
kineo-analytics/
├── .claude/agents/          # 14 specialized agents for parallel development
├── frontend/               # React/TypeScript app (Developer A)
├── backend/                # FastAPI application (Developer B)  
├── databricks/             # PySpark notebooks (Developer B)
├── infrastructure/         # Terraform/Docker (shared)
├── docs/                   # Project documentation
│   ├── coordination/       # Parallel development guides
│   ├── api-contracts/      # API specifications
│   ├── todo-mvp-kineo.md   # Platform development roadmap
│   └── architecture.md     # Multi-customer platform architecture
├── tests/                  # Integration and E2E tests
└── CLAUDE.md               # This overview document
```

### Key Documentation & Coordination
- **Platform Architecture**: `docs/architecture.md` - Multi-customer SaaS architecture
- **Development Roadmap**: `docs/todo-mvp-kineo.md` - 32-week platform development plan  
- **Parallel Development**: `docs/coordination/` - Two-developer workflow and integration
- **API Contracts**: `docs/api-contracts/API_SPECIFICATION.md` - Complete endpoint specifications
- **Agent Specifications**: `.claude/agents/` - 14 specialized agents for frontend/backend domains

## Contact & Status

- **Project Status**: Phase 0 Complete - Platform Foundation Development Ready to Begin
- **Architecture**: Standalone multi-customer SaaS platform (React + FastAPI + Databricks)
- **Development Model**: Two-developer parallel workflow with specialized Claude Code agents
- **Target Timeline**: 32-week platform development with 500+ customer scalability
- **Success Criteria**: <2s dashboard loads, 100% customer data isolation, $50/customer/month cost

## Key Learnings & Decisions

### **Strategic Transformation Decision**
- **From**: Sisense migration project for single-customer deployment
- **To**: Multi-customer SaaS platform ownership with hundreds of customers
- **Impact**: Changed from system integration to platform ownership revenue model

### **Parallel Development Framework**
- **Decision**: Two Claude Code developers working simultaneously with specialized agents
- **Benefits**: 40-50% development time reduction through domain specialization
- **Implementation**: API-first development with weekly integration checkpoints

### **Multi-Customer Architecture Pattern**
- **Customer Schema Isolation**: `customer_001`, `customer_002` pattern in Databricks
- **Frontend Customer Context**: JWT tokens with customer_id for secure data access  
- **Scalability Design**: Support 500+ customers with <2 second dashboard performance

---

*This document reflects the current platform architecture and parallel development status. Updated automatically by the Claude Code agent architecture.*