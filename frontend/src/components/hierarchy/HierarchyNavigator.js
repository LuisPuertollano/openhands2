import React, { useState, useEffect } from 'react';
import { projectsAPI, workPackagesAPI, activitiesAPI } from '../../services/api';
import { formatHours, formatDate } from '../../utils/helpers';

const HierarchyNavigator = () => {
  const [projects, setProjects] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedWorkPackages, setExpandedWorkPackages] = useState(new Set());
  const [workPackages, setWorkPackages] = useState({});
  const [activities, setActivities] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAll();
      setProjects(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to load projects');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleProject = async (projectId) => {
    const newExpanded = new Set(expandedProjects);
    
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      
      if (!workPackages[projectId]) {
        try {
          const response = await workPackagesAPI.getByProject(projectId);
          setWorkPackages(prev => ({ ...prev, [projectId]: response.data.data }));
        } catch (err) {
          console.error('Failed to load work packages:', err);
        }
      }
    }
    
    setExpandedProjects(newExpanded);
  };

  const toggleWorkPackage = async (wpId) => {
    const newExpanded = new Set(expandedWorkPackages);
    
    if (newExpanded.has(wpId)) {
      newExpanded.delete(wpId);
    } else {
      newExpanded.add(wpId);
      
      if (!activities[wpId]) {
        try {
          const response = await activitiesAPI.getByWorkPackage(wpId);
          setActivities(prev => ({ ...prev, [wpId]: response.data.data }));
        } catch (err) {
          console.error('Failed to load activities:', err);
        }
      }
    }
    
    setExpandedWorkPackages(newExpanded);
  };

  if (loading) return <div className="loading">Loading hierarchy...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="hierarchy-navigator">
      <div className="header">
        <h2>Project Hierarchy Navigator</h2>
        <div className="controls">
          <button onClick={() => setExpandedProjects(new Set())}>Collapse All</button>
          <button onClick={() => {
            const allIds = new Set(projects.map(p => p.id));
            setExpandedProjects(allIds);
            allIds.forEach(id => {
              if (!workPackages[id]) {
                workPackagesAPI.getByProject(id).then(response => {
                  setWorkPackages(prev => ({ ...prev, [id]: response.data.data }));
                });
              }
            });
          }}>Expand All Projects</button>
        </div>
      </div>

      <div className="hierarchy-tree">
        {projects.map(project => (
          <div key={project.id} className="project-node">
            <div className="node-header project" onClick={() => toggleProject(project.id)}>
              <span className="toggle-icon">
                {expandedProjects.has(project.id) ? '▼' : '▶'}
              </span>
              <span className="node-icon">📁</span>
              <span className="node-name">{project.name}</span>
              <span className="node-dates">
                {formatDate(project.start_date)} - {formatDate(project.end_date)}
              </span>
            </div>

            {expandedProjects.has(project.id) && workPackages[project.id] && (
              <div className="children work-packages">
                {workPackages[project.id].map(wp => (
                  <div key={wp.id} className="work-package-node">
                    <div className="node-header work-package" onClick={() => toggleWorkPackage(wp.id)}>
                      <span className="toggle-icon">
                        {expandedWorkPackages.has(wp.id) ? '▼' : '▶'}
                      </span>
                      <span className="node-icon">📦</span>
                      <span className="node-name">{wp.name}</span>
                      <span className="rams-tag">{wp.rams_tag}</span>
                      <span className="standard-effort">
                        Standard: {formatHours(wp.standard_effort_hours)}h
                      </span>
                    </div>

                    {expandedWorkPackages.has(wp.id) && activities[wp.id] && (
                      <div className="children activities">
                        {activities[wp.id].length === 0 ? (
                          <div className="no-activities">No activities assigned</div>
                        ) : (
                          activities[wp.id].map(activity => (
                            <div key={activity.id} className="activity-node">
                              <div className="node-header activity">
                                <span className="node-icon">📝</span>
                                <span className="resource-name">{activity.resource_name}</span>
                                <span className="planned-hours">
                                  {formatHours(activity.planned_hours)}h
                                </span>
                                <span className="activity-dates">
                                  {formatDate(activity.start_date)} - {formatDate(activity.end_date)}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <span className="node-icon">📁</span> Project
          </div>
          <div className="legend-item">
            <span className="node-icon">📦</span> Work Package
          </div>
          <div className="legend-item">
            <span className="node-icon">📝</span> Activity
          </div>
        </div>
      </div>
    </div>
  );
};

export default HierarchyNavigator;
