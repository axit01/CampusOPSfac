import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  CheckSquare,
  Clock, 
  AlertTriangle, 
  Play, 
  XCircle, 
  Check,
  Calendar,
  MoreVertical,
  Filter
} from 'lucide-react';

const PhaseStep = ({ active, label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', zIndex: 1, position: 'relative' }}>
    <div style={{ 
      width: '20px', 
      height: '20px', 
      borderRadius: '50%', 
      background: active ? 'var(--accent)' : 'white', 
      border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      boxShadow: active ? '0 0 10px var(--accent-soft)' : 'none',
      transition: 'all 0.3s'
    }}></div>
    <span style={{ fontSize: '0.65rem', fontWeight: '700', color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{label}</span>
  </div>
);

import { API_BASE_URL } from '../config';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks`);
      // Filter tasks assigned to this faculty
      const myTasks = res.data.filter(t => {
        if (!t.assignedTo || !Array.isArray(t.assignedTo)) return false;
        
        const normalizedUserName = user.name?.toLowerCase().trim();
        const normalizedUserId = user.id?.toString();
        
        return t.assignedTo.some(assignee => {
          const lowerAssignee = assignee?.toLowerCase().trim();
          if (!lowerAssignee || !normalizedUserName) return false;
          
          // Direct match or ID match
          if (lowerAssignee === normalizedUserName || assignee === normalizedUserId) return true;
          
          // Word overlap check (handles middle names or shorter versions)
          const assigneeWords = lowerAssignee.split(' ').filter(w => w.length > 2);
          const userWords = normalizedUserName.split(' ').filter(w => w.length > 2);
          
          return assigneeWords.every(word => normalizedUserName.includes(word)) || 
                 userWords.every(word => lowerAssignee.includes(word));
        });
      });
      setTasks(myTasks);
    } catch (error) {
      console.error('Fetch Tasks Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, { status: newStatus });
      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Update Task Status Error:', error);
    }
  };

  const filteredTasks = filter === 'All' ? tasks : tasks.filter(t => t.status === filter);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed': return <span className="badge badge-success">Completed</span>;
      case 'Working': return <span className="badge badge-info">Working</span>;
      case 'Accepted': return <span className="badge badge-warning">Accepted</span>;
      default: return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Assigned</span>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#3b82f6';
    }
  };

  const getProgressLabel = (status) => {
    switch (status) {
      case 'Completed': return '100%';
      case 'Working': return '60%';
      case 'Accepted': return '20%';
      default: return '0%';
    }
  };

  if (loading) return (
    <div className="tasks-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: '250px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '350px' }}></div>
        </div>
        <div className="skeleton" style={{ width: '180px', height: '40px' }}></div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="premium-card skeleton" style={{ height: '400px' }}></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="tasks-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-hero">Task Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your institutional workflow.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <Filter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select 
              className="input" 
              style={{ width: '180px', paddingLeft: '36px', height: '40px', fontSize: '0.875rem' }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Tasks</option>
              <option value="Assigned">Assigned</option>
              <option value="Accepted">Accepted</option>
              <option value="Working">Working</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <motion.div 
              key={task.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card"
              style={{ display: 'flex', flexDirection: 'column', minHeight: '400px', background: 'white', borderTop: `4px solid ${getPriorityColor(task.priority)}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>{task.priority?.toUpperCase()} PRIORITY</span>
                {getStatusBadge(task.status)}
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>{task.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px', flex: 1, lineHeight: '1.6' }}>
                {task.description || 'No detailed description provided by administration.'}
              </p>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>Current Phase</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>
                  <PhaseStep active={true} label="Assign" />
                  <PhaseStep active={['Accepted', 'Working', 'Completed'].includes(task.status)} label="Accept" />
                  <PhaseStep active={['Working', 'Completed'].includes(task.status)} label="Work" />
                  <PhaseStep active={task.status === 'Completed'} label="Done" />
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px', marginBottom: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  <span>Started {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>{task.deadline?.includes('-') ? `Due ${new Date(task.deadline).toLocaleDateString()}` : `Due: ${task.deadline || 'No deadline'}`}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                {!task.status || task.status === 'Assigned' ? (
                  <>
                    <button 
                      onClick={() => updateTaskStatus(task.id, 'Accepted')}
                      className="btn btn-primary" 
                      style={{ flex: 1, height: '42px', fontSize: '0.85rem', background: 'var(--success)', border: 'none' }}
                    >
                      <CheckCircle size={18} /> Accept Task
                    </button>
                    <button 
                      onClick={() => updateTaskStatus(task.id, 'Rejected')}
                      className="btn btn-outline" 
                      style={{ flex: 1, height: '42px', fontSize: '0.85rem', color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </>
                ) : task.status === 'Accepted' ? (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'Working')}
                    className="btn btn-accent" 
                    style={{ width: '100%', height: '42px', fontSize: '0.85rem' }}
                  >
                    <Play size={18} /> Start Working
                  </button>
                ) : task.status === 'Working' ? (
                  <button 
                    onClick={() => updateTaskStatus(task.id, 'Completed')}
                    className="btn btn-primary" 
                    style={{ width: '100%', height: '42px', fontSize: '0.85rem', background: 'var(--success)' }}
                  >
                    <CheckCircle size={18} /> Mark Completed
                  </button>
                ) : (
                  <button 
                    className="btn btn-outline" 
                    disabled 
                    style={{ width: '100%', height: '42px', fontSize: '0.85rem', opacity: 0.7, background: 'var(--bg-main)' }}
                  >
                    <CheckCircle size={18} /> Task Finalized
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckSquare size={40} color="var(--text-muted)" />
          </div>
          <h2 style={{ color: 'var(--text-primary)' }}>All caught up!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>You have no institutional tasks assigned at the moment.</p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
