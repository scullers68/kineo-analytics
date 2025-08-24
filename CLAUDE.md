# CLAUDE.md - Kineo Analytics Data Model Documentation

## Project Overview
Kineo Analytics is a comprehensive learning management analytics solution that processes training data from Totara LMS. The system is currently built on Sisense ElastiCube technology and is being migrated to Databricks.

## Architecture Overview

### Current State (Sisense)
```
Totara LMS → CSV Export → SFTP → Sisense Server → ElastiCube → Transformations → Dashboard
```

### Target State (Databricks)
```
Totara LMS → CSV Export → Cloud Storage → Bronze Layer → Silver Layer → Gold Layer → BI Tools
```

## Data Pipeline Structure

### 1. Source Data Files (13 CSV files from Totara)

| File | Key Fields | Record Count | Purpose |
|------|------------|--------------|---------|
| `analytics_users.csv` | User ID, Manager ID, Organization, Position | 3,057 | User master data with organizational hierarchy |
| `analytics_course_completions.csv` | User ID, Course ID, Status, Dates | 19,858 | Course enrollment and completion tracking |
| `analytics_cert_completions.csv` | User ID, Cert ID, Status, Expiry | 9,767 | Certification status and expiry tracking |
| `analytics_prog_completions.csv` | User ID, Program ID, Status, Dates | 3,409 | Program enrollment and progress |
| `analytics_prog_overview.csv` | Program ID, Course ID, User ID | 9,634 | Program-to-course mapping |
| `analytics_cert_overview.csv` | Cert ID, Course ID, User ID | 92,146 | Certification requirements mapping |
| `analytics_scorm.csv` | User ID, Course ID, SCORM data | 35 | eLearning module tracking |
| `analytics_seminar_attendance.csv` | User ID, Session ID, Attendance | 70 | In-person training attendance |
| `analytics_audiences_report.csv` | Audience ID, User ID | 8,734 | User grouping for targeted training |
| `analytics_competency_ratings.csv` | User ID, Competency ID, Rating | 49,078 | Skills assessment data |
| `analytics_organisations.csv` | Org ID, Parent ID, Name | 1,001 | Organizational structure |
| `analytics_positions.csv` | Position ID, Parent ID, Name | 889 | Position hierarchy |
| `null_dates.csv` | Utility file | 3 | Null date handling |

### 2. Additional Files
- `dimdates.xlsx` - Date dimension table
- `kineo-migration-docs.md` - Comprehensive migration documentation

## Transformation Layer

### Dimension Tables

#### Core Dimensions
1. **Dim_User** - User master dimension with organization and manager relationships
2. **Dim_Course** - Course catalog (combines in-person and eLearning)
3. **Dim_Cert** - Certification definitions
4. **Dim_Programs** - Training program definitions
5. **Dim_SCORM** - SCORM module registry
6. **Dim_Seminar_Event** - In-person training events
7. **Dim_Seminar_Session** - Individual training sessions

#### Progress Tracking Dimensions
1. **Dim_Course_Progress** - User-course enrollment records
2. **Dim_Certification_Progress** - User-certification status with assignment tracking
3. **Dim_Program_Progress** - User-program enrollment and completion

#### Date Dimensions
1. **Dim_Date_Began** - Start date dimension
2. **Dim_Date_Completed** - Completion date dimension with null handling
3. **Dim_FY_Began** - Fiscal year start dimension (2012-2036)
4. **Dim_FY_Completed** - Fiscal year completion dimension

#### Special Dimensions
1. **Dim_Manager** - Unique managers list
2. **Dim_Manager_Relationship** - Manager hierarchy relationships (self, direct, indirect)

### Fact Tables

#### Progress Facts
1. **Fact_Course_Progress** - Course enrollment and completion metrics
2. **Fact_Program_Progress** - Program progress tracking with overdue flags
3. **Fact_Certification_Progress** - Certification status with expiry tracking
4. **Fact_Course_to_Cert_Progress** - Course progress within certifications

#### Historical Analysis Facts
1. **Fact_Course_History** - Fiscal year snapshots of course progress
2. **Fact_Program_History** - Fiscal year snapshots of program status
3. **Fact_Certification_History** - Fiscal year certification status tracking
4. **Fact_Course_to_Cert_History** - Historical course-to-certification mapping

#### Activity Facts
1. **Fact_Scorm** - SCORM module interaction data
2. **Fact_Seminar_Signup** - Seminar attendance records
3. **Fact_LearningTime** - Combined eLearning and IRL time tracking

## Critical Business Logic

### Manager Hierarchy Algorithm (UserAllReports.ipynb)
```python
# Creates three relationship types:
# 1. Self - Every user is their own manager for reporting
# 2. Direct - Direct reporting relationships from source data
# 3. Indirect - Transitive closure of management chain

# Algorithm:
1. Extract all unique users
2. Create self-relationships for all users
3. Create direct relationships from Manager ID field
4. Traverse hierarchy to create indirect relationships
5. Handle missing managers with -1 default value
```

### Date Handling Patterns
- Null dates represented as `CreateDate(1900,1,1)`
- Complex logic for determining "Date_Began" based on enrollment vs assignment
- Special handling for unassigned but completed items
- Fiscal year boundary calculations for historical facts

### Status Calculation Rules

#### Certification Status Logic
```sql
CASE 
    WHEN Status='Expired' THEN 'Expired'
    WHEN Time_completed IS NULL THEN 'In progress'
    WHEN Time_completed <= FY_EndDate THEN Status
    ELSE 'In progress'
END
```

