const Resource = require('../models/resource');
const CapacityService = require('../services/capacity_service');

class ResourceController {
  static async getAll(req, res) {
    try {
      const resources = await Resource.findAll();
      res.json({ success: true, data: resources });
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const resource = await Resource.findById(id);
      
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }
      
      res.json({ success: true, data: resource });
    } catch (error) {
      console.error('Error fetching resource:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const resource = await Resource.create(req.body);
      res.status(201).json({ success: true, data: resource });
    } catch (error) {
      console.error('Error creating resource:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const resource = await Resource.update(id, req.body);
      
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }
      
      res.json({ success: true, data: resource });
    } catch (error) {
      console.error('Error updating resource:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const resource = await Resource.delete(id);
      
      if (!resource) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }
      
      res.json({ success: true, message: 'Resource deleted successfully' });
    } catch (error) {
      console.error('Error deleting resource:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getCapacity(req, res) {
    try {
      const { id } = req.params;
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ 
          success: false, 
          error: 'Year and month query parameters are required' 
        });
      }

      const utilization = await Resource.getMonthlyUtilization(
        id, 
        parseInt(year), 
        parseInt(month)
      );
      
      if (!utilization) {
        return res.status(404).json({ success: false, error: 'Resource not found' });
      }

      const enriched = CapacityService.enrichResourceWithCapacity(
        utilization,
        parseInt(year),
        parseInt(month)
      );
      
      res.json({ success: true, data: enriched });
    } catch (error) {
      console.error('Error fetching resource capacity:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getAllCapacity(req, res) {
    try {
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ 
          success: false, 
          error: 'Year and month query parameters are required' 
        });
      }

      const utilizations = await Resource.getAllMonthlyUtilization(
        parseInt(year),
        parseInt(month)
      );

      const enriched = utilizations.map(util => 
        CapacityService.enrichResourceWithCapacity(
          util,
          parseInt(year),
          parseInt(month)
        )
      );

      const warnings = CapacityService.generateCapacityWarnings(enriched);
      
      res.json({ 
        success: true, 
        data: enriched,
        warnings 
      });
    } catch (error) {
      console.error('Error fetching all resource capacity:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ResourceController;
