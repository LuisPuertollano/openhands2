import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import CapacityOverview from './components/dashboard/CapacityOverview';
import BenchmarkingView from './components/benchmarking/BenchmarkingView';
import HierarchyNavigator from './components/hierarchy/HierarchyNavigator';
import GanttChartView from './components/gantt/GanttChartView';
import WorkloadView from './components/workload/WorkloadView';
import './styles/App.css';

function App() {
  const [activeTab, setActiveTab] = useState('capacity');

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="logo">
            <h1>⚙️ RAMS Workload Management</h1>
            <p>Railway Safety Engineering Resource Planner</p>
          </div>
        </header>

        <nav className="app-navigation">
          <Link 
            to="/capacity" 
            className={activeTab === 'capacity' ? 'active' : ''}
            onClick={() => setActiveTab('capacity')}
          >
            📊 Capacity Overview
          </Link>
          <Link 
            to="/benchmarking" 
            className={activeTab === 'benchmarking' ? 'active' : ''}
            onClick={() => setActiveTab('benchmarking')}
          >
            📈 Budget Benchmarking
          </Link>
          <Link 
            to="/hierarchy" 
            className={activeTab === 'hierarchy' ? 'active' : ''}
            onClick={() => setActiveTab('hierarchy')}
          >
            🌳 Project Hierarchy
          </Link>
          <Link 
            to="/gantt" 
            className={activeTab === 'gantt' ? 'active' : ''}
            onClick={() => setActiveTab('gantt')}
          >
            📅 Gantt Chart
          </Link>
          <Link 
            to="/workload" 
            className={activeTab === 'workload' ? 'active' : ''}
            onClick={() => setActiveTab('workload')}
          >
            💼 Workload Report
          </Link>
        </nav>

        <main className="app-content">
          <Routes>
            <Route path="/" element={<Navigate to="/capacity" replace />} />
            <Route path="/capacity" element={<CapacityOverview />} />
            <Route path="/benchmarking" element={<BenchmarkingView />} />
            <Route path="/hierarchy" element={<HierarchyNavigator />} />
            <Route path="/gantt" element={<GanttChartView />} />
            <Route path="/workload" element={<WorkloadView />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>RAMS Workload Management System v1.0.0 | Built for Safety-Critical Engineering Teams</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
