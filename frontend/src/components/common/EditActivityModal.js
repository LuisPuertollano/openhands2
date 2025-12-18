import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { activitiesAPI, resourcesAPI, workPackagesAPI } from '../../services/api';

const EditActivityModal = ({ isOpen, onClose, onActivityUpdated, activity }) => {
  const [formData, setFormData] = useState({
    work_package_id: '',
    resource_id: '',
    planned_hours: '',
    start_date: '',
    end_date: ''
  });
  const [resources, setResources] = useState([]);
  const [workPackages, setWorkPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (activity) {
      setFormData({
        work_package_id: activity.work_package_id || '',
        resource_id: activity.resource_id || '',
        planned_hours: activity.planned_hours || '',
        start_date: activity.start_date ? activity.start_date.split('T')[0] : '',
        end_date: activity.end_date ? activity.end_date.split('T')[0] : ''
      });
    }
  }, [activity]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [resourcesRes, workPackagesRes] = await Promise.all([
        resourcesAPI.getAll(),
        workPackagesAPI.getAll()
      ]);
      setResources(resourcesRes.data.data);
      setWorkPackages(workPackagesRes.data.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoadingData(false);
    }
  };

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
      const payload = {
        work_package_id: parseInt(formData.work_package_id),
        resource_id: parseInt(formData.resource_id),
        planned_hours: parseFloat(formData.planned_hours),
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      await activitiesAPI.update(activity.id, payload);
      
      if (onActivityUpdated) {
        onActivityUpdated();
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update activity');
      console.error('Error updating activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectedWorkPackage = workPackages.find(wp => wp.id === parseInt(formData.work_package_id));

  if (!activity) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="✏️ Edit Activity" size="large">
      <form onSubmit={handleSubmit} className="modal-form">
        {error && <div className="form-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="work_package_id">
            Work Package <span className="required">*</span>
          </label>
          <select
            id="work_package_id"
            name="work_package_id"
            value={formData.work_package_id}
            onChange={handleChange}
            required
            disabled={loading || loadingData}
          >
            <option value="">-- Select a work package --</option>
            {workPackages.map(wp => (
              <option key={wp.id} value={wp.id}>
                {wp.name} ({wp.rams_tag})
              </option>
            ))}
          </select>
          <small>The work package this activity belongs to</small>
        </div>

        {selectedWorkPackage && (
          <div className="wp-info">
            <strong>Work Package Details:</strong>
            <ul>
              <li>Project: {selectedWorkPackage.project_name}</li>
              <li>RAMS Tag: {selectedWorkPackage.rams_tag}</li>
              <li>Standard Effort: {selectedWorkPackage.standard_effort_hours}h</li>
            </ul>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="resource_id">
            Resource <span className="required">*</span>
          </label>
          <select
            id="resource_id"
            name="resource_id"
            value={formData.resource_id}
            onChange={handleChange}
            required
            disabled={loading || loadingData}
          >
            <option value="">-- Select a resource --</option>
            {resources.map(resource => (
              <option key={resource.id} value={resource.id}>
                {resource.name} ({resource.contract_hours}h/week)
              </option>
            ))}
          </select>
          <small>The team member assigned to this activity</small>
        </div>

        <div className="form-group">
          <label htmlFor="planned_hours">
            Planned Hours <span className="required">*</span>
          </label>
          <input
            type="number"
            id="planned_hours"
            name="planned_hours"
            value={formData.planned_hours}
            onChange={handleChange}
            placeholder="e.g., 40"
            step="0.5"
            min="0"
            required
            disabled={loading}
          />
          <small>Total hours allocated for this activity</small>
        </div>

        <div className="form-row">
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
            <small>Activity start date</small>
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
            <small>Activity end date</small>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Updating...' : '✓ Update Activity'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditActivityModal;
