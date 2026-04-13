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
  Info
} from 'lucide-react';

import { API_BASE_URL } from '../config';

const Events = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/events`);
        // Filter for this faculty
        const myItems = res.data.filter(item => {
          const normalizedUserName = user.name?.toLowerCase().trim();
          const itemFaculty = item.faculty?.toLowerCase() || '';
          const isSystem = itemFaculty.includes('system');
          
          let isAssigned = false;
          if (normalizedUserName && itemFaculty) {
            const assigneeWords = itemFaculty.split(' ').filter(w => w.length > 2);
            const userWords = normalizedUserName.split(' ').filter(w => w.length > 2);
            isAssigned = assigneeWords.some(word => normalizedUserName.includes(word)) || 
                         userWords.some(word => itemFaculty.includes(word));
          }
          
          return (isSystem || isAssigned) && item.type !== 'Task';
        });
        setItems(myItems);
      } catch (error) {
        console.error('Events Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [user]);

  const filteredItems = activeTab === 'All' ? items : items.filter(i => i.type === activeTab);

  if (loading) return (
    <div className="events-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: '300px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '400px' }}></div>
        </div>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="premium-card skeleton" style={{ height: '200px' }}></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="events-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-hero">Events & Meetings</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Institutional gatherings and scheduled faculty meetings.</p>
        </div>
        
        <div style={{ display: 'flex', background: 'var(--bg-main)', padding: '4px', borderRadius: '12px' }}>
          {['All', 'Meeting', 'Event'].map(tab => (
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
          {filteredItems.map((item) => (
            <EventCard key={item.id} item={item} />
          ))}
        </AnimatePresence>

        {filteredItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3>No {activeTab.toLowerCase()}s scheduled</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You're all clear for now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ item }) => {
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
      className="premium-card" 
      style={{ 
        display: 'flex', 
        gap: '24px', 
        alignItems: 'center',
        borderLeft: `5px solid ${item.type === 'Meeting' ? 'var(--info)' : 'var(--success)'}`,
        background: 'white'
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

      <div style={{ textAlign: 'right', minWidth: '160px', paddingLeft: '20px', borderLeft: '1px dashed var(--border)' }}>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Starting In</p>
          <div style={{ fontSize: '1.1rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: item.priority === 'High' ? 'var(--danger)' : 'var(--accent)' }}>
            {timeLeft}
          </div>
        </div>
        
        <button className={`btn ${item.type === 'Meeting' ? 'btn-primary' : 'btn-outline'}`} style={{ height: '36px', width: '100%', fontSize: '0.8rem', borderRadius: '8px' }}>
          {item.type === 'Meeting' ? <Video size={14} /> : <Info size={14} />}
          {item.type === 'Meeting' ? 'Join Virtual' : 'See Details'}
        </button>
      </div>
    </motion.div>
  );
};

export default Events;
