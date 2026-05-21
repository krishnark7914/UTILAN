import React from 'react';
import { Menu, Flame } from 'lucide-react';

export default function Header({ 
  title, 
  userStats, 
  userSettings, 
  onProfileClick, 
  onMenuToggle 
}) {
  const currentStreak = userStats.currentStreak || 0;

  return (
    <header className="app-header">
      <div className="header-left">
        <button 
          className="mobile-toggle" 
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {title}
        </h2>
      </div>

      <div className="header-right">
        {currentStreak > 0 && (
          <div 
            className="streak-badge" 
            onClick={onProfileClick}
            title={`You're on a ${currentStreak} day streak! Keep it up!`}
          >
            <Flame size={16} fill="currentColor" />
            <span>{currentStreak} Day Streak</span>
          </div>
        )}

        <button 
          className="profile-avatar-trigger" 
          onClick={onProfileClick}
          aria-label="Open profile settings"
        >
          <span>{userSettings.avatar || '🧘'}</span>
        </button>
      </div>
    </header>
  );
}
