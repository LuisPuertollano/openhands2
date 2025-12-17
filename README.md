# RAMS Workload Management System

A comprehensive full-stack workload management tool designed for RAMS (Reliability, Availability, Maintainability, and Safety) Engineering teams in the railway industry.

## 🎯 Overview

This system helps engineering teams manage and track resource allocation across safety-critical projects, ensuring optimal capacity utilization and compliance with RAMS standards.

### Key Features

- **📊 Capacity Management**: Real-time tracking of resource utilization with automatic capacity calculations
- **📈 Budget Benchmarking**: Compare planned vs. standard effort hours for work packages
- **🌳 Project Hierarchy**: Intuitive tree-view navigation from Projects → Work Packages → Activities
- **📋 Audit Trail**: Automatic logging of all changes to work packages and resource assignments
- **📄 Export Reports**: Generate PDF and Excel reports for capacity and budget analysis
- **⚠️ Intelligent Warnings**: Automatic alerts for over-capacity resources and budget overruns

## 🏗️ Architecture

### Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL with advanced triggers and views
- RESTful API design

**Frontend:**
- React 18
- Recharts for data visualization
- React Router for navigation
- Axios for API communication

## 📁 Project Structure

```
rams-workload-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── models/          # Data models (Resource, Project, WorkPackage, Activity)
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic (Capacity calculations, Reports)
│   │   └── server.js        # Express server entry point
│   ├── scripts/
│   │   ├── setup_database.js    # Database initialization
│   │   ├── seed_database.js     # Mock data generator
│   │   └── test_capacity.js     # Capacity validation script
│   ├── schema.sql           # PostgreSQL schema with triggers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/       # Capacity overview with heatmap
│   │   │   ├── benchmarking/    # Budget comparison view
│   │   │   └── hierarchy/       # Project tree navigator
│   │   ├── services/        # API client
│   │   ├── utils/           # Helper functions
│   │   └── styles/          # CSS styling
│   ├── public/
│   └── package.json
└── README.md
```

## 🗄️ Database Schema

### Core Tables

**resources**
- Stores engineering resources with contract hours (35h or 40h)
- Supports monthly availability overrides (JSONB for vacations)

**projects**
- Top-level project information with date ranges

**work_packages**
- Linked to projects
- Includes RAMS tags (FMECA, Hazard Log, SIL, etc.)
- Tracks standard effort hours

**activities**
- Links resources to work packages
- Tracks planned hours and date ranges

**change_logs**
- Automatic audit trail via PostgreSQL triggers
- Tracks changes to work packages and resource assignments

### Database Views

- `monthly_resource_utilization`: Aggregates resource capacity usage
- `work_package_budget_status`: Real-time budget vs. actual comparison

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rams-workload-management
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Configure database credentials
   cp .env.example .env
   # Edit .env with your PostgreSQL credentials
   
   # Initialize database and schema
   npm run db:setup
   
   # Seed with mock data (15 resources, 3 projects, 5 WPs each)
   npm run db:seed
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Configure API endpoint
   cp .env.example .env
   # Default: REACT_APP_API_URL=http://localhost:3000/api
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:3000
   ```

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   # React app runs on http://localhost:3001
   ```

3. **Access the Application**
   Open browser to: http://localhost:3001

## 📊 Core Business Logic

### Monthly Capacity Calculation

```javascript
Monthly Capacity = (Contract Hours / 5) × Working Days in Month
```

**Example:**
- 40-hour contract, 22 working days in month
- Capacity = (40 / 5) × 22 = 176 hours

### Capacity Utilization

```javascript
Utilization % = (Planned Hours / Monthly Capacity) × 100
```

**Status Thresholds:**
- Over Capacity: > 100%
- At Capacity: 90-100%
- High Utilization: 70-90%
- Moderate Utilization: 40-70%
- Low Utilization: < 40%

### Budget Status

```javascript
Budget Status = Compare(SUM(Activity.planned_hours), WorkPackage.standard_effort_hours)
```

**Statuses:**
- OVER_BUDGET: Planned > Standard
- AT_BUDGET: Planned = Standard
- UNDER_BUDGET: Planned < Standard

## 🔍 Testing & Validation

### Run Capacity Validation Test

```bash
cd backend
npm run test:capacity
```

This script:
- Calculates capacity for all 15 mock resources
- Validates that planned hours don't exceed capacity
- Generates warnings for over-capacity situations
- Provides monthly utilization statistics

### Sample Test Output

```
=======================================================================
Month: 2024-01
=======================================================================

✅ Alice Johnson    | Contract: 35h | Capacity: 154h | Planned: 120h | Utilization: 77.9% | Status: HIGH_UTILIZATION
❌ Bob Smith        | Contract: 40h | Capacity: 176h | Planned: 185h | Utilization: 105.1% | Status: OVER_CAPACITY
```

## 📡 API Documentation

### Resources

- `GET /api/resources` - List all resources
- `GET /api/resources/:id` - Get resource by ID
- `GET /api/resources/capacity?year=2024&month=1` - Get all resource capacity for month
- `POST /api/resources` - Create resource
- `PUT /api/resources/:id` - Update resource
- `DELETE /api/resources/:id` - Delete resource

