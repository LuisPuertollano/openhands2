const db = require('../config/database');

class Activity {
  static async findAll() {
    const result = await db.query(
      `SELECT a.*, 
              r.name as resource_name,
              wp.name as work_package_name,
              wp.rams_tag,
              p.name as project_name
       FROM activities a
       JOIN resources r ON a.resource_id = r.id
       JOIN work_packages wp ON a.work_package_id = wp.id
       JOIN projects p ON wp.project_id = p.id
       ORDER BY a.start_date DESC`
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT a.*, 
              r.name as resource_name,
              wp.name as work_package_name,
              wp.rams_tag,
              p.name as project_name
       FROM activities a
       JOIN resources r ON a.resource_id = r.id
       JOIN work_packages wp ON a.work_package_id = wp.id
       JOIN projects p ON wp.project_id = p.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByResource(resourceId) {
    const result = await db.query(
      `SELECT a.*, 
              wp.name as work_package_name,
              wp.rams_tag,
              p.name as project_name
       FROM activities a
       JOIN work_packages wp ON a.work_package_id = wp.id
       JOIN projects p ON wp.project_id = p.id
       WHERE a.resource_id = $1
       ORDER BY a.start_date`,
      [resourceId]
    );
    return result.rows;
  }

  static async findByWorkPackage(workPackageId) {
    const result = await db.query(
      `SELECT a.*, r.name as resource_name
       FROM activities a
       JOIN resources r ON a.resource_id = r.id
       WHERE a.work_package_id = $1
       ORDER BY a.start_date`,
      [workPackageId]
    );
    return result.rows;
  }

  static async create(data) {
    const { work_package_id, resource_id, planned_hours, start_date, end_date } = data;
    const result = await db.query(
      `INSERT INTO activities (work_package_id, resource_id, planned_hours, start_date, end_date) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [work_package_id, resource_id, planned_hours, start_date, end_date]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { work_package_id, resource_id, planned_hours, start_date, end_date } = data;
    const result = await db.query(
      `UPDATE activities 
       SET work_package_id = COALESCE($1, work_package_id),
           resource_id = COALESCE($2, resource_id),
           planned_hours = COALESCE($3, planned_hours),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date)
       WHERE id = $6 RETURNING *`,
      [work_package_id, resource_id, planned_hours, start_date, end_date, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM activities WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = Activity;
