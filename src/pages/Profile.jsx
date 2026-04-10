import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Lock, 
  Save,
  Camera,
  AlertCircle,
  Bell
} from 'lucide-react';
import { notificationService } from '../services/NotificationService';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await updateProfile(formData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  return (
    <div className="profile-page">
      <header style={{ marginBottom: '32px' }}>
        <h1 className="heading-hero">Personal Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your institutional identity and security.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
        <aside>
          <div className="premium-card" style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '32px', 
                background: 'var(--accent)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                fontWeight: '800',
                boxShadow: 'var(--shadow-lg)'
              }}>
                {user?.name?.[0]}
              </div>
              <button style={{ 
                position: 'absolute', 
                bottom: '-10px', 
                right: '-10px', 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'white', 
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow)'
              }}>
                <Camera size={18} />
              </button>
            </div>
            
            <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{user?.name}</h2>
            <p style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '24px' }}>
              {user?.role}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Department</p>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.dept}</p>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Faculty Code</p>
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.code}</p>
              </div>
              <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '12px' }}>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Account Status</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user?.status}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main>
          <div className="premium-card">
            <h2 className="heading-section" style={{ fontSize: '1.1rem' }}>Account Details</h2>
            
            {message.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  padding: '16px', 
                  borderRadius: '12px', 
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: message.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
                  color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}
              >
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <p style={{ fontSize: '0.9rem', fontWeight: '600' }}>{message.text}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                <div className="input-group">
                  <label className="label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="input" 
                      style={{ paddingLeft: '40px' }}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="label">Institutional Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      className="input" 
                      style={{ paddingLeft: '40px' }}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="label">Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="input" 
                      style={{ paddingLeft: '40px' }}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="label">Account Security (OTP/Code)</label>
                  <div style={{ position: 'relative' }}>
                    <Shield size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="input" 
                      disabled 
                      style={{ paddingLeft: '40px', background: 'var(--bg-main)' }}
                      value={user?.code}
                    />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', marginTop: '32px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '8px' }}>Institutional Alerts</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Enable desktop alerts for real-time updates on task assignments, meetings, and lecture reminders.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button"
                    onClick={async () => {
                      const granted = await notificationService.requestPermission();
                      if (granted) {
                        notificationService.test();
                      } else {
                        alert("Please enable notification permissions in your browser settings.");
                      }
                    }}
                    className="btn btn-outline" 
                    style={{ height: '42px', fontSize: '0.85rem' }}
                  >
                    <Shield size={18} /> Test Sync Connectivity
                  </button>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px', marginTop: '32px' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>Change Access Password</h3>
                <div style={{ maxWidth: '400px' }}>
                  <div className="input-group">
                    <label className="label">New Security Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        className="input" 
                        placeholder="Leave blank to keep current"
                        style={{ paddingLeft: '40px' }}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '40px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
