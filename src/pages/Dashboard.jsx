import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    assignedTasks: 0,
    pendingTasks: 0,
    upcomingMeetings: 0,
    activeEvents: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [tasksRes, eventsRes, notifRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks`),
        axios.get(`${API_BASE_URL}/events`),
        axios.get(`${API_BASE_URL}/notifications`)
      ]);

      const normalizedUserName = user.name?.toLowerCase().trim();
      const normalizedUserId = user.id?.toString();

      const myTasks = tasksRes.data.filter(t => {
        if (!t.assignedTo || !Array.isArray(t.assignedTo)) return false;
        return t.assignedTo.some(assignee => {
          const lowerAssignee = assignee?.toLowerCase().trim();
          if (!lowerAssignee || !normalizedUserName) return false;
          if (lowerAssignee === normalizedUserName || assignee === normalizedUserId) return true;
          
          const assigneeWords = lowerAssignee.split(' ').filter(w => w.length > 2);
          const userWords = normalizedUserName.split(' ').filter(w => w.length > 2);
          
          return assigneeWords.every(word => normalizedUserName.includes(word)) || 
                 userWords.every(word => lowerAssignee.includes(word));
        });
      });
      
      const myEvents = eventsRes.data.filter(e => {
        const itemFaculty = e.faculty?.toLowerCase() || '';
        const isSystem = itemFaculty.includes('system');
        
        let isAssigned = false;
        if (normalizedUserName && itemFaculty) {
          const assigneeWords = itemFaculty.split(' ').filter(w => w.length > 2);
          const userWords = normalizedUserName.split(' ').filter(w => w.length > 2);
          isAssigned = assigneeWords.some(word => normalizedUserName.includes(word)) || 
                       userWords.some(word => itemFaculty.includes(word));
        }
        return (isSystem || isAssigned) && e.type !== 'Task';
      });

      setStats({
        assignedTasks: myTasks.length,
        pendingTasks: myTasks.filter(t => t.status !== 'Completed').length,
        upcomingMeetings: myEvents.filter(e => e.type === 'Meeting').length,
        activeEvents: myEvents.length
      });

      const myNotifications = notifRes.data.filter(n => n.target === user.name);
      setNotifications(myNotifications.slice(0, 5).map(n => ({
        ...n,
        time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : n.time
      })));
    } catch (error) {
      console.error('Dashboard Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (socket) {
      socket.on('data-update', fetchDashboardData);
      socket.on('new-message', fetchDashboardData);
      return () => {
        socket.off('data-update');
        socket.off('new-message');
      };
    }
  }, [user, socket]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="dashboard-page overflow-hidden">
      <header style={{ marginBottom: '32px' }}>
        <div className="skeleton skeleton-title" style={{ width: '300px' }}></div>
        <div className="skeleton skeleton-text" style={{ width: '450px' }}></div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="premium-card skeleton" style={{ height: '120px' }}></div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        <div>
          <div className="skeleton skeleton-title"></div>
          <div className="premium-card" style={{ height: '300px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display: 'flex', gap: '16px', padding: '16px 24px' }}>
                <div className="skeleton skeleton-circle"></div>
                <div style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="skeleton skeleton-title"></div>
          {[1,2,3].map(i => (
            <div key={i} className="skeleton" style={{ height: '56px', marginBottom: '12px', borderRadius: 'var(--radius-sm)' }}></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="heading-hero">Welcome back, {user?.name?.split(' ')?.[0]}!</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Here's a summary of your assigned institutional responsibilities.
        </p>
      </header>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '24px',
          marginBottom: '40px'
        }}
      >
        <StatCard 
          icon={<CheckCircle color="var(--success)" />} 
          label="Assigned Tasks" 
          value={stats.assignedTasks} 
          trend="+2 New"
        />
        <StatCard 
          icon={<Clock color="var(--warning)" />} 
          label="Pending Tasks" 
          value={stats.pendingTasks} 
        />
        <StatCard 
          icon={<Users color="var(--accent)" />} 
          label="Upcoming Meetings" 
          value={stats.upcomingMeetings} 
        />
        <StatCard 
          icon={<Calendar color="var(--secondary)" />} 
          label="Active Events" 
          value={stats.activeEvents} 
        />
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="heading-section" style={{ marginBottom: 0 }}>Recent Notifications</h2>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View All</button>
          </div>
          <div className="premium-card" style={{ padding: 0 }}>
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <div key={n.id} style={{ 
                  padding: '16px 24px', 
                  borderBottom: i === notifications.length - 1 ? 'none' : '1px solid var(--border)',
                  display: 'flex',
                  gap: '16px'
                }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'var(--accent-soft)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <AlertCircle size={20} color="var(--accent)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <p style={{ fontWeight: '600' }}>{n.title}</p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{n.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent notifications</p>
            )}
          </div>
        </section>

        <aside>
          <h2 className="heading-section">Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <ActionBtn icon={<CheckCircle size={18} />} label="Manage Tasks" color="var(--accent)" onClick={() => navigate('/events')} />
            <ActionBtn icon={<Users size={18} />} label="Join Meeting" color="var(--success)" onClick={() => navigate('/events')} />
            <ActionBtn icon={<Calendar size={18} />} label="View Calendar" color="var(--secondary)" onClick={() => navigate('/calendar')} />
          </div>

          <div className="premium-card" style={{ marginTop: '32px', background: 'var(--primary)', color: 'white' }}>
            <h4 style={{ marginBottom: '8px' }}>Institutional Support</h4>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '20px' }}>
              Need help with the platform? Contact the helpdesk.
            </p>
            <button className="btn btn-accent" style={{ width: '100%', fontSize: '0.8rem' }}>Open Support Ticket</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }) => (
  <motion.div variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }} className="premium-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
      <div style={{ padding: '8px', background: 'var(--bg-main)', borderRadius: '10px' }}>{icon}</div>
      {trend && <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600' }}>{trend}</span>}
    </div>
    <h3 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>{value}</h3>
    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{label}</p>
  </motion.div>
);

const ActionBtn = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="btn btn-outline" style={{ 
    width: '100%', 
    justifyContent: 'space-between', 
    padding: '16px 20px',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ color }}>{icon}</span>
      <span>{label}</span>
    </div>
    <ArrowRight size={16} />
  </button>
);

export default Dashboard;
