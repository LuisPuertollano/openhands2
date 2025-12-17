const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    message: 'RAMS Workload Management System API',
    version: '1.0.0',
    endpoints: {
      resources: '/api/resources',
      projects: '/api/projects',
      workPackages: '/api/work-packages',
      activities: '/api/activities',
      changeLogs: '/api/change-logs',
      reports: '/api/reports',
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`RAMS Workload Management API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
