import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  StickyNote, 
  Clock, 
  Heart,
  ChevronRight,
  MoreVertical,
  Type
} from 'lucide-react';

import { API_BASE_URL } from '../config';

const Notepad = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/notes`);
      // Filter for this faculty
      const myNotes = res.data.filter(n => n.facultyId === user.id);
      setNotes(myNotes);
      if (myNotes.length > 0) setActiveNote(myNotes[0]);
    } catch (error) {
      console.error('Fetch Notes Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    const newNote = {
      facultyId: user.id,
      title: 'Untilted Note',
      content: '',
      color: '#f8fafc'
    };
    try {
      const res = await axios.post(`${API_URL}/notes`, newNote);
      setNotes([res.data, ...notes]);
      setActiveNote(res.data);
    } catch (error) {
      console.error('Create Note Error:', error);
    }
  };

  const updateNote = async (id, updates) => {
    try {
      const res = await axios.patch(`${API_URL}/notes/${id}`, updates);
      setNotes(notes.map(n => n.id === id ? res.data : n));
      setActiveNote(res.data);
    } catch (error) {
      console.error('Update Note Error:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`);
      const updatedNotes = notes.filter(n => n.id !== id);
      setNotes(updatedNotes);
      if (activeNote?.id === id) {
        setActiveNote(updatedNotes[0] || null);
      }
    } catch (error) {
      console.error('Delete Note Error:', error);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="notepad-page" style={{ height: 'calc(100vh - var(--navbar-height) - 48px)', display: 'flex', gap: '24px' }}>
      <aside className="premium-card" style={{ width: '300px', padding: '20px' }}>
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton" style={{ height: '36px', marginBottom: '20px' }}></div>
        {[1,2,3,4,5].map(i => (
          <div key={i} className="skeleton" style={{ height: '60px', marginBottom: '12px' }}></div>
        ))}
      </aside>
      <main className="premium-card" style={{ flex: 1, padding: '32px' }}>
        <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
        <div className="skeleton" style={{ height: '2px', marginBottom: '32px' }}></div>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} className="skeleton skeleton-text"></div>
        ))}
      </main>
    </div>
  );

  return (
    <div className="notepad-page" style={{ height: 'calc(100vh - var(--navbar-height) - 48px)', display: 'flex', gap: '24px' }}>
      {/* Sidebar: Notes List */}
      <aside className="premium-card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="heading-section" style={{ fontSize: '1.25rem', marginBottom: 0 }}>My Notes</h2>
            <button 
              onClick={createNote}
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '8px', 
                background: 'var(--accent)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search notes..." 
              className="input" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '36px', fontSize: '0.8rem', background: 'var(--bg-main)', border: 'none' }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <AnimatePresence>
            {filteredNotes.map(note => (
              <motion.div 
                key={note.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onClick={() => setActiveNote(note)}
                style={{ 
                  padding: '16px 20px', 
                  cursor: 'pointer',
                  background: activeNote?.id === note.id ? 'var(--accent-soft)' : 'transparent',
                  borderLeft: `4px solid ${activeNote?.id === note.id ? 'var(--accent)' : 'transparent'}`,
                  transition: 'all 0.2s'
                }}
              >
                <h4 style={{ fontSize: '0.9rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{note.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(note.date).toLocaleDateString()}</span>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: note.color }}></div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Content: Editor */}
      <main className="premium-card" style={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column', background: activeNote?.color || 'white' }}>
        {activeNote ? (
          <>
            <header style={{ padding: '20px 32px', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <Type size={18} color="var(--text-muted)" />
                <input 
                  type="text" 
                  value={activeNote.title}
                  onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    width: '100%',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#f8fafc', '#fffbeb', '#f0fdf4', '#fdf2f2', '#f0f9ff'].map(c => (
                    <div 
                      key={c}
                      onClick={() => updateNote(activeNote.id, { color: c })}
                      style={{ 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '4px', 
                        background: c, 
                        border: '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        transform: activeNote.color === c ? 'scale(1.2)' : 'none'
                      }}
                    />
                  ))}
                </div>
                <button onClick={() => deleteNote(activeNote.id)} style={{ color: '#ef4444', padding: '4px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            </header>

            <div style={{ flex: 1, padding: '32px' }}>
              <textarea 
                value={activeNote.content}
                onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                placeholder="Write your personal notes here..."
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  border: 'none', 
                  background: 'transparent', 
                  resize: 'none', 
                  outline: 'none',
                  fontSize: '1rem',
                  lineHeight: '1.8',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <footer style={{ padding: '12px 32px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={14} />
                <span>Last updated {new Date(activeNote.updatedAt || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Save size={14} />
                <span>Auto-saved permanently</span>
              </div>
            </footer>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <StickyNote size={64} style={{ marginBottom: '24px', opacity: 0.2 }} />
            <h3>No note selected</h3>
            <p>Select a note from the sidebar or create a new one.</p>
            <button onClick={createNote} className="btn btn-primary" style={{ marginTop: '24px' }}>
              <Plus size={18} /> Create First Note
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notepad;
