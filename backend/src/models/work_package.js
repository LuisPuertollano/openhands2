const db = require('../config/database');

class WorkPackage {
  static async findAll() {
    const result = await db.query(
      `SELECT wp.*, p.name as project_name 
       FROM work_packages wp
       JOIN projects p ON wp.project_id = p.id
       ORDER BY p.name, wp.name`
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT wp.*, p.name as project_name 
       FROM work_packages wp
       JOIN projects p ON wp.project_id = p.id
       WHERE wp.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByProject(projectId) {
    const result = await db.query(
      'SELECT * FROM work_packages WHERE project_id = $1 ORDER BY name',
      [projectId]
    );
    return result.rows;
  }

  static async create(data) {
    const { project_id, name, rams_tag, standard_effort_hours } = data;
    const result = await db.query(
      `INSERT INTO work_packages (project_id, name, rams_tag, standard_effort_hours) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [project_id, name, rams_tag, standard_effort_hours]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, rams_tag, standard_effort_hours } = data;
    const result = await db.query(
      `UPDATE work_packages 
       SET name = COALESCE($1, name),
           rams_tag = COALESCE($2, rams_tag),
           standard_effort_hours = COALESCE($3, standard_effort_hours)
       WHERE id = $4 RETURNING *`,
      [name, rams_tag, standard_effort_hours, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM work_packages WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getBudgetStatus(id) {
    const result = await db.query(
      `SELECT * FROM work_package_budget_status WHERE work_package_id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async getAllBudgetStatus() {
    const result = await db.query(
      'SELECT * FROM work_package_budget_status ORDER BY project_name, work_package_name'
    );
    return result.rows;
  }

  static async getWithActivities(id) {
    const wpResult = await db.query(
      `SELECT wp.*, p.name as project_name 
       FROM work_packages wp
       JOIN projects p ON wp.project_id = p.id
       WHERE wp.id = $1`,
      [id]
    );
    
    const activitiesResult = await db.query(
      `SELECT a.*, r.name as resource_name 
       FROM activities a
       JOIN resources r ON a.resource_id = r.id
       WHERE a.work_package_id = $1
       ORDER BY a.start_date`,
      [id]
    );

    const workPackage = wpResult.rows[0];
    if (workPackage) {
      workPackage.activities = activitiesResult.rows;
    }
    
    return workPackage;
  }
}

module.exports = WorkPackage;
