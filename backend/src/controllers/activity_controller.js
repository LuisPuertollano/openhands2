const Activity = require('../models/activity');

class ActivityController {
  static async getAll(req, res) {
    try {
      const activities = await Activity.findAll();
      res.json({ success: true, data: activities });
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const activity = await Activity.findById(id);
      
      if (!activity) {
        return res.status(404).json({ success: false, error: 'Activity not found' });
      }
      
      res.json({ success: true, data: activity });
    } catch (error) {
      console.error('Error fetching activity:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByResource(req, res) {
    try {
      const { resourceId } = req.params;
      const activities = await Activity.findByResource(resourceId);
      res.json({ success: true, data: activities });
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByWorkPackage(req, res) {
    try {
      const { workPackageId } = req.params;
      const activities = await Activity.findByWorkPackage(workPackageId);
      res.json({ success: true, data: activities });
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const activity = await Activity.create(req.body);
      res.status(201).json({ success: true, data: activity });
    } catch (error) {
      console.error('Error creating activity:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const activity = await Activity.update(id, req.body);
      
      if (!activity) {
        return res.status(404).json({ success: false, error: 'Activity not found' });
      }
      
      res.json({ success: true, data: activity });
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const activity = await Activity.delete(id);
      
      if (!activity) {
        return res.status(404).json({ success: false, error: 'Activity not found' });
      }
      
      res.json({ success: true, message: 'Activity deleted successfully' });
    } catch (error) {
      console.error('Error deleting activity:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ActivityController;
