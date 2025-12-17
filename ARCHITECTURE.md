# System Architecture

## Overview

The RAMS Workload Management System follows a three-tier architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│                     React Frontend (Port 3001)               │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Capacity   │  │ Benchmarking │  │  Hierarchy   │      │
│  │   Overview   │  │     View     │  │  Navigator   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │         API Client (Axios) + Utilities              │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                  Node.js + Express (Port 3000)               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │                      Routes                         │    │
│  │  /resources  /projects  /work-packages              │    │
│  │  /activities /change-logs  /reports                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Controllers                       │    │
│  │  ResourceCtrl  ProjectCtrl  WorkPackageCtrl         │    │
│  │  ActivityCtrl  ChangeLogCtrl  ReportCtrl            │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│  ┌──────────────────┐  ┌────────────────────────────┐       │
│  │    Services      │  │         Models             │       │
│  │                  │  │                            │       │
│  │  Capacity        │  │  Resource    Project      │       │
│  │  Calculation     │  │  WorkPackage Activity     │       │
│  │                  │  │  ChangeLog                │       │
│  │  Report          │  │                            │       │
│  │  Generation      │  │  (Data Access Layer)       │       │
│  └──────────────────┘  └────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              │
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                 PostgreSQL 14+ (Port 5432)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │                       Tables                         │   │
│  │  • resources (contract hours, availability)          │   │
│  │  • projects (date ranges)                            │   │
│  │  • work_packages (RAMS tags, standard effort)        │   │
│  │  • activities (resource assignments, planned hours)  │   │
│  │  • change_logs (audit trail)                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Database Views                     │   │
│  │  • monthly_resource_utilization                      │   │
│  │  • work_package_budget_status                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                      Triggers                        │   │
│  │  • Auto-update timestamps                            │   │
│  │  • Log work package changes                          │   │
│  │  • Log activity changes                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React)

**Technology Stack:**
- React 18 with Hooks
- React Router for navigation
- Axios for API calls
- Recharts for visualization

**Key Components:**

1. **CapacityOverview**
   - Bar charts (Recharts)
   - Real-time capacity calculation
   - Warning system
   - Export functionality

2. **BenchmarkingView**
   - Budget comparison
   - Filtering capabilities
   - Variance calculations
   - Summary statistics

3. **HierarchyNavigator**
   - Tree-view rendering
   - Lazy loading
   - Expandable nodes
   - Detailed information display

### Backend (Node.js + Express)

**Architecture Pattern:** MVC (Model-View-Controller)

**Layers:**

1. **Routes Layer**
   - Define API endpoints
   - Map URLs to controllers
   - Handle HTTP methods

2. **Controllers Layer**
   - Process requests
   - Validate input
   - Call business logic
   - Format responses

3. **Services Layer**
   - Business logic
   - Complex calculations
   - Report generation
   - Data transformation

4. **Models Layer**
   - Database queries
   - Data access methods
   - Result mapping

### Database (PostgreSQL)

**Design Principles:**
- Third Normal Form (3NF)
- Referential integrity
- Constraint-based validation
- Trigger-based automation

**Key Features:**

1. **Relationships**
   ```
   projects (1) ──→ (N) work_packages
   work_packages (1) ──→ (N) activities
   resources (1) ──→ (N) activities
   ```

2. **Constraints**
   - Contract hours: IN (35, 40)
   - Date validation: end_date >= start_date
   - Positive values: hours >= 0

3. **Automation**
   - Timestamp updates
   - Change logging
   - Cascading deletes

## Data Flow

### Capacity Calculation Flow

```
User Request (Year, Month)
        ↓
Frontend: CapacityOverview Component
        ↓
API Call: GET /api/resources/capacity?year=2024&month=1
        ↓
Backend: ResourceController.getAllCapacity()
        ↓
Model: Resource.getAllMonthlyUtilization()
        ↓
Database Query: Aggregate activities by resource
        ↓
Service: CapacityService.enrichResourceWithCapacity()
        ↓
Calculate: 
  - Working days in month
  - Monthly capacity = (contract_hours / 5) × working_days
  - Utilization % = (planned_hours / capacity) × 100
        ↓
Service: CapacityService.generateCapacityWarnings()
        ↓
Identify resources with utilization > 100%
        ↓
Response: { data: enrichedResources, warnings: [] }
        ↓
Frontend: Render chart and table with warnings
```

### Budget Comparison Flow

```
User Request
        ↓
Frontend: BenchmarkingView Component
        ↓
API Call: GET /api/work-packages/budget-status
        ↓
Backend: WorkPackageController.getAllBudgetStatus()
        ↓
Model: WorkPackage.getAllBudgetStatus()
        ↓
Database View: work_package_budget_status
        ↓
Calculate:
  - total_planned_hours = SUM(activities.planned_hours)
  - variance = total_planned - standard_effort
  - status = OVER_BUDGET | AT_BUDGET | UNDER_BUDGET
        ↓
Response: Budget status for all work packages
        ↓
Frontend: Render chart and table with color coding
```

### Audit Trail Flow