### Projects

- `GET /api/projects` - List all projects
- `GET /api/projects/:id?include_work_packages=true` - Get project with work packages
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Work Packages

- `GET /api/work-packages` - List all work packages
- `GET /api/work-packages/:id?include_activities=true` - Get work package with activities
- `GET /api/work-packages/budget-status` - Get budget status for all WPs
- `POST /api/work-packages` - Create work package
- `PUT /api/work-packages/:id` - Update work package (triggers audit log)
- `DELETE /api/work-packages/:id` - Delete work package

### Activities

- `GET /api/activities` - List all activities
- `GET /api/activities/resource/:resourceId` - Get activities by resource
- `GET /api/activities/work-package/:wpId` - Get activities by work package
- `POST /api/activities` - Create activity
- `PUT /api/activities/:id` - Update activity (triggers audit log)
- `DELETE /api/activities/:id` - Delete activity

### Change Logs

- `GET /api/change-logs?limit=100` - Get recent change logs
- `GET /api/change-logs/:entityType/:entityId` - Get logs for specific entity
- `GET /api/change-logs/date-range?start_date=X&end_date=Y` - Get logs by date range

### Reports

- `GET /api/reports/capacity/excel?year=2024&month=1` - Export capacity report (Excel)
- `GET /api/reports/capacity/pdf?year=2024&month=1` - Export capacity report (PDF)
- `GET /api/reports/budget/excel` - Export budget report (Excel)
- `GET /api/reports/budget/pdf` - Export budget report (PDF)
- `GET /api/reports/rams-distribution/excel` - Export RAMS distribution (Excel)

## 🎨 Frontend Features

### 1. Capacity Overview Dashboard

- **Interactive Bar Chart**: Visual comparison of capacity vs. planned hours
- **Color-coded Status**: Red (over), Orange (at), Yellow (high), Green (moderate/low)
- **Monthly Selection**: Navigate through different months
- **Export Functions**: Download Excel/PDF reports
- **Capacity Warnings**: Automatic alerts for over-capacity resources

### 2. Budget Benchmarking View

- **Summary Cards**: Quick stats on budget status
- **Comparison Chart**: Standard effort vs. planned hours
- **Filterable Table**: Filter by project and RAMS tag
- **Variance Calculation**: Shows over/under budget amounts and percentages
- **Real-time Updates**: Live tracking of budget status

### 3. Hierarchy Navigator

- **Tree View**: Expandable project → work package → activity hierarchy
- **Lazy Loading**: Load work packages and activities on demand
- **Visual Icons**: Clear distinction between hierarchy levels
- **Detail Display**: Shows dates, effort hours, and RAMS tags
- **Expand/Collapse All**: Quick navigation controls

## 🔒 RAMS Compliance Features

### Audit Trail

- Automatic logging of all modifications via PostgreSQL triggers
- Tracks changes to:
  - Work package standard effort hours
  - Work package RAMS tags
  - Resource assignments
  - Activity planned hours

### Change Log Example

```json
{
  "entity_type": "work_package",
  "entity_id": 5,
  "field_name": "standard_effort_hours",
  "old_value": "150.00",
  "new_value": "180.00",
  "changed_at": "2024-01-15T10:30:00Z"
}
```

### Reporting & Export

- **PDF Reports**: Official workload statements
- **Excel Reports**: Detailed capacity and budget analysis
- **RAMS Distribution**: Resource allocation by discipline
- **Time-stamped**: All exports include generation date

## 📈 Mock Data

The seeding script creates realistic test data:

- **15 Resources**: Mix of 35h and 40h contracts
- **3 Projects**: Multi-month railway projects
- **15 Work Packages**: 5 per project with varied RAMS tags
- **45+ Activities**: Random assignments to test capacity logic

### RAMS Tags Used

- FMECA (Failure Mode, Effects, and Criticality Analysis)
- Hazard Log
- SIL (Safety Integrity Level)
- Risk Assessment
- Safety Case

## 🛠️ Development

### Database Migrations

```bash
# Drop and recreate database
npm run db:setup

# Reseed data
npm run db:seed
```

### Testing Backend API

```bash
# Health check
curl http://localhost:3000/api/health

# Get all resources
curl http://localhost:3000/api/resources

# Get capacity data
curl "http://localhost:3000/api/resources/capacity?year=2024&month=1"
```

## 📝 Environment Variables

### Backend (.env)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rams_workload
DB_USER=postgres
DB_PASSWORD=postgres
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:3000/api
PORT=3001
```

## 🤝 Contributing

This system follows best practices:
- Snake case for database naming
- Camel case for JavaScript/React
- RESTful API design
- Normalized database schema
- Component-based React architecture

## 📄 License

MIT License - Built for RAMS Engineering Teams

## 🆘 Support

For issues or questions:
1. Check the API documentation above
2. Review database schema in `backend/schema.sql`
3. Run capacity validation: `npm run test:capacity`
4. Check browser console and server logs

---

**Built with ❤️ for Railway Safety Engineering Teams**
