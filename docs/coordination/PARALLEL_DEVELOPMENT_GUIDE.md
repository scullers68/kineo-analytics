# Parallel Development Coordination Guide

## Overview
This guide outlines coordination procedures for two developers working in parallel on the Kineo Analytics platform using Claude Code.

## Developer Roles & Responsibilities

### 👨‍💻 Developer A - Frontend Specialist
**Primary Focus**: User interface, visualization, and frontend architecture
**Branch**: `feature/frontend-foundation`
**Claude Agents**: 
- `senior-fullstack-python-engineer`
- `complexity-eradicator` 
- `tdd-expert`
- `devops-platform-engineer` (shared)

### 🔧 Developer B - Backend/Data Specialist  
**Primary Focus**: APIs, data architecture, and Databricks integration
**Branch**: `feature/backend-platform`
**Claude Agents**:
- `databricks-platform-architect`
- `etl-pipeline-engineer`
- `sql-migration-specialist`
- `data-modeling-expert`
- `graph-algorithms-specialist`
- `spark-optimization-expert`
- `data-quality-engineer`
- `azure-cloud-architect`

## Branching Strategy

```
main (production ready)
├── develop (integration branch)
│   ├── feature/frontend-foundation (Developer A)
│   │   ├── feature/dashboard-components
│   │   ├── feature/auth-ui
│   │   └── feature/visualization-engine
│   └── feature/backend-platform (Developer B)
│       ├── feature/customer-apis
│       ├── feature/databricks-integration
│       └── feature/multi-tenant-auth
```

## Development Workflow

### Daily Workflow
1. **Start of Day**: Pull latest from `develop`
2. **Development**: Work on feature branches
3. **Integration**: Create PR to `develop` for completed features
4. **End of Day**: Push all work, update coordination documents

### Weekly Integration
- **Monday**: Week planning, sync on API contracts
- **Wednesday**: Mid-week integration check, resolve conflicts
- **Friday**: Week review, prepare for integration testing

## Communication Protocols

### Immediate Coordination Required For:
- API endpoint changes
- Database schema modifications
- Authentication/security changes
- Infrastructure configuration changes

### Communication Channels:
- **Git Issues**: For feature requests and bugs
- **PR Comments**: For code-specific discussions
- **Coordination Docs**: For status updates and blocking issues

## Integration Points

### Critical Handoff Points:
1. **Authentication System**: Backend provides JWT, Frontend consumes
2. **API Contracts**: Backend defines, Frontend implements
3. **Data Models**: Backend structures, Frontend visualizes
4. **Customer Context**: Both systems must maintain customer isolation

### Shared Dependencies:
- Database connection configurations
- Environment variables and secrets
- Docker configurations
- CI/CD pipeline definitions

## Conflict Resolution

### Merge Conflict Prevention:
- Use separate directories when possible
- Coordinate on shared configuration files
- Regular syncing with `develop` branch

### When Conflicts Arise:
1. Discuss in GitHub PR comments
2. Use `git rebase` to clean up history
3. Pair programming session if needed
4. Escalate to project architecture review if unresolved

## Quality Gates

### Before Merging to Develop:
- [ ] All tests passing
- [ ] Code review completed
- [ ] API contracts validated
- [ ] Documentation updated
- [ ] No breaking changes to integration points

### Integration Testing:
- Run full end-to-end tests weekly
- Validate customer data isolation
- Performance testing on integrated system
- Security scanning on complete platform