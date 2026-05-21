import React, { useState } from 'react';
import { X, Award, History, Trophy, Flame, Clock, Calendar } from 'lucide-react';
import audioEngine from '../services/AudioEngine';

const AVATARS = ['🧘', '🍃', '🌊', '🏔️', '☀️', '🦉', '🕊️', '✨'];

export default function ProfileDrawer({ 
  isOpen, 
  onClose, 
  userStats, 
  userSettings, 
  onUpdateSettings,
  currentUser,
  onRegister,
  onLogin,
  onLogout
}) {
  const { name, dailyGoal, avatar } = userSettings;
  const { totalSessions, totalMinutes, currentStreak, longestStreak, history } = userStats;

  // Auth form states
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Achievement logic
  const achievements = [
    {
      id: 'first_session',
      name: 'Zen Novice',
      desc: 'Completed your first meditation session',
      icon: '🧘',
      unlocked: totalSessions >= 1
    },
    {
      id: 'streak_3',
      name: 'Habit Builder',
      desc: 'Achieve a 3-day meditation streak',
      icon: '🔥',
      unlocked: currentStreak >= 3
    },
    {
      id: 'session_20',
      name: 'Deep Diver',
      desc: 'Complete a single session of 20+ minutes',
      icon: '⚡',
      unlocked: history && history.some(h => h.duration >= 20)
    },
    {
      id: 'total_60',
      name: 'Zen Master',
      desc: 'Meditate for a total of 60+ minutes',
      icon: '🏆',
      unlocked: totalMinutes >= 60
    }
  ];

  const handleNameChange = (e) => {
    onUpdateSettings({ ...userSettings, name: e.target.value });
  };

  const handleGoalChange = (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    onUpdateSettings({ ...userSettings, dailyGoal: Math.max(1, val) });
  };

  const handleAvatarSelect = (av) => {
    onUpdateSettings({ ...userSettings, avatar: av });
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setAuthLoading(true);
    setAuthError('');
    setSuccessMsg('');
    try {
      if (isSignUp) {
        await onRegister(email.trim(), password);
        setSuccessMsg('Account created successfully! ✨');
      } else {
        await onLogin(email.trim(), password);
        setSuccessMsg('Signed in successfully! 🧘');
      }
      
      // Play chime chime
      audioEngine.init();
      audioEngine.playAlert('chime');

      // Clear forms
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error(err);
      // Clean up Firebase error messages for user-friendly display
      let cleanMsg = err.message || 'Authentication failed.';
      if (cleanMsg.includes('auth/invalid-credential') || cleanMsg.includes('auth/user-not-found') || cleanMsg.includes('auth/wrong-password')) {
        cleanMsg = 'Invalid email or password.';
      } else if (cleanMsg.includes('auth/email-already-in-use')) {
        cleanMsg = 'This email is already registered.';
      } else if (cleanMsg.includes('auth/weak-password')) {
        cleanMsg = 'Password must be at least 6 characters.';
      } else if (cleanMsg.includes('auth/invalid-email')) {
        cleanMsg = 'Please enter a valid email address.';
      }
      setAuthError(cleanMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthLogout = async () => {
    try {
      await onLogout();
      // Play logout success chime
      audioEngine.init();
      audioEngine.playAlert('chime');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulseDot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(24, 210, 188, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(24, 210, 188, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(24, 210, 188, 0); }
        }
        @keyframes spinSync {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .pulse-dot {
          animation: pulseDot 2s infinite;
        }
        .spin-sync-indicator {
          animation: spinSync 1s linear infinite;
        }
      `}</style>

      <div 
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      <div className={`profile-drawer ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Profile & Insights</h3>
          <button className="drawer-close" onClick={onClose} aria-label="Close drawer">
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          
          {/* Firebase Authentication Sync Card */}
          {!currentUser ? (
            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid hsla(var(--accent-rgb), 0.25)', background: 'linear-gradient(135deg, hsla(var(--accent-rgb), 0.08) 0%, hsla(var(--accent-rgb), 0.02) 100%)', boxShadow: '0 0 20px hsla(var(--accent-rgb), 0.1)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.2rem' }}>☁️</span>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent)', textShadow: '0 0 10px hsla(var(--accent-rgb), 0.3)' }}>Sync Your Progress</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0 }}>
                Create a secure cloud account to sync your meditation statistics and medication checklists in real-time across all your devices.
              </p>

              <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="auth-email-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Email Address</label>
                  <input 
                    id="auth-email-input"
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--card-bg-hover)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="auth-password-input" style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Password</label>
                  <input 
                    id="auth-password-input"
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.82rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--card-bg-hover)', color: 'var(--text-primary)' }}
                  />
                </div>

                {authError && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-red, #ff3b30)', fontWeight: 600, display: 'block', wordBreak: 'break-word' }}>
                    ⚠️ {authError}
                  </span>
                )}

                {successMsg && (
                  <span style={{ fontSize: '0.72rem', color: '#18d2bc', fontWeight: 600, display: 'block' }}>
                    ✨ {successMsg}
                  </span>
                )}

                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.55rem', fontSize: '0.82rem', justifyContent: 'center', fontWeight: 700, marginTop: '0.2rem', gap: '0.5rem' }}
                >
                  {authLoading ? (
                    <span className="spin-sync-indicator" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  ) : (
                    isSignUp ? 'Create Cloud Account' : 'Sign In & Sync'
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setAuthError('');
                      setSuccessMsg('');
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid hsla(168, 80%, 45%, 0.25)', background: 'linear-gradient(135deg, hsla(168, 80%, 45%, 0.08) 0%, hsla(168, 80%, 45%, 0.02) 100%)', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="pulse-dot" style={{ 
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#18d2bc',
                  }} />
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Cloud Sync Connected</span>
                </div>
                <span style={{ fontSize: '1.1rem' }}>✨</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Account</span>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{currentUser.email}</span>
              </div>

              <button 
                onClick={handleAuthLogout}
                className="btn btn-secondary"
                style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center', fontWeight: 700 }}
              >
                Sign Out of Cloud
              </button>
            </div>
          )}

          {/* User Customization */}
          <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ 
                fontSize: '2.5rem', 
                width: '64px', 
                height: '64px', 
                background: 'var(--accent-light)', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid hsla(var(--accent-rgb), 0.2)'
              }}>
                {avatar}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
                <div className="form-group">
                  <label htmlFor="user-name-input">Your Name</label>
                  <input 
                    id="user-name-input"
                    type="text" 
                    value={name} 
                    onChange={handleNameChange}
                    placeholder="Enter name"
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Choose Avatar Symbol</label>
              <div className="avatar-selector">
                {AVATARS.map(av => (
                  <button 
                    key={av}
                    onClick={() => handleAvatarSelect(av)}
                    className={`avatar-opt ${avatar === av ? 'selected' : ''}`}
                    style={{ background: 'none', padding: 0 }}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="daily-goal-input">Daily Meditation Goal (Minutes)</label>
              <input 
                id="daily-goal-input"
                type="number" 
                value={dailyGoal} 
                onChange={handleGoalChange}
                min="1"
                max="240"
              />
            </div>
          </div>

          {/* Statistics Grid */}
          <div>
            <h4 className="drawer-section-title">Your Statistics</h4>
            <div className="stats-grid">
              <div className="glass-panel stat-card">
                <span className="stat-val">{totalSessions}</span>
                <span className="stat-lbl">Total Sessions</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-val">{totalMinutes}m</span>
                <span className="stat-lbl">Total Minutes</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-val">{currentStreak}🔥</span>
                <span className="stat-lbl">Current Streak</span>
              </div>
              <div className="glass-panel stat-card">
                <span className="stat-val">{longestStreak}🔥</span>
                <span className="stat-lbl">Longest Streak</span>
              </div>
            </div>
          </div>

          {/* Achievements Section */}
          <div>
            <h4 className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={18} className="text-accent" />
              <span>Milestones & Badges</span>
            </h4>
            <div className="badges-grid">
              {achievements.map(ach => (
                <div 
                  key={ach.id} 
                  className={`badge-item ${ach.unlocked ? 'unlocked' : ''}`}
                >
                  <div className="badge-icon">
                    {ach.unlocked ? ach.icon : '🔒'}
                  </div>
                  <div className="badge-info">
                    <span className="badge-name">{ach.name}</span>
                    <span className="badge-desc">{ach.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* History log */}
          <div>
            <h4 className="drawer-section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={18} />
              <span>Session Log</span>
            </h4>
            {history && history.length > 0 ? (
              <div className="history-list">
                {history.map((session, index) => (
                  <div key={index} className="history-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span className="history-date">{formatDate(session.date)}</span>
                    </div>
                    <span className="history-dur">{session.duration} mins</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '1.5rem', 
                color: 'var(--text-muted)', 
                fontSize: '0.85rem',
                border: '1px dashed var(--card-border)',
                borderRadius: '12px'
              }}>
                No sessions logged yet. Take your first steps to mindfulness!
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
