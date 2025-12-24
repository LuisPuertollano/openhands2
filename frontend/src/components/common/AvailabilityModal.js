import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { resourcesAPI } from '../../services/api';

const AvailabilityModal = ({ isOpen, onClose, resource, onAvailabilityUpdated }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [overrides, setOverrides] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (resource) {
      setOverrides(resource.monthly_availability_overrides || {});
    }
  }, [resource]);

  const months = [
    { id: 1, name: 'January' },
    { id: 2, name: 'February' },
    { id: 3, name: 'March' },
    { id: 4, name: 'April' },
    { id: 5, name: 'May' },
    { id: 6, name: 'June' },
    { id: 7, name: 'July' },
    { id: 8, name: 'August' },
    { id: 9, name: 'September' },
    { id: 10, name: 'October' },
    { id: 11, name: 'November' },
    { id: 12, name: 'December' },
  ];

  const handleOverrideChange = (monthId, value) => {
    const monthKey = `${selectedYear}-${String(monthId).padStart(2, '0')}`;
    const newOverrides = { ...overrides };
    
    if (value === '' || isNaN(value)) {
      delete newOverrides[monthKey];
    } else {
      newOverrides[monthKey] = { available_days: parseInt(value) };
    }
    
    setOverrides(newOverrides);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await resourcesAPI.update(resource.id, {
        monthly_availability_overrides: overrides
      });
      
      if (onAvailabilityUpdated) {
        onAvailabilityUpdated();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
      console.error('Error updating availability:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!resource) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`📅 Availability: ${resource.name}`} size="large">
      <form onSubmit={handleSubmit} className="availability-form">
        <div className="form-info">
          <p>Define the number of available working days per month. Leave empty to use default working days (excluding weekends).</p>
        </div>

        <div className="year-selector">
          <label>Year:</label>
          <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="months-grid">
          {months.map(month => {
            const monthKey = `${selectedYear}-${String(month.id).padStart(2, '0')}`;
            const value = overrides[monthKey]?.available_days || '';
            
            return (
              <div key={month.id} className="month-override-item">
                <label>{month.name}</label>
                <input
                  type="number"
                  min="0"
                  max="31"
                  value={value}
                  onChange={(e) => handleOverrideChange(month.id, e.target.value)}
                  placeholder="Default"
                />
              </div>
            );
          })}
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : '✓ Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AvailabilityModal;
