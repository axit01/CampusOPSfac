import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Search, 
  User, 
  ShieldCheck, 
  MoreVertical, 
  Video,
  Info,
  CheckCircle,
  XCircle,
  Megaphone,
  Calendar,
  Clock,
  MapPin,
  Play,
  AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../config';

const Collaboration = () => {
  const { user, socket } = useAuth();
  const [channels, setChannels] = useState([
    { id: 'broadcast', name: 'Admin Broadcasts', type: 'broadcast', icon: <Megaphone size={18} /> },
    { id: 'faculty-hub', name: 'Faculty General Hub', type: 'group', icon: <ShieldCheck size={18} /> },
    { id: user.id, name: 'Personal Admin Portal', type: 'private', icon: <ShieldCheck size={18} /> }
  ]);
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const scrollRef = useRef();

  // Listen for real-time messages
  useEffect(() => {
    if (socket) {
      socket.on('new-message', (msg) => {
        // Only add if it belongs to the current open channel
        if (msg.targetId === activeChannel.id) {
          setMessages(prev => [...prev, msg]);
        }
      });

      return () => socket.off('new-message');
    }
  }, [socket, activeChannel.id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facultyRes, msgRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/faculty`),
          axios.get(`${API_BASE_URL}/messages?targetId=${activeChannel.id}`)
        ]);
        
        setFacultyList(facultyRes.data.filter(f => f.id !== user.id));
        setMessages(msgRes.data);
      } catch (error) {
        console.error('Chat Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeChannel, user.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msgData = {
      sender: user.name,
      targetId: activeChannel.id,
      text: newMessage,
      type: 'chat'
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/messages`, msgData);
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (error) {
      console.error('Send Error:', error);
    }
  };

  const handleTaskAction = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, { status: newStatus });
      // Update the message metadata in-place to reflect the new status
      setMessages(msgs => msgs.map(m => {
        if (m.type === 'task-card' && m.metadata?.taskId === taskId) {
          return { ...m, metadata: { ...m.metadata, status: newStatus } };
        }
        return m;
      }));
    } catch (error) {
      console.error('Task Action Error:', error);
    }
  };

  return (
    <div className="collaboration-page" style={{ height: 'calc(100vh - var(--navbar-height) - 48px)', display: 'flex', gap: '24px' }}>
      {/* Sidebar: Channels & Faculty */}
      <aside className="premium-card" style={{ width: '320px', display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
        <div style={{ padding: '0 20px 20px' }}>
          <h2 className="heading-section" style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Collaboration</h2>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search faculty..." className="input" style={{ paddingLeft: '36px', height: '36px', fontSize: '0.8rem', background: 'var(--bg-main)', border: 'none' }} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '0 20px 10px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Channels</p>
            {channels.map(channel => (
              <ChannelItem 
                key={channel.id} 
                item={channel} 
                active={activeChannel.id === channel.id} 
                onClick={() => setActiveChannel(channel)}
              />
            ))}
          </div>

          <div style={{ padding: '10px 20px' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>Faculty Members</p>
            {facultyList.map(faculty => (
              <ChannelItem 
                key={faculty.id} 
                item={{ ...faculty, type: 'private', icon: <User size={18} /> }} 
                active={activeChannel.id === faculty.id} 
                onClick={() => setActiveChannel({ ...faculty, type: 'private' })}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="premium-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <header style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '10px', 
              background: activeChannel.type === 'broadcast' ? 'var(--danger-soft)' : 'var(--accent-soft)',
              color: activeChannel.type === 'broadcast' ? 'var(--danger)' : 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {activeChannel.icon || <User size={20} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem' }}>{activeChannel.name}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {activeChannel.type === 'broadcast' ? 'Administrator Announcements' : 'Active Connection'}
              </p>
            </div>
          </div>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading conversation...</p>
          ) : messages.length > 0 ? (
            messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} isMe={msg.sender === user.name} onTaskAction={handleTaskAction} />
            ))

          ) : (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
              <p>No messages yet in this channel.</p>
              <p style={{ fontSize: '0.8rem' }}>Start the conversation by typing below.</p>
            </div>
          )}
        </div>

        {activeChannel.type !== 'broadcast' ? (
          <footer style={{ padding: '20px', borderTop: '1px solid var(--border)' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="input" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ borderRadius: '12px', background: 'var(--bg-main)', border: 'none' }}
              />
              <button type="submit" className="btn btn-accent" style={{ borderRadius: '12px', width: '48px', padding: 0 }}>
                <Send size={20} />
              </button>
            </form>
          </footer>
        ) : (
          <footer style={{ padding: '16px', textAlign: 'center', background: 'var(--bg-main)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            This is a read-only channel for administrative broadcasts.
          </footer>
        )}
      </main>
    </div>
  );
};

const ChannelItem = ({ item, active, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      padding: '10px 12px', 
      borderRadius: '10px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '12px', 
      cursor: 'pointer',
      background: active ? 'var(--accent-soft)' : 'transparent',
      color: active ? 'var(--accent)' : 'var(--text-primary)',
      transition: 'all 0.2s',
      marginBottom: '4px'
    }}
  >
    <div style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>{item.icon}</div>
    <span style={{ fontSize: '0.9rem', fontWeight: active ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {item.name}
    </span>
  </div>
);

const MessageBubble = ({ msg, isMe, onTaskAction }) => {
  // Rich card for Tasks
  if (msg.type === 'task-card' && msg.metadata) {
    const m = msg.metadata;
    const priorityColor = m.priority === 'High' ? 'var(--danger)' : m.priority === 'Medium' ? 'var(--warning)' : 'var(--success)';
    return (
      <div style={{ maxWidth: '420px', alignSelf: 'flex-start', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>{msg.sender}</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ 
          background: 'white', borderRadius: '16px', border: '1px solid var(--border)', 
          overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ borderTop: `4px solid ${priorityColor}` }}></div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: '0.65rem', fontWeight: '800' }}>TASK</span>
              <span style={{ padding: '3px 10px', borderRadius: '6px', background: m.priority === 'High' ? 'var(--danger-soft)' : 'var(--warning-soft)', color: priorityColor, fontSize: '0.65rem', fontWeight: '800' }}>{m.priority}</span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px' }}>{m.title}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              {m.description || 'No description provided.'}
            </p>
            {m.deadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                <Calendar size={13} /> <span>{m.deadline?.includes('-') ? `Due ${new Date(m.deadline).toLocaleDateString()}` : `Due: ${m.deadline || 'No deadline'}`}</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => onTaskAction && onTaskAction(m.taskId, 'Accepted')}
                style={{ flex: 1, height: '38px', borderRadius: '10px', background: 'var(--success)', color: 'white', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', border: 'none' }}
              >
                <CheckCircle size={15} /> Accept
              </button>
              <button 
                onClick={() => onTaskAction && onTaskAction(m.taskId, 'Rejected')}
                style={{ flex: 1, height: '38px', borderRadius: '10px', background: 'white', color: 'var(--danger)', fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', border: '1px solid var(--danger-soft)' }}
              >
                <XCircle size={15} /> Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Rich card for Events / Meetings
  if (msg.type === 'event-card' && msg.metadata) {
    const m = msg.metadata;
    const isMeeting = m.eventType === 'Meeting';
    return (
      <div style={{ maxWidth: '420px', alignSelf: 'flex-start', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)' }}>{msg.sender}</span>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
            {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div style={{ 
          background: 'white', borderRadius: '16px', border: '1px solid var(--border)', 
          overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ borderTop: `4px solid ${isMeeting ? 'var(--info)' : 'var(--success)'}` }}></div>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '6px', background: isMeeting ? 'var(--info-soft)' : 'var(--success-soft)', color: isMeeting ? 'var(--info)' : 'var(--success)', fontSize: '0.65rem', fontWeight: '800' }}>
                {m.eventType}
              </span>
              {m.priority === 'High' && <span style={{ padding: '3px 10px', borderRadius: '6px', background: 'var(--danger-soft)', color: 'var(--danger)', fontSize: '0.65rem', fontWeight: '800' }}>URGENT</span>}
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '12px' }}>{m.title}</h4>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={13} /> {m.date}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Clock size={13} /> {m.time}</div>
              {m.location && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={13} /> {m.location}</div>}
            </div>

            <EventCountdown date={m.date} time={m.time} />

            <button style={{ 
              width: '100%', height: '38px', borderRadius: '10px', 
              background: isMeeting ? 'var(--info)' : 'var(--accent-soft)', 
              color: isMeeting ? 'white' : 'var(--accent)', 
              fontWeight: '700', fontSize: '0.8rem', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', 
              cursor: 'pointer', border: 'none', marginTop: '12px'
            }}>
              {isMeeting ? <><Video size={14} /> Join Meeting</> : <><Info size={14} /> View Details</>}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default plain text bubble
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: isMe ? 'flex-end' : 'flex-start',
      maxWidth: '80%',
      alignSelf: isMe ? 'flex-end' : 'flex-start'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        {!isMe && <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>{msg.sender}</span>}
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div style={{ 
        padding: '12px 16px', 
        borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isMe ? 'var(--accent)' : 'var(--bg-main)',
        color: isMe ? 'white' : 'var(--text-primary)',
        fontSize: '0.9rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {msg.text}
      </div>
    </div>
  );
};

// Live countdown sub-component for event cards in chat
const EventCountdown = ({ date, time }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(`${date}T${time}`);
      const diff = target - now;
      if (diff <= 0) { setTimeLeft('Active / Passed'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [date, time]);

  return (
    <div style={{ background: 'var(--bg-main)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starts In</span>
      <span style={{ fontSize: '1rem', fontWeight: '800', fontVariantNumeric: 'tabular-nums', color: 'var(--accent)' }}>{timeLeft}</span>
    </div>
  );
};

export default Collaboration;
