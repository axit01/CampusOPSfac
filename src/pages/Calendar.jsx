import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon,
  Bell,
  CheckCircle,
  MapPin
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, eachDayOfInterval } from 'date-fns';
import { API_BASE_URL } from '../config';

const CalendarPage = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, taskRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/events`),
          axios.get(`${API_BASE_URL}/tasks`)
        ]);
        
        const myTasks = taskRes.data.filter(t => t.assignedTo.includes(user.name) || t.assignedTo.includes(user.id));
        const myEvents = evRes.data.filter(e => e.faculty === 'System' || (e.faculty && e.faculty.includes(user.name)));
        
        setEvents(myEvents);
        setTasks(myTasks);
      } catch (error) {
        console.error('Calendar Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const renderHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
      <div>
        <h1 className="heading-hero">{format(currentDate, 'MMMM yyyy')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Institutional Schedule & Deadlines</p>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="icon-btn" style={{ borderRadius: '10px', background: 'white' }}><ChevronLeft /></button>
        <button onClick={() => setCurrentDate(new Date())} className="btn btn-outline" style={{ height: '40px' }}>Today</button>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="icon-btn" style={{ borderRadius: '10px', background: 'white' }}><ChevronRight /></button>
      </div>
    </div>
  );

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '12px' }}>
        {days.map(day => (
          <div key={day} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {days.map((day, i) => {
          const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
          const dayTasks = tasks.filter(t => isSameDay(new Date(t.deadline), day));
          const isSelected = isSameDay(day, selectedDay);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div 
              key={i} 
              onClick={() => setSelectedDay(day)}
              style={{ 
                minHeight: '120px', 
                background: isSelected ? '#f0f7ff' : 'white',
                padding: '12px',
                cursor: 'pointer',
                opacity: isCurrentMonth ? 1 : 0.4,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: isSameDay(day, new Date()) ? '700' : '500',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: isSameDay(day, new Date()) ? 'var(--accent)' : 'transparent',
                  color: isSameDay(day, new Date()) ? 'white' : 'inherit'
                }}>
                  {format(day, 'd')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dayEvents.map((e, idx) => (
                  <div key={idx} style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '0.65rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {e.title}
                  </div>
                ))}
                {dayTasks.map((t, idx) => (
                  <div key={idx} style={{ padding: '2px 6px', borderRadius: '4px', background: 'var(--warning-soft)', color: 'var(--warning)', fontSize: '0.65rem', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="calendar-page">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        <main>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </main>

        <aside>
          <div className="premium-card">
            <h2 className="heading-section" style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Schedule for {format(selectedDay, 'MMM do')}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Upcoming Today</p>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedDay.toString()}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  {events.filter(e => isSameDay(new Date(e.date), selectedDay)).map((e, i) => (
                    <DayItem key={i} title={e.title} time={e.time} type={e.type} location={e.location} />
                  ))}
                  {tasks.filter(t => isSameDay(new Date(t.deadline), selectedDay)).map((t, i) => (
                    <DayItem key={i} title={t.title} time="Deadline" type="Task" color="var(--warning)" />
                  ))}
                  
                  {events.filter(e => isSameDay(new Date(e.date), selectedDay)).length === 0 && 
                   tasks.filter(t => isSameDay(new Date(t.deadline), selectedDay)).length === 0 && (
                     <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                       <CalendarIcon size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                       <p>No scheduled tasks or events for this day.</p>
                     </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ marginTop: '32px', padding: '20px', background: 'var(--bg-main)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Bell size={18} color="var(--accent)" />
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Smart Reminders</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                You will receive desktop and mobile notifications 10 minutes before every scheduled meeting.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const DayItem = ({ title, time, type, location, color }) => (
  <div style={{ 
    display: 'flex', 
    gap: '16px', 
    padding: '16px', 
    borderRadius: '12px', 
    border: '1px solid var(--border)', 
    marginBottom: '12px',
    background: 'white'
  }}>
    <div style={{ 
      width: '4px', 
      background: color || 'var(--accent)', 
      borderRadius: '2px' 
    }}></div>
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h4 style={{ fontSize: '0.95rem' }}>{title}</h4>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{time}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} /> {type}
        </span>
        {location && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={12} /> {location}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default CalendarPage;
