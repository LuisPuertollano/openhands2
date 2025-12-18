import React, { useState, useEffect } from 'react';
import { resourcesAPI, projectsAPI, activitiesAPI } from '../../services/api';
import { getCurrentYearMonth, downloadFile } from '../../utils/helpers';
import '../../styles/Workload.css';

const WorkloadView = () => {
  const [workloadData, setWorkloadData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { year } = getCurrentYearMonth();
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedResource, setSelectedResource] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');
  const [resources, setResources] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadFilterData();
  }, []);

  useEffect(() => {
    if (resources.length > 0 && projects.length > 0) {
      loadWorkloadData();
    }
  }, [selectedYear, selectedResource, selectedProject, resources, projects]);

  const loadFilterData = async () => {
    try {
      const [resourcesRes, projectsRes] = await Promise.all([
        resourcesAPI.getAll(),
        projectsAPI.getAll()
      ]);
      setResources(resourcesRes.data.data);
      setProjects(projectsRes.data.data);
    } catch (err) {
      console.error('Failed to load filter data:', err);
    }
  };

  const loadWorkloadData = async () => {
    try {
      setLoading(true);
      
      // Get all activities
      const activitiesRes = await activitiesAPI.getAll();
      const activities = activitiesRes.data.data;

      // Process activities into workload data
      const workloadMap = {};

      activities.forEach(activity => {
        // Filter by selected resource and project
        if (selectedResource !== 'all' && activity.resource_id !== parseInt(selectedResource)) {
          return;
        }
        if (selectedProject !== 'all' && activity.project_id !== parseInt(selectedProject)) {
          return;
        }

        const startDate = new Date(activity.start_date);
        const endDate = new Date(activity.end_date);
        
        // Calculate months between start and end
        const months = [];
        const current = new Date(startDate);
        while (current <= endDate) {
          if (current.getFullYear() === selectedYear) {
            months.push(current.getMonth() + 1); // 1-based month
          }
          current.setMonth(current.getMonth() + 1);
        }

        // Distribute hours evenly across months
        const hoursPerMonth = activity.planned_hours / months.length;

        months.forEach(month => {
          const key = `${activity.resource_id}-${activity.project_id}-${month}`;
          
          if (!workloadMap[key]) {
            workloadMap[key] = {
              resource_id: activity.resource_id,
              resource_name: activity.resource_name,
              project_id: activity.project_id,
              project_name: activity.project_name,
              month: month,
              total_hours: 0,
              activities: []
            };
          }

          workloadMap[key].total_hours += hoursPerMonth;
          workloadMap[key].activities.push({
            id: activity.id,
            work_package_name: activity.work_package_name,
            hours: hoursPerMonth
          });
        });
      });

      const workloadArray = Object.values(workloadMap);
      workloadArray.sort((a, b) => {
        if (a.resource_name !== b.resource_name) {
          return a.resource_name.localeCompare(b.resource_name);
        }
        if (a.project_name !== b.project_name) {
          return a.project_name.localeCompare(b.project_name);
        }
        return a.month - b.month;
      });

      setWorkloadData(workloadArray);
      setError(null);
    } catch (err) {
      setError('Failed to load workload data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      // For now, export as CSV. Backend endpoint will be created next
      const csv = generateCSV();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workload-${selectedYear}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export workload data');
    }
  };

  const generateCSV = () => {
    const headers = ['Resource', 'Project', 'Month', 'Total Hours', 'Work Packages'];
    const rows = workloadData.map(item => [
      item.resource_name,
      item.project_name,
      getMonthName(item.month),
      item.total_hours.toFixed(2),
      item.activities.map(a => a.work_package_name).join('; ')
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
  };

  const getMonthName = (monthNum) => {
    const date = new Date(2024, monthNum - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  const getMonthlyTotals = () => {
    const totals = {};
    for (let i = 1; i <= 12; i++) {
      totals[i] = 0;
    }
    
    workloadData.forEach(item => {
      totals[item.month] += item.total_hours;
    });
    
    return totals;
  };

  const getResourceTotals = () => {
    const totals = {};
    workloadData.forEach(item => {
      if (!totals[item.resource_name]) {
        totals[item.resource_name] = 0;
      }
      totals[item.resource_name] += item.total_hours;
    });
    return totals;
  };

  const getProjectTotals = () => {
    const totals = {};
    workloadData.forEach(item => {
      if (!totals[item.project_name]) {
        totals[item.project_name] = 0;
      }
      totals[item.project_name] += item.total_hours;
    });
    return totals;
  };

  if (loading && workloadData.length === 0) {
    return <div className="loading">Loading workload data...</div>;
  }
  
  if (error) return <div className="error">{error}</div>;

  const monthlyTotals = getMonthlyTotals();
  const resourceTotals = getResourceTotals();
  const projectTotals = getProjectTotals();
  const grandTotal = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);

  return (
    <div className="workload-view">
      <div className="header">
        <h2>💼 Workload Per Resource Per Month Per Project</h2>
        <div className="controls">
          <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={selectedResource} onChange={e => setSelectedResource(e.target.value)}>
            <option value="all">All Resources</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}>
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button onClick={handleExport} className="btn-export">
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="workload-table-container">
        <table className="workload-table">
          <thead>
            <tr>
              <th rowSpan="2">Resource</th>
              <th rowSpan="2">Project</th>
              <th colSpan="12">Months ({selectedYear})</th>
              <th rowSpan="2">Total</th>
            </tr>
            <tr>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <th key={m}>{getMonthName(m).substring(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workloadData.length === 0 ? (
              <tr>
                <td colSpan="15" className="no-data">No workload data for the selected filters</td>
              </tr>
            ) : (
              <>
                {workloadData.map((item, idx) => {
                  const prevItem = idx > 0 ? workloadData[idx - 1] : null;
                  const showResource = !prevItem || prevItem.resource_name !== item.resource_name;
                  const showProject = !prevItem || prevItem.resource_name !== item.resource_name || prevItem.project_name !== item.project_name;
                  
                  // Get all months for this resource-project combination
                  const resourceProjectData = workloadData.filter(
                    d => d.resource_name === item.resource_name && d.project_name === item.project_name
                  );
                  
                  const monthsData = {};
                  resourceProjectData.forEach(d => {
                    monthsData[d.month] = d.total_hours;
                  });
                  
                  const rowTotal = Object.values(monthsData).reduce((sum, val) => sum + val, 0);
                  
                  // Only show one row per resource-project combination
                  if (idx === 0 || 
                      workloadData[idx - 1].resource_name !== item.resource_name || 
                      workloadData[idx - 1].project_name !== item.project_name) {
                    return (
                      <tr key={`${item.resource_id}-${item.project_id}`}>
                        <td className="resource-cell">{item.resource_name}</td>
                        <td className="project-cell">{item.project_name}</td>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                          <td key={m} className="hours-cell">
                            {monthsData[m] ? monthsData[m].toFixed(1) : '-'}
                          </td>
                        ))}
                        <td className="total-cell">{rowTotal.toFixed(1)}</td>
                      </tr>
                    );
                  }
                  return null;
                })}
              </>
            )}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td colSpan="2"><strong>Monthly Totals</strong></td>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <td key={m} className="total-cell">
                  <strong>{monthlyTotals[m].toFixed(1)}</strong>
                </td>
              ))}
              <td className="grand-total-cell">
                <strong>{grandTotal.toFixed(1)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="workload-summary">
        <div className="summary-section">
          <h3>📊 Summary by Resource</h3>
          <div className="summary-grid">
            {Object.entries(resourceTotals).map(([resource, hours]) => (
              <div key={resource} className="summary-item">
                <div className="summary-label">{resource}</div>
                <div className="summary-value">{hours.toFixed(1)}h</div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h3>📁 Summary by Project</h3>
          <div className="summary-grid">
            {Object.entries(projectTotals).map(([project, hours]) => (
              <div key={project} className="summary-item">
                <div className="summary-label">{project}</div>
                <div className="summary-value">{hours.toFixed(1)}h</div>
              </div>
            ))}
          </div>
        </div>

        <div className="summary-section">
          <h3>📈 Grand Total</h3>
          <div className="grand-total-display">
            <div className="grand-total-value">{grandTotal.toFixed(1)} hours</div>
            <div className="grand-total-subtitle">Total workload for {selectedYear}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadView;
