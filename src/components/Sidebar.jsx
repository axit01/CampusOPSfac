import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  CheckSquare, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  LogOut,
  Bell,
  Navigation,
  StickyNote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: MessageSquare, label: 'Collaboration', path: '/collaboration' },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: Clock, label: 'Timetable', path: '/timetable' },
    { icon: StickyNote, label: 'Notepad', path: '/notepad' },
    { icon: Users, label: 'Schedule & Tasks', path: '/events' },
  ];

  return (
    <aside className="sidebar-container" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: 'var(--primary)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '24px 16px'
    }}>
      <div className="logo-section" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        padding: '0 12px 32px' 
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          background: 'var(--accent)', 
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Navigation size={24} color="white" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '0.05em' }}>AAVISHKAR</h2>
      </div>

      <nav style={{ flex: 1 }}>
        <ul style={{ listStyle: 'none' }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ marginBottom: '4px' }}>
              <NavLink 
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s'
                })}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="user-section" style={{
        marginTop: 'auto',
        padding: '20px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '1rem'
          }}>
            {user?.name?.[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink 
            to="/profile"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: '10px',
              color: isActive ? 'white' : 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: '0.9rem'
            })}
          >
            <Settings size={18} />
            <span>Profile Settings</span>
          </NavLink>
          
          <button 
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              borderRadius: '10px',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.9rem',
              width: '100%',
              textAlign: 'left'
            }}
          >
            <LogOut size={18} />
            <span>Logout Session</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

