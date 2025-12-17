const WorkPackage = require('../models/work_package');

class WorkPackageController {
  static async getAll(req, res) {
    try {
      const workPackages = await WorkPackage.findAll();
      res.json({ success: true, data: workPackages });
    } catch (error) {
      console.error('Error fetching work packages:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { include_activities } = req.query;
      
      let workPackage;
      if (include_activities === 'true') {
        workPackage = await WorkPackage.getWithActivities(id);
      } else {
        workPackage = await WorkPackage.findById(id);
      }
      
      if (!workPackage) {
        return res.status(404).json({ success: false, error: 'Work package not found' });
      }
      
      res.json({ success: true, data: workPackage });
    } catch (error) {
      console.error('Error fetching work package:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getByProject(req, res) {
    try {
      const { projectId } = req.params;
      const workPackages = await WorkPackage.findByProject(projectId);
      res.json({ success: true, data: workPackages });
    } catch (error) {
      console.error('Error fetching work packages:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const workPackage = await WorkPackage.create(req.body);
      res.status(201).json({ success: true, data: workPackage });
    } catch (error) {
      console.error('Error creating work package:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const workPackage = await WorkPackage.update(id, req.body);
      
      if (!workPackage) {
        return res.status(404).json({ success: false, error: 'Work package not found' });
      }
      
      res.json({ success: true, data: workPackage });
    } catch (error) {
      console.error('Error updating work package:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const workPackage = await WorkPackage.delete(id);
      
      if (!workPackage) {
        return res.status(404).json({ success: false, error: 'Work package not found' });
      }
      
      res.json({ success: true, message: 'Work package deleted successfully' });
    } catch (error) {
      console.error('Error deleting work package:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getBudgetStatus(req, res) {
    try {
      const { id } = req.params;
      const budgetStatus = await WorkPackage.getBudgetStatus(id);
      
      if (!budgetStatus) {
        return res.status(404).json({ success: false, error: 'Work package not found' });
      }
      
      res.json({ success: true, data: budgetStatus });
    } catch (error) {
      console.error('Error fetching budget status:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllBudgetStatus(req, res) {
    try {
      const budgetStatuses = await WorkPackage.getAllBudgetStatus();
      res.json({ success: true, data: budgetStatuses });
    } catch (error) {
      console.error('Error fetching budget statuses:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = WorkPackageController;
