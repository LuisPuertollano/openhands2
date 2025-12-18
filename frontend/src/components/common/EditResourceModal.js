import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { resourcesAPI } from '../../services/api';

const EditResourceModal = ({ isOpen, onClose, onResourceUpdated, resource }) => {
  const [formData, setFormData] = useState({
    name: '',
    contract_hours: '35',
    monthly_availability_overrides: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resource) {
      setFormData({
        name: resource.name || '',
        contract_hours: (resource.contract_hours || 35).toString(),
        monthly_availability_overrides: resource.monthly_availability_overrides || {}
      });
    }
  }, [resource]);

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

      await resourcesAPI.update(resource.id, payload);
      
      if (onResourceUpdated) {
        onResourceUpdated();
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update resource');
      console.error('Error updating resource:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!resource) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Edit Resource">
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
          can be configured in the resource management section.
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Updating...' : '✓ Update Resource'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditResourceModal;
