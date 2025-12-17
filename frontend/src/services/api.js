import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const resourcesAPI = {
  getAll: () => api.get('/resources'),
  getById: (id) => api.get(`/resources/${id}`),
  create: (data) => api.post('/resources', data),
  update: (id, data) => api.put(`/resources/${id}`, data),
  delete: (id) => api.delete(`/resources/${id}`),
  getCapacity: (id, year, month) => api.get(`/resources/${id}/capacity?year=${year}&month=${month}`),
  getAllCapacity: (year, month) => api.get(`/resources/capacity?year=${year}&month=${month}`),
};

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id, includeWorkPackages = false) => 
    api.get(`/projects/${id}?include_work_packages=${includeWorkPackages}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const workPackagesAPI = {
  getAll: () => api.get('/work-packages'),
  getById: (id, includeActivities = false) => 
    api.get(`/work-packages/${id}?include_activities=${includeActivities}`),
  getByProject: (projectId) => api.get(`/work-packages/project/${projectId}`),
  create: (data) => api.post('/work-packages', data),
  update: (id, data) => api.put(`/work-packages/${id}`, data),
  delete: (id) => api.delete(`/work-packages/${id}`),
  getBudgetStatus: (id) => api.get(`/work-packages/${id}/budget-status`),
  getAllBudgetStatus: () => api.get('/work-packages/budget-status'),
};

export const activitiesAPI = {
  getAll: () => api.get('/activities'),
  getById: (id) => api.get(`/activities/${id}`),
  getByResource: (resourceId) => api.get(`/activities/resource/${resourceId}`),
  getByWorkPackage: (workPackageId) => api.get(`/activities/work-package/${workPackageId}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
};

export const changeLogsAPI = {
  getAll: (limit) => api.get(`/change-logs?limit=${limit || 100}`),
  getByEntity: (entityType, entityId) => api.get(`/change-logs/${entityType}/${entityId}`),
  getByDateRange: (startDate, endDate) => 
    api.get(`/change-logs/date-range?start_date=${startDate}&end_date=${endDate}`),
};

export const reportsAPI = {
  exportCapacityExcel: (year, month) => 
    api.get(`/reports/capacity/excel?year=${year}&month=${month}`, { responseType: 'blob' }),
  exportCapacityPDF: (year, month) => 
    api.get(`/reports/capacity/pdf?year=${year}&month=${month}`, { responseType: 'blob' }),
  exportBudgetExcel: () => 
    api.get('/reports/budget/excel', { responseType: 'blob' }),
  exportBudgetPDF: () => 
    api.get('/reports/budget/pdf', { responseType: 'blob' }),
  exportRAMSDistribution: () => 
    api.get('/reports/rams-distribution/excel', { responseType: 'blob' }),
};

export default api;
