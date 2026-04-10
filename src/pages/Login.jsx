import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(loginId, password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '20px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass"
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '40px', 
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'var(--accent)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', marginBottom: '8px' }}>Faculty Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Secure access to AAVISHKAR CampusOps</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '12px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
              color: '#f87171',
              fontSize: '0.875rem'
            }}
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label" style={{ color: 'var(--text-muted)' }}>Faculty Code or Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input 
                type="text" 
                className="input" 
                placeholder="e.g. FAC-1001"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                required
                style={{ 
                  paddingLeft: '40px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <div className="input-group">
            <label className="label" style={{ color: 'var(--text-muted)' }}>Security Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input 
                type="password" 
                className="input" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  paddingLeft: '40px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <a href="#" style={{ color: 'var(--accent)', fontSize: '0.875rem', fontWeight: '500' }}>Forgot password?</a>
          </div>

          <button 
            type="submit" 
            className="btn btn-accent" 
            disabled={loading}
            style={{ width: '100%', height: '48px', borderRadius: '12px' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '32px', 
          color: 'var(--text-muted)', 
          fontSize: '0.875rem' 
        }}>
          Assigned by institutional administration.
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
