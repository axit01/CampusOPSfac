import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Collaboration from './pages/Collaboration';
import CalendarPage from './pages/Calendar';
import Timetable from './pages/Timetable';
import Events from './pages/Events';
import Profile from './pages/Profile';
import Notepad from './pages/Notepad';

import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/tasks" element={
            <ProtectedRoute>
              <Layout>
                <Tasks />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/collaboration" element={
            <ProtectedRoute>
              <Layout>
                <Collaboration />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/calendar" element={
            <ProtectedRoute>
              <Layout>
                <CalendarPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/timetable" element={
            <ProtectedRoute>
              <Layout>
                <Timetable />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/events" element={
            <ProtectedRoute>
              <Layout>
                <Events />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/notepad" element={
            <ProtectedRoute>
              <Layout>
                <Notepad />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


