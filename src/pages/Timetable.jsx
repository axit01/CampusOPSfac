import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Book, 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon,
  Download,
  Printer
} from 'lucide-react';

import { API_BASE_URL } from '../config';

const Timetable = () => {
  const { user } = useAuth();
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/timetables`);
        // Filter timetables relevant to user's department or where they might be assigned
        setTimetableData(res.data);
      } catch (error) {
        console.error('Timetable Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  // Helper to find assigned lecture for a specific day and slot
  const getLectureForSlot = (day, slotTime, slotIdx) => {
    let assignment = null;
    
    timetableData.forEach(tt => {
      if (tt.schedule && tt.schedule[day]) {
        const daySchedule = tt.schedule[day];
        // If it's an array, we can use the slot index
        if (Array.isArray(daySchedule)) {
          const lecture = daySchedule[slotIdx];
          if (lecture && !lecture.isEmpty) {
            // Match by faculty name or user ID
            // Admin saves it as 'faculty', Faculty side looks for 'instructor'
            if (lecture.faculty === user.name || lecture.instructor === user.name || 
                lecture.instructorId === user.id || lecture.facultyId === user.id) {
              assignment = {
                ...lecture,
                className: tt.className,
                department: tt.department
              };
            }
          }
        } 
        // Legacy support if it's an object keyed by time
        else if (daySchedule[slotTime]) {
          const lecture = daySchedule[slotTime];
          if (lecture.instructor === user.name || lecture.faculty === user.name || 
              lecture.instructorId === user.id || lecture.facultyId === user.id) {
            assignment = {
              ...lecture,
              className: tt.className,
              department: tt.department
            };
          }
        }
      }
    });

    return assignment;
  };
  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF('landscape');
      doc.text(`Academic Timetable - ${user.dept}`, 14, 15);
      
      const tableColumn = ["Time", ...days];
      const tableRows = slots.map((slot, idx) => {
        const row = [slot];
        days.forEach((day, dIdx) => {
          const lec = getLectureForSlot(day, slot, idx);
          row.push(lec ? `${lec.subject}\n(${lec.className})` : "-");
        });
        return row;
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [15, 23, 42] }
      });
      
      doc.save(`Timetable_${user.dept}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Could not export PDF. Please ensure all dependencies are loaded.');
    }
  };

  if (loading) return (
    <div className="timetable-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <div className="skeleton skeleton-title" style={{ width: '300px' }}></div>
          <div className="skeleton skeleton-text" style={{ width: '400px' }}></div>
        </div>
      </header>
      <div className="premium-card skeleton" style={{ height: '500px' }}></div>
    </div>
  );

  return (
    <div className="timetable-page">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="heading-hero">Academic Timetable</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Weekly lecture schedule for {user?.dept} Department.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePrint} className="btn btn-outline" style={{ height: '40px' }}><Printer size={18} /> Print</button>
          <button onClick={handleExportPDF} className="btn btn-primary" style={{ height: '40px' }}><Download size={18} /> Export PDF</button>
        </div>
      </header>

      <div className="premium-card" style={{ padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr>
              <th style={{ padding: '20px', textAlign: 'left', background: 'var(--bg-main)', borderBottom: '2px solid var(--border)', width: '120px' }}>Time</th>
              {days.map(day => (
                <th key={day} style={{ padding: '20px', textAlign: 'center', background: 'var(--bg-main)', borderBottom: '2px solid var(--border)' }}>
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slots.map((slot, sIdx) => (
              <tr key={slot}>
                <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {slot}
                </td>
                {days.map((day, dIdx) => {
                  const lecture = getLectureForSlot(day, slot, sIdx);
                  return (
                    <td key={day} style={{ padding: '12px', borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
                      {lecture ? (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          style={{ 
                            background: 'var(--accent-soft)', 
                            borderLeft: '4px solid var(--accent)',
                            padding: '12px',
                            borderRadius: '8px',
                            textAlign: 'left'
                          }}
                        >
                          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent)', marginBottom: '4px' }}>{lecture.subject}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={10} /> {lecture.room || 'TBA'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <CalendarIcon size={10} /> {lecture.className}
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        <div style={{ minHeight: '60px' }}></div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '32px', display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }} className="premium-card">
          <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Schedule Overview</h3>
          <div style={{ display: 'flex', gap: '32px' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Weekly Hours</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>18 Hours</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lab Sessions</p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>4 Sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
