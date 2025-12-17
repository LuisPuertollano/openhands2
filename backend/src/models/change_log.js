const db = require('../config/database');

class ChangeLog {
  static async findAll(limit = 100) {
    const result = await db.query(
      'SELECT * FROM change_logs ORDER BY changed_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async findByEntity(entityType, entityId) {
    const result = await db.query(
      `SELECT * FROM change_logs 
       WHERE entity_type = $1 AND entity_id = $2 
       ORDER BY changed_at DESC`,
      [entityType, entityId]
    );
    return result.rows;
  }

  static async findByDateRange(startDate, endDate) {
    const result = await db.query(
      `SELECT * FROM change_logs 
       WHERE changed_at >= $1 AND changed_at <= $2 
       ORDER BY changed_at DESC`,
      [startDate, endDate]
    );
    return result.rows;
  }
}

module.exports = ChangeLog;
