import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { resourcesAPI, reportsAPI } from '../../services/api';
import { getCapacityColor, getCurrentYearMonth, downloadFile } from '../../utils/helpers';
import AddResourceModal from '../common/AddResourceModal';

const CapacityOverview = () => {
  const [capacityData, setCapacityData] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { year, month } = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);

  useEffect(() => {
    loadCapacityData();
  }, [selectedYear, selectedMonth]);

  const loadCapacityData = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAllCapacity(selectedYear, selectedMonth);
      setCapacityData(response.data.data);
      setWarnings(response.data.warnings || []);
      setError(null);
    } catch (err) {
      setError('Failed to load capacity data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await reportsAPI.exportCapacityExcel(selectedYear, selectedMonth);
      downloadFile(response.data, `capacity-report-${selectedYear}-${selectedMonth}.xlsx`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await reportsAPI.exportCapacityPDF(selectedYear, selectedMonth);
      downloadFile(response.data, `capacity-report-${selectedYear}-${selectedMonth}.pdf`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report');
    }
  };

  if (loading) return <div className="loading">Loading capacity data...</div>;
  if (error) return <div className="error">{error}</div>;

  const chartData = capacityData.map(resource => ({
    name: resource.name,
    capacity: parseFloat(resource.monthly_capacity),
    planned: parseFloat(resource.total_planned_hours),
    utilization: resource.utilization_percentage,
  }));

  return (
    <div className="capacity-overview">
      <div className="header">
        <h2>Resource Capacity Overview</h2>
        <div className="controls">
          <button onClick={() => setShowAddResourceModal(true)} className="btn-add">
            ➕ Add Resource
          </button>
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(2024, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <button onClick={handleExportExcel}>Export Excel</button>
          <button onClick={handleExportPDF}>Export PDF</button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warnings">
          <h3>⚠️ Capacity Warnings</h3>
          {warnings.map((warning, idx) => (
            <div key={idx} className={`warning ${warning.severity.toLowerCase()}`}>
              <strong>{warning.type}:</strong> {warning.message}
            </div>
          ))}
        </div>
      )}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="capacity" fill="#8884d8" name="Monthly Capacity" />
            <Bar dataKey="planned" name="Planned Hours">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getCapacityColor(entry.utilization)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="capacity-table">
        <table>
          <thead>
            <tr>
              <th>Resource</th>
              <th>Contract</th>
              <th>Capacity (h)</th>
              <th>Planned (h)</th>
              <th>Available (h)</th>
              <th>Utilization</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {capacityData.map(resource => (
              <tr key={resource.id} className={resource.is_over_capacity ? 'over-capacity' : ''}>
                <td>{resource.name}</td>
                <td>{resource.contract_hours}h</td>
                <td>{resource.monthly_capacity.toFixed(1)}</td>
                <td>{resource.total_planned_hours.toFixed(1)}</td>
                <td>{resource.available_hours.toFixed(1)}</td>
                <td>
                  <div className="utilization-bar">
                    <div 
                      className="utilization-fill" 
                      style={{
                        width: `${Math.min(resource.utilization_percentage, 100)}%`,
                        backgroundColor: getCapacityColor(resource.utilization_percentage)
                      }}
                    />
                    <span>{resource.utilization_percentage.toFixed(1)}%</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${resource.capacity_status.toLowerCase()}`}>
                    {resource.capacity_status.replace(/_/g, ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddResourceModal
        isOpen={showAddResourceModal}
        onClose={() => setShowAddResourceModal(false)}
        onResourceAdded={loadCapacityData}
      />
    </div>
  );
};

export default CapacityOverview;