```
User Updates Work Package
        ↓
API Call: PUT /api/work-packages/:id
        ↓
Backend: WorkPackageController.update()
        ↓
Model: WorkPackage.update()
        ↓
Database: UPDATE work_packages SET ... WHERE id = $1
        ↓
Trigger: log_work_package_updates
        ↓
IF field changed:
  INSERT INTO change_logs (
    entity_type, entity_id, field_name,
    old_value, new_value, changed_at
  )
        ↓
Response: Updated work package
        ↓
Audit log automatically created
```

## API Design

### RESTful Endpoints

**Resources:**
```
GET    /api/resources              # List all
GET    /api/resources/:id          # Get one
POST   /api/resources              # Create
PUT    /api/resources/:id          # Update
DELETE /api/resources/:id          # Delete
GET    /api/resources/capacity     # Capacity data
```

**Projects:**
```
GET    /api/projects               # List all
GET    /api/projects/:id           # Get one (with ?include_work_packages=true)
POST   /api/projects               # Create
PUT    /api/projects/:id           # Update
DELETE /api/projects/:id           # Delete
```

**Work Packages:**
```
GET    /api/work-packages                    # List all
GET    /api/work-packages/:id                # Get one
GET    /api/work-packages/project/:projectId # Filter by project
GET    /api/work-packages/budget-status      # Budget comparison
POST   /api/work-packages                    # Create
PUT    /api/work-packages/:id                # Update (logged)
DELETE /api/work-packages/:id                # Delete
```

**Activities:**
```
GET    /api/activities                            # List all
GET    /api/activities/:id                        # Get one
GET    /api/activities/resource/:resourceId       # By resource
GET    /api/activities/work-package/:wpId         # By work package
POST   /api/activities                            # Create
PUT    /api/activities/:id                        # Update (logged)
DELETE /api/activities/:id                        # Delete
```

**Reports:**
```
GET    /api/reports/capacity/excel?year=X&month=Y # Excel export
GET    /api/reports/capacity/pdf?year=X&month=Y   # PDF export
GET    /api/reports/budget/excel                  # Excel export
GET    /api/reports/budget/pdf                    # PDF export
GET    /api/reports/rams-distribution/excel       # RAMS report
```

## Security Considerations

### Current Implementation

- CORS enabled for frontend communication
- Input validation in controllers
- Database constraints for data integrity
- Parameterized queries (SQL injection prevention)

### Recommended Enhancements

- JWT authentication
- Role-based access control (Admin, Manager, Engineer)
- API rate limiting
- HTTPS in production
- Environment-based secrets management
- Audit user identification

## Scalability

### Current Capacity

- Suitable for: 100+ resources, 50+ projects
- Response times: < 100ms for most queries
- Database indexes optimize common queries

### Scaling Strategies

1. **Horizontal Scaling**
   - Add more Node.js instances
   - Use load balancer (nginx)
   - Session management with Redis

2. **Database Optimization**
   - Connection pooling (already implemented)
   - Query optimization
   - Materialized views for heavy queries
   - Partitioning for large datasets

3. **Caching**
   - Redis for capacity calculations
   - Cache invalidation on updates
   - Reduce database load

## Deployment Options

### Development

```bash
# Local setup
npm start (backend + frontend)
```

### Docker

```bash
docker-compose up
```

Includes:
- PostgreSQL container
- Backend container
- Frontend container
- Automatic networking

### Production

**Recommended Stack:**
- Frontend: Netlify, Vercel, or S3 + CloudFront
- Backend: AWS EC2, Heroku, or DigitalOcean
- Database: AWS RDS, Heroku PostgreSQL, or managed PostgreSQL

## Monitoring & Maintenance

### Health Checks

- `GET /api/health` - API status
- Database connection monitoring
- Error logging (console)

### Recommended Additions

- Application monitoring (New Relic, DataDog)
- Error tracking (Sentry)
- Log aggregation (ELK stack)
- Database backup automation
- Performance monitoring

## Technology Choices Rationale

### Why PostgreSQL?

- Strong ACID compliance (critical for RAMS)
- Advanced features (JSONB, triggers, views)
- Excellent for relational data
- Mature and reliable

### Why React?

- Component-based architecture
- Large ecosystem (Recharts, Router)
- Strong community support
- Excellent for dashboard UIs

### Why Node.js + Express?

- JavaScript full-stack consistency
- Fast development cycle
- Good async handling
- Large package ecosystem

## File Organization

```
backend/
  src/
    config/      # Database connection
    models/      # Data access (one per table)
    controllers/ # Request handling (one per resource)
    routes/      # API endpoints (one per resource)
    services/    # Business logic (capacity, reports)
    server.js    # Express setup
  scripts/       # Database management
  schema.sql     # Database definition

frontend/
  src/
    components/  # React components (organized by feature)
    services/    # API client
    utils/       # Helper functions
    styles/      # CSS
    App.js       # Main app with routing
    index.js     # React entry point
  public/
    index.html   # HTML template
```

## Best Practices Applied

✅ Separation of concerns (MVC)  
✅ DRY principle (reusable services)  
✅ RESTful API design  
✅ Database normalization  
✅ Consistent naming conventions  
✅ Error handling throughout  
✅ Input validation  
✅ Parameterized queries  
✅ Modular components  
✅ Responsive design  
✅ Code organization  

---

This architecture supports the current requirements and provides a solid foundation for future enhancements.
