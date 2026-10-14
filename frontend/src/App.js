import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MagicLogin from './pages/MagicLogin';
import ErrorBoundary from './components/ErrorBoundary';
import Admin from './pages/sections/Admin';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  const userEmail = localStorage.getItem('userEmail') || '';
  if (userEmail.toLowerCase() !== 'syedimad348@gmail.com') {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/magic-login" element={<PublicOnlyRoute><MagicLogin /></PublicOnlyRoute>} />
          <Route path="/dashboard/*" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin/*" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