#### Course Completion Logic
- Handles multiple enrollment sources (direct, program, certification)
- Calculates days to completion
- Flags overdue items based on due dates

## Data Quality Considerations

### Common Patterns
1. **Unknown Records**: All dimensions include -1 record for referential integrity
2. **Null Handling**: Consistent use of ISNULL() checks with defaults
3. **Date Defaults**: 1900-01-01 for null dates
4. **String Defaults**: 'N/A' for missing text values
5. **Include Flags**: Dashboard filtering capability built into dimensions

### Key Transformations

#### Course Dimension Consolidation
- Combines in-person and eLearning courses
- Prioritizes in-person records when duplicates exist (more metadata)
- Maintains course category and dashboard inclusion flags

#### Historical Fact Generation
- Creates one record per fiscal year for active items
- Tracks status changes across fiscal years
- Enables year-over-year completion analysis

## Technical Implementation Notes

### SQL Dialect Considerations
Sisense SQL uses specific functions that need conversion:
- `CREATEDATE()` → `make_date()` in Spark SQL
- `DAYDIFF()` → `datediff()`
- `GETYEAR/MONTH/DAY()` → `year()`, `month()`, `dayofmonth()`
- `RANKASC()` → `row_number() over (order by ...)`
- `[column]` → `` `column` `` (backticks in Spark)

### Performance Optimizations
1. Pre-aggregation in dimension tables using GROUP BY
2. Composite keys for fact tables (User_ID + Entity_ID)
3. Limit flags for dashboard filtering
4. Z-ordering recommended for Databricks Delta tables

## File Dependencies

### Transformation Order
1. Raw CSV ingestion
2. UserAllReports.ipynb (manager hierarchy)
3. UserHierarchy.txt (uses UserAllReports output)
4. Dimension tables (can run in parallel)
5. Fact tables (depend on dimensions)
6. Historical facts (depend on base facts)

### Critical Dependencies
- All transformations depend on source CSV availability
- Manager hierarchy must complete before user dimension
- Date dimensions required before fact tables
- Program/Certification overview files needed for relationship mapping

## Data Model Relationships

### Key Relationships (from Screenshots)
The Sisense model shows complex relationships between entities:

#### Central Hub Tables
- **Dim_User**: Connected to all fact tables as the primary user dimension
- **Dim_Course**: Links to course progress, history, and certification paths
- **Dim_FY_Completed/Began**: Time dimensions for all fact tables

#### Relationship Cardinality
- User → Course Progress: 1:Many
- User → Program Progress: 1:Many  
- User → Certification Progress: 1:Many
- Course → Program: Many:Many (via overview tables)
- Course → Certification: Many:Many (via overview tables)
- User → Manager: Many:1 (with self and indirect relationships)

#### Special Relationships
- **Manager Hierarchy**: Self-referencing with three types (self, direct, indirect)
- **Historical Facts**: Each progress fact has a corresponding history fact
- **Course Variants**: Fact_Course_to_Cert tracks courses within certifications separately

## Migration Checklist

### Pre-Migration
- [ ] Backup all Sisense configurations
- [ ] Export all SQL transformation definitions
- [ ] Document custom business rules
- [ ] Capture performance baselines
- [ ] Export all dashboard definitions
- [ ] Document security model

### Migration Steps
- [ ] Set up Databricks workspace
- [ ] Configure storage mounts
- [ ] Convert SQL syntax to Spark SQL
- [ ] Port Python notebook to PySpark
- [ ] Create Delta Lake tables
- [ ] Implement Z-order optimization
- [ ] Build materialized views
- [ ] Validate row counts
- [ ] Test business logic
- [ ] Performance comparison

### Post-Migration
- [ ] User acceptance testing
- [ ] Performance tuning
- [ ] Documentation update
- [ ] Training materials
- [ ] Parallel run validation
- [ ] Decommission Sisense

## Known Issues and Workarounds

1. **Date Format Inconsistencies**: Some dates arrive as strings, requiring parsing
2. **Manager Circular References**: Handled by visited set in hierarchy algorithm
3. **Null Assignment IDs**: Default to -1 for users without assignments
4. **Course Duplication**: Prioritize in-person over eLearning records
5. **Expired Status Handling**: Special logic for expired but assigned items
6. **Large Overview Tables**: 92K+ records in cert_overview require optimization

## Testing Recommendations

### Data Validation Tests
1. Row count comparison between source and target
2. Null value handling verification
3. Date boundary testing (fiscal year transitions)
4. Manager hierarchy cycle detection
5. Orphaned record identification

### Business Logic Tests
1. Certification expiry calculations
2. Course completion status transitions
3. Overdue flag accuracy
4. Historical fact generation for multi-year items
5. Assignment vs enrollment date precedence

### Performance Tests
1. Full refresh timing
2. Incremental update performance
3. Dashboard query response times
4. Concurrent user load testing
5. Storage optimization validation

## Monitoring and Maintenance

### Key Metrics to Track
- Daily record counts by table
- ETL pipeline execution time
- Data freshness (lag from source)
- Error rates and types
- Storage growth trends

### Maintenance Tasks
- Weekly: Validate manager hierarchy integrity
- Monthly: Optimize Delta tables (VACUUM, OPTIMIZE)
- Quarterly: Review and update fiscal year dimensions
- Annually: Archive historical data beyond retention period

## Contact Information
- **Solution Owner**: Kineo
- **Migration Status**: Research/PoC Phase
- **Target Completion**: 12-month roadmap
- **Technology Stack**: Sisense → Databricks migration