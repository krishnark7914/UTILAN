import React from 'react';
import { Timer, Wind, Pill, Calendar, Moon, Sun, Settings } from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  setTheme, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) {
  const menuItems = [
    { id: 'meditation', label: 'Meditation Timer', icon: Timer, enabled: true },
    { id: 'breathwork', label: 'Box Breathing', icon: Wind, enabled: true },
    { id: 'tablets', label: 'Tablets Tracker', icon: Pill, enabled: true },
    { id: 'schedule', label: 'Daily Planner', icon: Calendar, enabled: false },
  ];

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile Menu Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Timer size={22} strokeWidth={2.5} />
          </div>
          <span className="logo-text">UTILAN</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li 
                  key={item.id} 
                  className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
                  style={{ opacity: item.enabled ? 1 : 0.6 }}
                >
                  <button
                    onClick={() => {
                      if (item.enabled) {
                        setCurrentTab(item.id);
                        setIsMobileMenuOpen(false);
                      }
                    }}
                    disabled={!item.enabled}
                    title={!item.enabled ? "Coming Soon in next update!" : ""}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {!item.enabled && (
                      <span style={{ 
                        fontSize: '0.65rem', 
                        padding: '0.15rem 0.4rem', 
                        background: 'var(--card-border)', 
                        color: 'var(--text-muted)', 
                        borderRadius: '6px',
                        marginLeft: 'auto'
                      }}>Soon</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </span>
            <div className="toggle-switch">
              <div className="toggle-handle"></div>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
