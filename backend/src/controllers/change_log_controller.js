const ChangeLog = require('../models/change_log');

class ChangeLogController {
  static async getAll(req, res) {
    try {
      const { limit } = req.query;
      const changeLogs = await ChangeLog.findAll(limit ? parseInt(limit) : 100);
      res.json({ success: true, data: changeLogs });
    } catch (error) {
      console.error('Error fetching change logs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByEntity(req, res) {
    try {
      const { entityType, entityId } = req.params;
      const changeLogs = await ChangeLog.findByEntity(entityType, entityId);
      res.json({ success: true, data: changeLogs });
    } catch (error) {
      console.error('Error fetching change logs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({ 
          success: false, 
          error: 'start_date and end_date query parameters are required' 
        });
      }

      const changeLogs = await ChangeLog.findByDateRange(start_date, end_date);
      res.json({ success: true, data: changeLogs });
    } catch (error) {
      console.error('Error fetching change logs:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ChangeLogController;
