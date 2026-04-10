import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { notificationService } from '../services/NotificationService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

  useEffect(() => {
    const token = localStorage.getItem('facultyToken');
    const storedUser = localStorage.getItem('facultyUser');
    if (token && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  // Lecture Reminder System (Checks every 2 mins)
  useEffect(() => {
    if (!user) return;

    const checkLectures = async () => {
      try {
        const res = await axios.get(`${API_URL}/timetables`);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const now = new Date();
        
        res.data.forEach(tt => {
          if (tt.schedule && tt.schedule[today]) {
            Object.entries(tt.schedule[today]).forEach(([slot, lecture]) => {
              if (lecture.instructor === user.name || lecture.instructorId === user.id) {
                // Parse slot "09:00 AM"
                const [time, period] = slot.split(' ');
                let [hours, minutes] = time.split(':').map(Number);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                const lecTime = new Date();
                lecTime.setHours(hours, minutes, 0, 0);
                
                const diff = (lecTime.getTime() - now.getTime()) / (1000 * 60);
                
                // Alert if starting in 8.5 to 11 minutes (to catch it in the 2-min interval)
                if (diff > 8.5 && diff <= 11) {
                  notificationService.send("Lecture Reminder", {
                    body: `Your lecture "${lecture.subject}" starts in 10 minutes in Room ${lecture.room || 'TBA'}.`,
                    tag: `lec-${slot}-${today}`
                  });
                }
              }
            });
          }
        });
      } catch (err) {
        console.warn("Lecture check failed", err);
      }
    };

    const interval = setInterval(checkLectures, 120000); 
    checkLectures();
    return () => clearInterval(interval);
  }, [user]);

  // Socket Connection & Real-time Alerts
  useEffect(() => {
    if (user) {
      try {
        const newSocket = io(SOCKET_URL);
        
        newSocket.on('connect', () => {
          newSocket.emit('join-room', user.name);
        });

        newSocket.on('data-update', (data) => {
          notificationService.send("Institutional Update", {
            body: data.message || "A new institutional task or meeting has been assigned.",
            tag: "data-update"
          });
        });

        newSocket.on('new-message', (msg) => {
          if (msg.sender !== user.name) {
            notificationService.send(`New From ${msg.sender}`, {
              body: msg.text || "You received a new message/card.",
              tag: "chat-msg"
            });
          }
        });

        newSocket.on('connect_error', () => {
          console.warn('Socket connection failed.');
        });

        setSocket(newSocket);
        return () => newSocket.close();
      } catch (e) {
        console.error('Socket initialization failed:', e);
      }
    } else {
      setSocket(null);
    }
  }, [user]);

  const login = async (loginId, password) => {
    try {
      const response = await axios.post(`${API_URL}/faculty/login`, { loginId, password });
      const { token, faculty } = response.data;
      
      localStorage.setItem('facultyToken', token);
      localStorage.setItem('facultyUser', JSON.stringify(faculty));
      setUser(faculty);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.error || 'Login failed. Please check your credentials.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyUser');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    if (socket) socket.close();
  };

  const updateProfile = async (updatedData) => {
    try {
      const response = await axios.patch(`${API_URL}/faculty/${user.id}`, updatedData);
      const updatedUser = response.data;
      localStorage.setItem('facultyUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.error || 'Update failed.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, socket }}>
      {children}
    </AuthContext.Provider>
  );
};
