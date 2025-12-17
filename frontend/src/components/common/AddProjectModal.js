import React, { useState } from 'react';
import Modal from './Modal';
import { projectsAPI } from '../../services/api';

const AddProjectModal = ({ isOpen, onClose, onProjectAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      await projectsAPI.create(formData);
      
      setFormData({ name: '', start_date: '', end_date: '' });
      
      if (onProjectAdded) {
        onProjectAdded();
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Add New Project">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="name">
            Project Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., High-Speed Rail Line Extension"
            required
            disabled={loading}
          />
          <small>Descriptive name for the railway project</small>
        </div>

        <div className="form-group">
          <label htmlFor="start_date">
            Start Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <small>Project commencement date</small>
        </div>

        <div className="form-group">
          <label htmlFor="end_date">
            End Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
            disabled={loading}
            min={formData.start_date}
          />
          <small>Expected project completion date</small>
        </div>

        <div className="form-info">
          <strong>ℹ️ Next Steps:</strong> After creating the project, you can add 
          Work Packages (FMECA, Hazard Log, SIL, etc.) to define the scope of work.
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : '✓ Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal;
