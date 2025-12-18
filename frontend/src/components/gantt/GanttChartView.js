import React, { useState, useEffect } from 'react';
import { projectsAPI, workPackagesAPI, activitiesAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import '../../styles/GanttChart.css';

const GanttChartView = () => {
  const [projects, setProjects] = useState([]);
  const [ganttData, setGanttData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timelineStart, setTimelineStart] = useState(null);
  const [timelineEnd, setTimelineEnd] = useState(null);
  const [selectedView, setSelectedView] = useState('projects'); // projects, workpackages, activities

  useEffect(() => {
    loadGanttData();
  }, [selectedView]);

  const loadGanttData = async () => {
    try {
      setLoading(true);
      const projectsRes = await projectsAPI.getAll();
      const projectsData = projectsRes.data.data;
      setProjects(projectsData);

      // Calculate timeline bounds
      if (projectsData.length > 0) {
        const allDates = projectsData.flatMap(p => [new Date(p.start_date), new Date(p.end_date)]);
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        setTimelineStart(minDate);
        setTimelineEnd(maxDate);
      }

      // Load detailed data based on view
      if (selectedView === 'workpackages' || selectedView === 'activities') {
        const wpPromises = projectsData.map(p => workPackagesAPI.getByProject(p.id));
        const wpResults = await Promise.all(wpPromises);
        
        const allWorkPackages = wpResults.flatMap((res, idx) => 
          res.data.data.map(wp => ({ ...wp, project_name: projectsData[idx].name }))
        );

        if (selectedView === 'activities') {
          const actPromises = allWorkPackages.map(wp => activitiesAPI.getByWorkPackage(wp.id));
          const actResults = await Promise.all(actPromises);
          
          const allActivities = actResults.flatMap((res, idx) =>
            res.data.data.map(act => ({
              ...act,
              work_package_name: allWorkPackages[idx].name,
              project_name: allWorkPackages[idx].project_name
            }))
          );
          setGanttData(allActivities);
        } else {
          setGanttData(allWorkPackages);
        }
      } else {
        setGanttData(projectsData);
      }

      setError(null);
    } catch (err) {
      setError('Failed to load Gantt chart data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateBarPosition = (startDate, endDate) => {
    if (!timelineStart || !timelineEnd) return { left: 0, width: 0 };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDuration = timelineEnd - timelineStart;
    const itemStart = start - timelineStart;
    const itemDuration = end - start;

    const left = (itemStart / totalDuration) * 100;
    const width = (itemDuration / totalDuration) * 100;

    return { left: Math.max(0, left), width: Math.max(1, width) };
  };

  const getMonthsInRange = () => {
    if (!timelineStart || !timelineEnd) return [];
    
    const months = [];
    const current = new Date(timelineStart);
    current.setDate(1);
    
    while (current <= timelineEnd) {
      months.push({
        label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        date: new Date(current)
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  if (loading) return <div className="loading">Loading Gantt chart...</div>;
  if (error) return <div className="error">{error}</div>;
  if (ganttData.length === 0) return <div className="no-data">No data available for Gantt chart</div>;

  const months = getMonthsInRange();

  return (
    <div className="gantt-chart-view">
      <div className="header">
        <h2>📅 Gantt Chart - Project Timeline</h2>
        <div className="controls">
          <select value={selectedView} onChange={e => setSelectedView(e.target.value)}>
            <option value="projects">Projects View</option>
            <option value="workpackages">Work Packages View</option>
            <option value="activities">Activities View</option>
          </select>
        </div>
      </div>

      <div className="gantt-container">
        <div className="gantt-sidebar">
          <div className="gantt-sidebar-header">
            {selectedView === 'projects' && 'Project'}
            {selectedView === 'workpackages' && 'Work Package'}
            {selectedView === 'activities' && 'Activity'}
          </div>
          {ganttData.map((item, idx) => (
            <div key={idx} className="gantt-sidebar-row">
              <div className="item-name">
                {selectedView === 'projects' && item.name}
                {selectedView === 'workpackages' && (
                  <>
                    <div className="item-title">{item.name}</div>
                    <div className="item-subtitle">{item.project_name}</div>
                  </>
                )}
                {selectedView === 'activities' && (
                  <>
                    <div className="item-title">{item.resource_name}</div>
                    <div className="item-subtitle">{item.work_package_name} | {item.project_name}</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="gantt-timeline">
          <div className="gantt-timeline-header">
            {months.map((month, idx) => (
              <div
                key={idx}
                className="month-label"
                style={{ flex: 1 }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div className="gantt-timeline-body">
            {ganttData.map((item, idx) => {
              const position = calculateBarPosition(item.start_date, item.end_date);
              return (
                <div key={idx} className="gantt-timeline-row">
                  <div className="gantt-grid">
                    {months.map((_, midx) => (
                      <div key={midx} className="month-cell" style={{ flex: 1 }} />
                    ))}
                  </div>
                  <div
                    className={`gantt-bar ${selectedView}`}
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`
                    }}
                    title={`${formatDate(item.start_date)} - ${formatDate(item.end_date)}`}
                  >
                    <span className="gantt-bar-label">
                      {selectedView === 'activities' && `${item.planned_hours}h`}
                      {selectedView === 'workpackages' && item.rams_tag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="gantt-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          {selectedView === 'projects' && (
            <div className="legend-item">
              <div className="legend-color projects"></div>
              <span>Project Timeline</span>
            </div>
          )}
          {selectedView === 'workpackages' && (
            <div className="legend-item">
              <div className="legend-color workpackages"></div>
              <span>Work Package Timeline</span>
            </div>
          )}
          {selectedView === 'activities' && (
            <div className="legend-item">
              <div className="legend-color activities"></div>
              <span>Activity Assignment</span>
            </div>
          )}
        </div>
      </div>

      <div className="gantt-summary">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat-card">
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{projects.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Timeline Range</div>
            <div className="stat-value">
              {timelineStart && timelineEnd && (
                `${formatDate(timelineStart)} - ${formatDate(timelineEnd)}`
              )}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{ganttData.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttChartView;
