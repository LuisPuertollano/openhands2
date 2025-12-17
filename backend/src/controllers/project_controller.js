const Project = require('../models/project');

class ProjectController {
  static async getAll(req, res) {
    try {
      const projects = await Project.findAll();
      res.json({ success: true, data: projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const { include_work_packages } = req.query;
      
      let project;
      if (include_work_packages === 'true') {
        project = await Project.getWithWorkPackages(id);
      } else {
        project = await Project.findById(id);
      }
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      res.json({ success: true, data: project });
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const project = await Project.create(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.update(id, req.body);
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      res.json({ success: true, data: project });
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.delete(id);
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ProjectController;
