const db = require('../config/database');

class Project {
  static async findAll() {
    const result = await db.query(
      'SELECT * FROM projects ORDER BY start_date DESC'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { name, start_date, end_date } = data;
    const result = await db.query(
      `INSERT INTO projects (name, start_date, end_date) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, start_date, end_date]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, start_date, end_date } = data;
    const result = await db.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           start_date = COALESCE($2, start_date),
           end_date = COALESCE($3, end_date)
       WHERE id = $4 RETURNING *`,
      [name, start_date, end_date, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM projects WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getWithWorkPackages(id) {
    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    
    const wpResult = await db.query(
      'SELECT * FROM work_packages WHERE project_id = $1 ORDER BY name',
      [id]
    );

    const project = projectResult.rows[0];
    if (project) {
      project.work_packages = wpResult.rows;
    }
    
    return project;
  }
}

module.exports = Project;
