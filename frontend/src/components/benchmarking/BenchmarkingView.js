import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { workPackagesAPI, reportsAPI } from '../../services/api';
import { getBudgetColor, formatHours, downloadFile } from '../../utils/helpers';

const BenchmarkingView = () => {
  const [budgetData, setBudgetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterProject, setFilterProject] = useState('ALL');
  const [filterRAMS, setFilterRAMS] = useState('ALL');

  useEffect(() => {
    loadBudgetData();
  }, []);

  const loadBudgetData = async () => {
    try {
      setLoading(true);
      const response = await workPackagesAPI.getAllBudgetStatus();
      setBudgetData(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load budget data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await reportsAPI.exportBudgetExcel();
      downloadFile(response.data, 'budget-report.xlsx');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await reportsAPI.exportBudgetPDF();
      downloadFile(response.data, 'budget-report.pdf');
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export report');
    }
  };

  if (loading) return <div className="loading">Loading budget data...</div>;
  if (error) return <div className="error">{error}</div>;

  const projects = ['ALL', ...new Set(budgetData.map(wp => wp.project_name))];
  const ramsTags = ['ALL', ...new Set(budgetData.map(wp => wp.rams_tag))];

  const filteredData = budgetData.filter(wp => {
    const projectMatch = filterProject === 'ALL' || wp.project_name === filterProject;
    const ramsMatch = filterRAMS === 'ALL' || wp.rams_tag === filterRAMS;
    return projectMatch && ramsMatch;
  });

  const overBudget = filteredData.filter(wp => wp.budget_status === 'OVER_BUDGET');
  const atBudget = filteredData.filter(wp => wp.budget_status === 'AT_BUDGET');
  const underBudget = filteredData.filter(wp => wp.budget_status === 'UNDER_BUDGET');

  const chartData = filteredData.slice(0, 10).map(wp => ({
    name: wp.work_package_name.length > 20 
      ? wp.work_package_name.substring(0, 20) + '...' 
      : wp.work_package_name,
    standard: parseFloat(wp.standard_effort_hours),
    planned: parseFloat(wp.total_planned_hours),
    status: wp.budget_status,
  }));

  return (
    <div className="benchmarking-view">
      <div className="header">
        <h2>Work Package Budget Benchmarking</h2>
        <div className="controls">
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}>
            {projects.map(proj => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
          <select value={filterRAMS} onChange={e => setFilterRAMS(e.target.value)}>
            {ramsTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
          <button onClick={handleExportExcel}>Export Excel</button>
          <button onClick={handleExportPDF}>Export PDF</button>
        </div>
      </div>

      <div className="summary-cards">
        <div className="card over-budget">
          <h3>Over Budget</h3>
          <div className="count">{overBudget.length}</div>
        </div>
        <div className="card at-budget">
          <h3>At Budget</h3>
          <div className="count">{atBudget.length}</div>
        </div>
        <div className="card under-budget">
          <h3>Under Budget</h3>
          <div className="count">{underBudget.length}</div>
        </div>
        <div className="card total">
          <h3>Total WPs</h3>
          <div className="count">{filteredData.length}</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>Top 10 Work Packages - Standard vs Planned Hours</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="standard" fill="#8884d8" name="Standard Effort" />
            <Bar dataKey="planned" name="Planned Hours">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBudgetColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="budget-table">
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Work Package</th>
              <th>RAMS Tag</th>
              <th>Standard Effort (h)</th>
              <th>Planned Hours (h)</th>
              <th>Variance (h)</th>
              <th>Variance %</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(wp => {
              const variance = parseFloat(wp.total_planned_hours) - parseFloat(wp.standard_effort_hours);
              const variancePercent = (variance / parseFloat(wp.standard_effort_hours)) * 100;
              
              return (
                <tr key={wp.work_package_id} className={wp.budget_status.toLowerCase().replace('_', '-')}>
                  <td>{wp.project_name}</td>
                  <td>{wp.work_package_name}</td>
                  <td><span className="rams-tag">{wp.rams_tag}</span></td>
                  <td>{formatHours(wp.standard_effort_hours)}</td>
                  <td>{formatHours(wp.total_planned_hours)}</td>
                  <td className={variance > 0 ? 'negative' : 'positive'}>
                    {variance > 0 ? '+' : ''}{formatHours(variance)}
                  </td>
                  <td className={variance > 0 ? 'negative' : 'positive'}>
                    {variance > 0 ? '+' : ''}{variancePercent.toFixed(1)}%
                  </td>
                  <td>
                    <span 
                      className={`status-badge ${wp.budget_status.toLowerCase()}`}
                      style={{ backgroundColor: getBudgetColor(wp.budget_status) }}
                    >
                      {wp.budget_status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BenchmarkingView;
