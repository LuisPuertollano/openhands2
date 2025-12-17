const db = require('../config/database');

class Resource {
  static async findAll() {
    const result = await db.query(
      'SELECT * FROM resources ORDER BY name'
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM resources WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { name, contract_hours, monthly_availability_overrides } = data;
    const result = await db.query(
      `INSERT INTO resources (name, contract_hours, monthly_availability_overrides) 
       VALUES ($1, $2, $3) RETURNING *`,
      [name, contract_hours, monthly_availability_overrides || {}]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const { name, contract_hours, monthly_availability_overrides } = data;
    const result = await db.query(
      `UPDATE resources 
       SET name = COALESCE($1, name),
           contract_hours = COALESCE($2, contract_hours),
           monthly_availability_overrides = COALESCE($3, monthly_availability_overrides)
       WHERE id = $4 RETURNING *`,
      [name, contract_hours, monthly_availability_overrides, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await db.query(
      'DELETE FROM resources WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async getMonthlyUtilization(resourceId, year, month) {
    const result = await db.query(
      `SELECT 
        r.id,
        r.name,
        r.contract_hours,
        r.monthly_availability_overrides,
        COALESCE(SUM(a.planned_hours), 0) as total_planned_hours
       FROM resources r
       LEFT JOIN activities a ON r.id = a.resource_id
       WHERE r.id = $1
         AND EXTRACT(YEAR FROM a.start_date) = $2
         AND EXTRACT(MONTH FROM a.start_date) = $3
       GROUP BY r.id, r.name, r.contract_hours, r.monthly_availability_overrides`,
      [resourceId, year, month]
    );
    return result.rows[0];
  }

  static async getAllMonthlyUtilization(year, month) {
    const result = await db.query(
      `SELECT 
        r.id,
        r.name,
        r.contract_hours,
        r.monthly_availability_overrides,
        COALESCE(SUM(a.planned_hours), 0) as total_planned_hours
       FROM resources r
       LEFT JOIN activities a ON r.id = a.resource_id
         AND EXTRACT(YEAR FROM a.start_date) = $1
         AND EXTRACT(MONTH FROM a.start_date) = $2
       GROUP BY r.id, r.name, r.contract_hours, r.monthly_availability_overrides
       ORDER BY r.name`,
      [year, month]
    );
    return result.rows;
  }
}

module.exports = Resource;
