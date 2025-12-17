import React, { useState } from 'react';
import Modal from './Modal';
import { resourcesAPI } from '../../services/api';

const AddResourceModal = ({ isOpen, onClose, onResourceAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    contract_hours: '35',
    monthly_availability_overrides: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        contract_hours: parseInt(formData.contract_hours),
        monthly_availability_overrides: formData.monthly_availability_overrides
      };

      await resourcesAPI.create(payload);
      
      setFormData({ name: '', contract_hours: '35', monthly_availability_overrides: {} });
      
      if (onResourceAdded) {
        onResourceAdded();
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create resource');
      console.error('Error creating resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="➕ Add New Resource">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="name">
            Resource Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., John Smith"
            required
            disabled={loading}
          />
          <small>Full name of the team member</small>
        </div>

        <div className="form-group">
          <label htmlFor="contract_hours">
            Contract Hours (per week) <span className="required">*</span>
          </label>
          <select
            id="contract_hours"
            name="contract_hours"
            value={formData.contract_hours}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="35">35 hours/week</option>
            <option value="40">40 hours/week</option>
          </select>
          <small>Standard weekly working hours</small>
        </div>

        <div className="form-info">
          <strong>ℹ️ Note:</strong> Monthly availability overrides (vacations, absences) 
          can be configured after creating the resource in the resource management section.
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Creating...' : '✓ Create Resource'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddResourceModal;
