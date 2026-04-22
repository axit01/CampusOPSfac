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

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return '#ef4444';
    case 'Medium': return '#f59e0b';
    case 'Low': return '#10b981';
    default: return '#3b82f6';
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed': return <span className="badge badge-success">Completed</span>;
    case 'Working': return <span className="badge badge-info">Working</span>;
    case 'Accepted': return <span className="badge badge-warning">Accepted</span>;
    default: return <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>Assigned</span>;
  }
};

const TaskCard = ({ task, updateTaskStatus }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="premium-card"
    style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'white', 
      borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
      padding: '16px',
      gap: '12px',
      cursor: 'default'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)' }}>{task.priority?.toUpperCase()}</span>
      {getStatusBadge(task.status)}
    </div>

    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>{task.title}</h3>
    
    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
      {task.description || 'No description provided.'}
    </p>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Clock size={12} />
        <span>{new Date(task.createdAt).toLocaleDateString()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Calendar size={12} />
        <span>{task.deadline?.includes('-') ? new Date(task.deadline).toLocaleDateString() : (task.deadline || 'No deadline')}</span>
      </div>
    </div>

    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
      {!task.status || task.status === 'Assigned' ? (
        <>
          <button 
            onClick={() => updateTaskStatus(task.id, 'Accepted')}
            className="btn btn-primary" 
            style={{ flex: 1, height: '32px', padding: '0 8px', fontSize: '0.75rem', background: 'var(--success)', border: 'none' }}
          >
            Accept
          </button>
          <button 
            onClick={() => updateTaskStatus(task.id, 'Rejected')}
            className="btn btn-outline" 
            style={{ flex: 1, height: '32px', padding: '0 8px', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
          >
            Reject
          </button>
        </>
      ) : task.status === 'Accepted' ? (
        <button 
          onClick={() => updateTaskStatus(task.id, 'Working')}
          className="btn btn-accent" 
          style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '0.75rem' }}
        >
          <Play size={14} /> Start Working
        </button>
      ) : task.status === 'Working' ? (
        <button 
          onClick={() => updateTaskStatus(task.id, 'Completed')}
          className="btn btn-primary" 
          style={{ width: '100%', height: '32px', padding: '0 8px', fontSize: '0.75rem', background: 'var(--success)' }}
        >
          <CheckCircle size={14} /> Complete
        </button>
      ) : (
        <div style={{ width: '100%', textAlign: 'center', fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', padding: '6px', background: 'var(--success-soft)', borderRadius: 'var(--radius-sm)' }}>
          <CheckCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Completed
        </div>
      )}
    </div>
  </motion.div>
);


const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/tasks`);
      
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Normalize user identification
      const myName = (user.name || '').toLowerCase().trim();
      const myId = (user.id || user._id || '').toString().toLowerCase();
      const nameWords = myName.split(' ').filter(w => w.length > 1);

      console.log('Task Pull Engine - Identity:', { name: myName, id: myId });

      // 2. High-performance filtering
      let myTasks = res.data.filter(t => {
        const assignees = Array.isArray(t.assignedTo) ? t.assignedTo : 
                         (t.assignedTo ? [t.assignedTo.toString()] : []);
        
        // Match by any identifier
        return assignees.some(assignee => {
          const val = assignee.toString().toLowerCase().trim();
          if (myId && val === myId) return true;
          if (myName && (val === myName || val.includes(myName) || myName.includes(val))) return true;
          
          // Word-level match
          const valWords = val.split(' ').filter(w => w.length > 1);
          return nameWords.some(w => valWords.includes(w)) || valWords.some(w => nameWords.includes(w));
        });
      });

      // 3. Safety Net: If still nothing, check if any task was sent via Message metadata
      // (This handles cases where tasks are in the DB but the assignment field is named differently)
      if (myTasks.length === 0) {
        try {
          const msgRes = await axios.get(`${API_BASE_URL}/messages?targetId=${user.id || user._id}`);
          const tasksFromMsgs = msgRes.data
            .filter(m => m.type === 'task-card' && m.metadata?.taskId)
            .map(m => ({
              id: m.metadata.taskId,
              _id: m.metadata.taskId,
              title: m.metadata.title,
              description: m.metadata.description,
              priority: m.metadata.priority,
              deadline: m.metadata.deadline,
              status: m.metadata.status || 'Assigned',
              createdAt: m.timestamp
            }));
          
          // Merge with any tasks that might have been partially matched
          const existingIds = new Set(myTasks.map(t => (t.id || t._id).toString()));
          tasksFromMsgs.forEach(t => {
            if (!existingIds.has(t.id.toString())) {
              myTasks.push(t);
            }
          });
        } catch (msgErr) {
          console.warn('Fallback message-task sync failed', msgErr);
        }
      }

      // 4. Final ID normalization for the UI components
      const normalizedTasks = myTasks.map(t => ({
        ...t,
        id: t.id || t._id // Ensure 'id' exists for the TaskCard components
      }));

      console.log('Task Pull Engine - Final Count:', normalizedTasks.length);
      setTasks(normalizedTasks);
    } catch (error) {
      console.error('Task Pull Engine - Error:', error);
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
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage your institutional workflow in real-time.</p>
        </div>

      </header>

      <div className="tasks-board">
        {/* Assigned Column */}
        <div className="tasks-column">
          <div className="column-header">
            <div className="column-title">
              <Clock size={18} color="var(--warning)" />
              <span>Assigned</span>
            </div>
            <span className="column-count">{tasks.filter(t => !t.status || t.status === 'Assigned' || t.status === 'Accepted').length}</span>
          </div>
          <div className="tasks-list">
            <AnimatePresence>
              {tasks.filter(t => !t.status || t.status === 'Assigned' || t.status === 'Accepted').map((task) => (
                <TaskCard key={task.id} task={task} updateTaskStatus={updateTaskStatus} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Working Column */}
        <div className="tasks-column">
          <div className="column-header">
            <div className="column-title">
              <Play size={18} color="var(--accent)" />
              <span>Working</span>
            </div>
            <span className="column-count">{tasks.filter(t => t.status === 'Working').length}</span>
          </div>
          <div className="tasks-list">
            <AnimatePresence>
              {tasks.filter(t => t.status === 'Working').map((task) => (
                <TaskCard key={task.id} task={task} updateTaskStatus={updateTaskStatus} />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Completed Column */}
        <div className="tasks-column">
          <div className="column-header">
            <div className="column-title">
              <CheckCircle size={18} color="var(--success)" />
              <span>Completed</span>
            </div>
            <span className="column-count">{tasks.filter(t => t.status === 'Completed').length}</span>
          </div>
          <div className="tasks-list">
            <AnimatePresence>
              {tasks.filter(t => t.status === 'Completed').map((task) => (
                <TaskCard key={task.id} task={task} updateTaskStatus={updateTaskStatus} />
              ))}
            </AnimatePresence>
          </div>
        </div>
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
