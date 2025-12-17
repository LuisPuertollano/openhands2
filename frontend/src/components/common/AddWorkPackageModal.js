import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { workPackagesAPI, projectsAPI } from '../../services/api';

const RAMS_TAGS = [
  'FMECA',
  'Hazard Log',
  'SIL Analysis',
  'Safety Case',
  'Risk Assessment',
  'THR Analysis',
  'FTA',
  'ETA',
  'HAZOP',
  'Other'
];

const AddWorkPackageModal = ({ isOpen, onClose, onWorkPackageAdded, preselectedProjectId = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    project_id: preselectedProjectId || '',
    standard_effort_hours: '',
    rams_tag: 'FMECA'
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  useEffect(() => {
    if (preselectedProjectId) {
      setFormData(prev => ({ ...prev, project_id: preselectedProjectId }));
    }
  }, [preselectedProjectId]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data.data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        project_id: parseInt(formData.project_id),
        standard_effort_hours: parseFloat(formData.standard_effort_hours),
        rams_tag: formData.rams_tag
      };

      await workPackagesAPI.create(payload);
      
      setFormData({ 
        name: '', 
        project_id: preselectedProjectId || '', 
        standard_effort_hours: '', 
        rams_tag: 'FMECA' 
      });
      
      if (onWorkPackageAdded) {
        onWorkPackageAdded();
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create work package');
      console.error('Error creating work package:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Add New Work Package" size="large">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="project_id">
            Project <span className="required">*</span>
          </label>
          <select
            id="project_id"
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            required
            disabled={loading || loadingProjects || preselectedProjectId}
          >
            <option value="">-- Select a project --</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <small>The parent project for this work package</small>
        </div>

        <div className="form-group">
          <label htmlFor="name">
            Work Package Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., FMECA for Signaling System"
            required
            disabled={loading}
          />
          <small>Descriptive name for this work package</small>
        </div>

        <div className="form-group">
          <label htmlFor="rams_tag">
            RAMS Discipline <span className="required">*</span>
          </label>
          <select
            id="rams_tag"
            name="rams_tag"
            value={formData.rams_tag}
            onChange={handleChange}
            required
            disabled={loading}
          >
            {RAMS_TAGS.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <small>Safety engineering discipline category</small>
        </div>

        <div className="form-group">
          <label htmlFor="standard_effort_hours">
            Standard Effort (hours) <span className="required">*</span>
          </label>
          <input
            type="number"
            id="standard_effort_hours"
            name="standard_effort_hours"
            value={formData.standard_effort_hours}
            onChange={handleChange}
            placeholder="e.g., 160"
            step="0.5"
            min="0"
            required
            disabled={loading}
          />
          <small>
            Estimated effort budget for this work package (used for benchmarking)
          </small>
        </div>

        <div className="rams-tags-info">
          <strong>📋 RAMS Discipline Categories:</strong>
          <ul>
            <li><strong>FMECA:</strong> Failure Modes, Effects & Criticality Analysis</li>
            <li><strong>Hazard Log:</strong> Hazard identification and tracking</li>
            <li><strong>SIL Analysis:</strong> Safety Integrity Level assessment</li>
            <li><strong>Safety Case:</strong> Safety justification documentation</li>
            <li><strong>Risk Assessment:</strong> Risk evaluation and mitigation</li>
            <li><strong>THR Analysis:</strong> Tolerable Hazard Rate analysis</li>
            <li><strong>FTA:</strong> Fault Tree Analysis</li>
            <li><strong>ETA:</strong> Event Tree Analysis</li>
            <li><strong>HAZOP:</strong> Hazard and Operability Study</li>
          </ul>
        </div>

        <div className="form-info">
          <strong>ℹ️ Next Steps:</strong> After creating the work package, you can assign 
          activities to team members with specific effort allocations.
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : '✓ Create Work Package'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddWorkPackageModal;
