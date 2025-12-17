-- ============================================
-- RAMS Workload Management System - Database Schema
-- ============================================

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS change_logs CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS work_packages CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS resources CASCADE;

-- ============================================
-- Resources Table
-- ============================================
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contract_hours INTEGER NOT NULL CHECK (contract_hours IN (35, 40)),
    monthly_availability_overrides JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_resources_name ON resources(name);

-- ============================================
-- Projects Table
-- ============================================
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_project_dates CHECK (end_date >= start_date)
);

-- Index for date range queries
CREATE INDEX idx_projects_dates ON projects(start_date, end_date);

-- ============================================
-- Work Packages Table
-- ============================================
CREATE TABLE work_packages (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    rams_tag VARCHAR(100) NOT NULL,
    standard_effort_hours DECIMAL(10, 2) NOT NULL CHECK (standard_effort_hours >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster lookups
CREATE INDEX idx_work_packages_project ON work_packages(project_id);
CREATE INDEX idx_work_packages_rams_tag ON work_packages(rams_tag);

-- ============================================
-- Activities Table
-- ============================================
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    work_package_id INTEGER NOT NULL REFERENCES work_packages(id) ON DELETE CASCADE,
    resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    planned_hours DECIMAL(10, 2) NOT NULL CHECK (planned_hours >= 0),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_activity_dates CHECK (end_date >= start_date)
);

-- Indexes for faster lookups
CREATE INDEX idx_activities_work_package ON activities(work_package_id);
CREATE INDEX idx_activities_resource ON activities(resource_id);
CREATE INDEX idx_activities_dates ON activities(start_date, end_date);
CREATE INDEX idx_activities_resource_dates ON activities(resource_id, start_date, end_date);

-- ============================================
-- Change Logs Table (Audit Trail)
-- ============================================
CREATE TABLE change_logs (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by VARCHAR(255),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for querying audit history
CREATE INDEX idx_change_logs_entity ON change_logs(entity_type, entity_id);
CREATE INDEX idx_change_logs_date ON change_logs(changed_at);

-- ============================================
-- Update Timestamp Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all main tables
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_packages_updated_at BEFORE UPDATE ON work_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Audit Trail Trigger Function
-- ============================================
CREATE OR REPLACE FUNCTION log_work_package_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.standard_effort_hours IS DISTINCT FROM NEW.standard_effort_hours THEN
        INSERT INTO change_logs (entity_type, entity_id, field_name, old_value, new_value)
        VALUES ('work_package', NEW.id, 'standard_effort_hours', OLD.standard_effort_hours::TEXT, NEW.standard_effort_hours::TEXT);
    END IF;
    
    IF OLD.rams_tag IS DISTINCT FROM NEW.rams_tag THEN
        INSERT INTO change_logs (entity_type, entity_id, field_name, old_value, new_value)
        VALUES ('work_package', NEW.id, 'rams_tag', OLD.rams_tag, NEW.rams_tag);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_work_package_updates AFTER UPDATE ON work_packages
    FOR EACH ROW EXECUTE FUNCTION log_work_package_changes();

-- ============================================
-- Audit Trail for Activity Resource Changes
-- ============================================
CREATE OR REPLACE FUNCTION log_activity_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.resource_id IS DISTINCT FROM NEW.resource_id THEN
        INSERT INTO change_logs (entity_type, entity_id, field_name, old_value, new_value)
        VALUES ('activity', NEW.id, 'resource_id', OLD.resource_id::TEXT, NEW.resource_id::TEXT);
    END IF;
    
    IF OLD.planned_hours IS DISTINCT FROM NEW.planned_hours THEN
        INSERT INTO change_logs (entity_type, entity_id, field_name, old_value, new_value)
        VALUES ('activity', NEW.id, 'planned_hours', OLD.planned_hours::TEXT, NEW.planned_hours::TEXT);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_activity_updates AFTER UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION log_activity_changes();

-- ============================================
-- Helper View: Monthly Resource Utilization
-- ============================================
CREATE OR REPLACE VIEW monthly_resource_utilization AS
SELECT 
    r.id as resource_id,
    r.name as resource_name,
    r.contract_hours,
    EXTRACT(YEAR FROM a.start_date) as year,
    EXTRACT(MONTH FROM a.start_date) as month,
    SUM(a.planned_hours) as total_planned_hours
FROM resources r
LEFT JOIN activities a ON r.id = a.resource_id
GROUP BY r.id, r.name, r.contract_hours, EXTRACT(YEAR FROM a.start_date), EXTRACT(MONTH FROM a.start_date);

-- ============================================
-- Helper View: Work Package Budget Status
-- ============================================
CREATE OR REPLACE VIEW work_package_budget_status AS
SELECT 
    wp.id as work_package_id,
    wp.name as work_package_name,
    wp.rams_tag,
    wp.standard_effort_hours,
    COALESCE(SUM(a.planned_hours), 0) as total_planned_hours,
    wp.standard_effort_hours - COALESCE(SUM(a.planned_hours), 0) as hours_remaining,
    CASE 
        WHEN COALESCE(SUM(a.planned_hours), 0) > wp.standard_effort_hours THEN 'OVER_BUDGET'
        WHEN COALESCE(SUM(a.planned_hours), 0) = wp.standard_effort_hours THEN 'AT_BUDGET'
        ELSE 'UNDER_BUDGET'
    END as budget_status,
    p.id as project_id,
    p.name as project_name
FROM work_packages wp
JOIN projects p ON wp.project_id = p.id
LEFT JOIN activities a ON wp.id = a.work_package_id
GROUP BY wp.id, wp.name, wp.rams_tag, wp.standard_effort_hours, p.id, p.name;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE resources IS 'Engineering resources with contract hours and availability overrides';
COMMENT ON TABLE projects IS 'Top-level projects containing work packages';
COMMENT ON TABLE work_packages IS 'Work packages linked to projects with RAMS tags and standard effort estimates';
COMMENT ON TABLE activities IS 'Individual activities assigned to resources with planned hours';
COMMENT ON TABLE change_logs IS 'Audit trail for tracking changes to work packages and resource assignments';
COMMENT ON COLUMN resources.monthly_availability_overrides IS 'JSONB format: {"2024-01": {"available_days": 15, "reason": "vacation"}}';
