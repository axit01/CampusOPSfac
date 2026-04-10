import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--bg-main)'
      }}>
        <div className="animate-spin" style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid var(--border)', 
          borderTopColor: 'var(--accent)', 
          borderRadius: '50%' 
        }}></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
