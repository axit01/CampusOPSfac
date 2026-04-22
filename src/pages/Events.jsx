import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink,
  Video,
  ChevronRight,
  Info,
  CheckSquare,
  X,
  FileText,
  Briefcase
} from 'lucide-react';

import { API_BASE_URL } from '../config';

const Events = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        const facultyId = user.id || user._id;
        const res = await axios.get(`${API_BASE_URL}/my-stuff/${facultyId}`);
        
        const { tasks: pulledTasks, events: pulledEvents } = res.data;

        // Consolidate everything into a single unified list
        const consolidated = [
          ...pulledEvents.map(e => ({ ...e, type: e.type || 'Event' })),
          ...pulledTasks.map(t => ({ ...t, type: 'Task' }))
        ].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

        setItems(consolidated);
      } catch (error) {
        console.error('Scratch Sync Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const idStr = taskId.toString();
      await axios.patch(`${API_BASE_URL}/tasks/${idStr}`, { status: newStatus });
      
      // Update the status in our unified list
      setItems(prev => prev.map(item => {
        const itemId = (item.id || item._id || '').toString();
        return itemId === idStr ? { ...item, status: newStatus } : item;
      }));

      if (newStatus === 'Completed') {
        alert('🎉 Excellent! You have successfully completed this task.');
      }
    } catch (e) { 
      console.error('Task Status Update Failed:', e);
      alert('Failed to update task status. Please check your connection.');
    }
  };

  const filteredContent = activeTab === 'All' 
    ? items 
    : items.filter(item => {
        if (activeTab === 'Tasks') return item.type === 'Task';
        return item.type === activeTab;
      });

  if (loading) return (
    <div className="events-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: '300px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '400px' }}></div>
        </div>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[1,2,3].map(i => <div key={i} className="premium-card skeleton" style={{ height: '140px' }}></div>)}
      </div>
    </div>
  );

  return (
    <div className="events-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-hero">Schedule & Tasks</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Centralized hub for your institutional meetings, events, and assigned duties.</p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '12px' }}>
          {['All', 'Tasks', 'Meeting', 'Event'].map(tab => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className="btn" 
              style={{ 
                padding: '8px 16px', 
                fontSize: '0.875rem', 
                borderRadius: '8px',
                background: activeTab === tab ? 'white' : 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AnimatePresence mode="popLayout">
          {filteredContent.map((item) => (
            item.type === 'Task' ? 
              <UnifiedTaskCard key={item.id || item._id} task={item} updateStatus={updateTaskStatus} onViewDetails={setSelectedItem} /> : 
              <EventCard key={item.id || item._id} item={item} onViewDetails={setSelectedItem} />
          ))}
        </AnimatePresence>

        {filteredContent.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3>No {activeTab.toLowerCase()} found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Your schedule is currently clear.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} updateStatus={updateTaskStatus} />}
      </AnimatePresence>
    </div>
  );
};

const DetailModal = ({ item, onClose, updateStatus }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="premium-card"
        style={{ maxWidth: '500px', width: '100%', padding: '32px', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', color: 'var(--text-muted)' }}>
          <X size={24} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ 
            padding: '12px', borderRadius: '12px', 
            background: item.type === 'Task' ? 'var(--accent-soft)' : (item.type === 'Meeting' ? 'var(--info-soft)' : 'var(--success-soft)'),
            color: item.type === 'Task' ? 'var(--accent)' : (item.type === 'Meeting' ? 'var(--info)' : 'var(--success)')
          }}>
            {item.type === 'Task' ? <Briefcase size={24} /> : (item.type === 'Meeting' ? <Users size={24} /> : <Calendar size={24} />)}
          </div>
          <div>
            <span className="badge badge-accent" style={{ fontSize: '0.65rem', marginBottom: '4px' }}>{item.type.toUpperCase()}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{item.title}</h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          <section>
            <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Description</h4>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.description || 'No detailed description provided for this engagement.'}</p>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Schedule</h4>
              <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.date || 'Flexible'}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.time || 'All Day'}</p>
            </div>
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Location</h4>
              <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.location || 'Main Campus'}</p>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Priority</h4>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', color: item.priority === 'High' ? 'var(--danger)' : 'var(--text-primary)' }}>{item.priority || 'Normal'}</p>
            </div>
            {item.type === 'Task' && (
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Status</h4>
                <p style={{ fontSize: '0.9rem', fontWeight: '700' }}>{item.status || 'Assigned'}</p>
              </div>
            )}
          </div>
        </div>

        {item.type === 'Task' && item.status !== 'Completed' && (
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
            onClick={() => {
              const nextStatus = item.status === 'Assigned' ? 'Accepted' : (item.status === 'Accepted' ? 'Working' : 'Completed');
              updateStatus(item.id || item._id, nextStatus);
              onClose();
            }}
          >
            {item.status === 'Assigned' ? 'Accept Task' : (item.status === 'Accepted' ? 'Start Working' : 'Mark Completed')}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
};


const UnifiedTaskCard = ({ task, updateStatus }) => {
  const currentStatus = task.status || 'Assigned';
  const taskId = task.id || task._id;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="premium-card clickable"
      onClick={() => onViewDetails(task)}
      style={{ 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'center',
        borderLeft: `5px solid ${currentStatus === 'Completed' ? 'var(--success)' : task.priority === 'High' ? 'var(--danger)' : 'var(--accent)'}`,
        background: 'white',
        cursor: 'pointer'
      }}
    >
      <div style={{ 
        width: '64px', height: '64px', borderRadius: '12px', background: currentStatus === 'Completed' ? 'var(--success-soft)' : 'var(--accent-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        {currentStatus === 'Completed' ? <CheckSquare size={28} color="var(--success)" /> : <Clock size={28} color="var(--accent)" />}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-accent" style={{ fontSize: '0.6rem' }}>TASK</span>
          <span className={`badge ${currentStatus === 'Completed' ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.6rem' }}>
            {currentStatus.toUpperCase()}
          </span>
          {task.priority === 'High' && currentStatus !== 'Completed' && <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>Urgent</span>}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', textDecoration: currentStatus === 'Completed' ? 'line-through' : 'none', opacity: currentStatus === 'Completed' ? 0.6 : 1 }}>
          {task.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>{task.description}</p>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: {task.deadline || 'Flexible'}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }} onClick={e => e.stopPropagation()}>
        {currentStatus === 'Assigned' && (
          <button onClick={() => updateStatus(taskId, 'Accepted')} className="btn btn-primary" style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}>Accept Task</button>
        )}
        {currentStatus === 'Accepted' && (
          <button onClick={() => updateStatus(taskId, 'Working')} className="btn btn-accent" style={{ width: '100%', height: '38px', fontSize: '0.85rem' }}>Start Working</button>
        )}
        {currentStatus === 'Working' && (
          <button onClick={() => updateStatus(taskId, 'Completed')} className="btn btn-primary" style={{ width: '100%', height: '38px', fontSize: '0.85rem', background: 'var(--success)' }}>Mark Completed</button>
        )}
        {currentStatus === 'Completed' && (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
            color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem', 
            background: 'var(--success-soft)', padding: '8px', borderRadius: '8px'
          }}>
            <CheckSquare size={16} /> Task Completed
          </div>
        )}
      </div>
    </motion.div>
  );
};


const EventCard = ({ item, onViewDetails }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date();
      const eventDate = new Date(`${item.date}T${item.time}`); // Improved date parsing
      const diff = eventDate - now;

      if (diff <= 0) {
        setTimeLeft('Active / Passed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [item]);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="premium-card clickable" 
      onClick={() => onViewDetails(item)}
      style={{ 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'center',
        borderLeft: `5px solid ${item.type === 'Meeting' ? 'var(--info)' : 'var(--success)'}`,
        background: 'white',
        cursor: 'pointer'
      }}
    >
      <div style={{ 
        width: '64px', 
        height: '64px', 
        borderRadius: '12px', 
        background: 'var(--bg-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px var(--border)'
      }}>
        <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
          {new Date(item.date).getDate()}
        </span>
        <span style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {new Date(item.date).toLocaleDateString([], { month: 'short' })}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className={`badge ${item.type === 'Meeting' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.6rem' }}>{item.type}</span>
          {item.priority === 'High' && <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>Urgent</span>}
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>{item.title}</h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} /> <span>{item.time}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> <span>{item.location || 'Main Campus'}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: '160px', paddingLeft: '20px', borderLeft: '1px dashed var(--border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Starting In</p>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: item.priority === 'High' ? 'var(--danger)' : 'var(--accent)' }}>
            {timeLeft}
          </div>
        </div>
        
        {item.type === 'Meeting' && (item.location?.toLowerCase().includes('http') || item.location?.toLowerCase().includes('zoom') || item.location?.toLowerCase().includes('meet')) ? (
          <button 
            onClick={() => {
              const link = item.location.match(/https?:\/\/[^\s]+/)?.[0] || item.location;
              window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
            }}
            className="btn btn-primary" 
            style={{ height: '36px', width: '100%', fontSize: '0.8rem', borderRadius: '8px' }}
          >
            <Video size={14} /> Join Virtual
          </button>
        ) : (
          <button onClick={() => onViewDetails(item)} className="btn btn-outline" style={{ height: '36px', width: '100%', fontSize: '0.8rem', borderRadius: '8px' }}>
            <Info size={14} /> See Details
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Events;
