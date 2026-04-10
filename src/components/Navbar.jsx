import React, { useState, useEffect } from 'react';
import { Search, Bell, Menu, X, Command, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import { API_BASE_URL } from '../config';

const Navbar = () => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get(`${API_BASE_URL}/notifications`);
          const myNotifs = res.data.filter(n => n.target === user.name);
          setNotifications(myNotifs);
        } catch (err) {
          console.error('Navbar Notif Fetch Error:', err);
        }
      };
      fetchNotifications();
      // Polling for updates every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <header className="navbar-container" style={{
      height: 'var(--navbar-height)',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      <div className="search-bar" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '400px'
      }}>
        <Search size={18} style={{ 
          position: 'absolute', 
          left: '12px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }} />
        <input 
          type="text" 
          placeholder="Search for tasks, meetings..." 
          className="input"
          style={{ 
            paddingLeft: '40px', 
            height: '40px', 
            fontSize: '0.875rem',
            background: '#f8fafc',
            border: 'none'
          }}
        />
        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          padding: '2px 6px',
          background: 'white',
          border: '1px solid var(--border)',
          borderRadius: '4px',
          fontSize: '0.7rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          <Command size={10} />
          K
        </div>
      </div>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ textAlign: 'right', display: 'none' /* Hidden on small screens */, md: 'block' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user?.name}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.dept} Department</p>
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8fafc',
              color: 'var(--text-secondary)',
              position: 'relative'
            }}
          >
            <Bell size={20} />
            {notifications.some(n => !n.read) && (
              <span style={{ 
                position: 'absolute', 
                top: '8px', 
                right: '8px', 
                width: '8px', 
                height: '8px', 
                background: '#ef4444', 
                borderRadius: '50%',
                border: '2px solid white'
              }}></span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="premium-card"
                style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '320px',
                  zIndex: 200,
                  padding: '16px',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                  <h4 style={{ fontSize: '1rem' }}>Notifications</h4>
                  <button style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: '600' }}>Mark all read</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0' }}>
                         <AlertCircle size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                         <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>{n.title}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '20px 0' }}>
                      No new notifications
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;


