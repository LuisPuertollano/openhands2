const express = require('express');
const resourceRoutes = require('./resource_routes');
const projectRoutes = require('./project_routes');
const workPackageRoutes = require('./work_package_routes');
const activityRoutes = require('./activity_routes');
const changeLogRoutes = require('./change_log_routes');
const reportRoutes = require('./report_routes');

const router = express.Router();

router.use('/resources', resourceRoutes);
router.use('/projects', projectRoutes);
router.use('/work-packages', workPackageRoutes);
router.use('/activities', activityRoutes);
router.use('/change-logs', changeLogRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'RAMS Workload Management API is running' });
});

module.exports = router;
