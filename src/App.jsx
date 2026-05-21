import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProfileDrawer from './components/ProfileDrawer';
import MeditationTimer from './views/MeditationTimer';
import BoxBreathing from './views/BoxBreathing';
import TabletsTracker from './views/TabletsTracker';
import audioEngine from './services/AudioEngine';
import { 
  auth, 
  isFirebaseEnabled, 
  registerUser, 
  loginUser, 
  logoutUser, 
  saveUserData, 
  subscribeUserData 
} from './services/firebase';

const DEFAULT_TABLETS = [
  { id: '1', name: 'Daily Multivitamin', dosage: '1 tablet', takenLogs: [] },
  { id: '2', name: 'Omega-3 Fish Oil', dosage: '1 capsule', takenLogs: [] },
  { id: '3', name: 'Vitamin D3', dosage: '1000 IU', takenLogs: [] },
];

export default function App() {
  // Navigation & Theme State
  const [currentTab, setCurrentTab] = useState('meditation');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('utilan_theme') || localStorage.getItem('utily_theme') || 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(null);

  // User Settings State
  const [userSettings, setUserSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('utilan_settings') || localStorage.getItem('utily_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            name: parsed.name || 'Zen Explorer',
            dailyGoal: parsed.dailyGoal || 10,
            avatar: parsed.avatar || '🧘'
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
    return {
      name: 'Zen Explorer',
      dailyGoal: 10,
      avatar: '🧘'
    };
  });

  // User Stats State
  const [userStats, setUserStats] = useState(() => {
    try {
      const saved = localStorage.getItem('utilan_stats') || localStorage.getItem('utily_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            totalSessions: parsed.totalSessions || 0,
            totalMinutes: parsed.totalMinutes || 0,
            currentStreak: parsed.currentStreak || 0,
            longestStreak: parsed.longestStreak || 0,
            lastMeditationDate: parsed.lastMeditationDate || null,
            history: Array.isArray(parsed.history) ? parsed.history : []
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse stats", e);
    }
    return {
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastMeditationDate: null,
      history: []
    };
  });

  // Tablets State (Lifting State Up)
  const [tablets, setTablets] = useState(() => {
    try {
      const saved = localStorage.getItem('utilan_tablets') || localStorage.getItem('utily_tablets');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(tab => ({
            ...tab,
            takenLogs: Array.isArray(tab.takenLogs) ? tab.takenLogs : []
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse tablets", e);
    }
    return DEFAULT_TABLETS;
  });

  // Sync theme with HTML document attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('utilan_theme', theme);
  }, [theme]);

  // Sync settings locally
  useEffect(() => {
    localStorage.setItem('utilan_settings', JSON.stringify(userSettings));
  }, [userSettings]);

  // Sync stats locally
  useEffect(() => {
    localStorage.setItem('utilan_stats', JSON.stringify(userStats));
  }, [userStats]);

  // Sync tablets locally
  useEffect(() => {
    localStorage.setItem('utilan_tablets', JSON.stringify(tablets));
  }, [tablets]);

  // Firebase Auth and Firestore Real-Time Listener
  useEffect(() => {
    if (!isFirebaseEnabled) return;

    let unsubscribeDoc = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Subscribe to real-time user data updates from Firestore
        unsubscribeDoc = subscribeUserData(user.uid, (data) => {
          if (data) {
            if (data.settings) setUserSettings(data.settings);
            if (data.stats) setUserStats(data.stats);
            if (data.tablets) setTablets(data.tablets);
          } else {
            // Document doesn't exist yet, populate with active local state
            saveUserData(user.uid, {
              settings: userSettings,
              stats: userStats,
              tablets: tablets
            });
          }
        });
      } else {
        setCurrentUser(null);
        unsubscribeDoc();
        // Restore local storage guest data when logged out
        try {
          const savedSettings = localStorage.getItem('utilan_settings') || localStorage.getItem('utily_settings');
          if (savedSettings) setUserSettings(JSON.parse(savedSettings));

          const savedStats = localStorage.getItem('utilan_stats') || localStorage.getItem('utily_stats');
          if (savedStats) setUserStats(JSON.parse(savedStats));

          const savedTablets = localStorage.getItem('utilan_tablets') || localStorage.getItem('utily_tablets');
          if (savedTablets) setTablets(JSON.parse(savedTablets));
        } catch (e) {
          console.error("Error restoring guest data from localStorage:", e);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeDoc();
    };
  }, []);

  // Update settings handler
  const handleUpdateSettings = (newSettings) => {
    setUserSettings(newSettings);
    if (currentUser) {
      saveUserData(currentUser.uid, { settings: newSettings });
    }
  };

  // Streak verification on mount
  useEffect(() => {
    if (userStats && userStats.lastMeditationDate) {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const lastDate = new Date(userStats.lastMeditationDate);
        lastDate.setHours(0, 0, 0, 0);

        const diffTime = Math.abs(today - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // If more than 1 day difference (i.e. missed yesterday), reset streak
        if (diffDays > 1) {
          setUserStats(prev => {
            if (!prev) return prev;
            const updated = { ...prev, currentStreak: 0 };
            if (currentUser) {
              saveUserData(currentUser.uid, { stats: updated });
            }
            return updated;
          });
        }
      } catch (e) {
        console.error("Streak calculation failed", e);
      }
    }
  }, [userStats?.lastMeditationDate, currentUser]);

  // Update stats upon session completion
  const handleSessionComplete = (minutes) => {
    setUserStats(prev => {
      const todayStr = new Date().toLocaleDateString('sv');
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toLocaleDateString('sv');

      const safePrev = prev || {
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastMeditationDate: null,
        history: []
      };

      let newStreak = safePrev.currentStreak || 0;

      if (!safePrev.lastMeditationDate) {
        newStreak = 1;
      } else if (safePrev.lastMeditationDate === yesterdayStr) {
        newStreak = (safePrev.currentStreak || 0) + 1;
      } else if (safePrev.lastMeditationDate !== todayStr) {
        newStreak = 1;
      }

      const newLongest = Math.max(safePrev.longestStreak || 0, newStreak);
      const newHistory = [
        { date: new Date().toISOString(), duration: minutes },
        ...(safePrev.history || [])
      ];

      const updated = {
        totalSessions: (safePrev.totalSessions || 0) + 1,
        totalMinutes: (safePrev.totalMinutes || 0) + minutes,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastMeditationDate: todayStr,
        history: newHistory
      };

      if (currentUser) {
        saveUserData(currentUser.uid, { stats: updated });
      }
      return updated;
    });
  };

  // Tablets event handlers
  const handleToggleTakeTablet = (id) => {
    audioEngine.init();
    const todayStr = new Date().toLocaleDateString('sv');

    setTablets(prev => {
      const nextTablets = prev.map(tab => {
        if (tab.id === id) {
          const alreadyTaken = tab.takenLogs.some(log => log.date === todayStr);
          let updatedLogs;
          if (alreadyTaken) {
            updatedLogs = tab.takenLogs.filter(log => log.date !== todayStr);
          } else {
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            updatedLogs = [...tab.takenLogs, { date: todayStr, time: timeStr }];
            audioEngine.playAlert('chime');
          }
          return { ...tab, takenLogs: updatedLogs };
        }
        return tab;
      });

      // Confetti trigger if all checked
      const total = nextTablets.length;
      const taken = nextTablets.filter(tab => tab.takenLogs.some(log => log.date === todayStr)).length;
      if (total > 0 && taken === total) {
        try {
          confetti({
            particleCount: 100,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#18d2bc', '#12b5e5', '#ffc107', '#ff1a5c']
          });
        } catch (e) {
          console.error("Confetti trigger failed", e);
        }
      }

      if (currentUser) {
        saveUserData(currentUser.uid, { tablets: nextTablets });
      }
      return nextTablets;
    });
  };

  const handleAddTablet = (name, dosage) => {
    audioEngine.init();
    audioEngine.playAlert('chime');

    const newTabObj = {
      id: Date.now().toString(),
      name,
      dosage,
      takenLogs: []
    };

    setTablets(prev => {
      const nextTablets = [...prev, newTabObj];
      if (currentUser) {
        saveUserData(currentUser.uid, { tablets: nextTablets });
      }
      return nextTablets;
    });
  };

  const handleDeleteTablet = (id) => {
    setTablets(prev => {
      const nextTablets = prev.filter(tab => tab.id !== id);
      if (currentUser) {
        saveUserData(currentUser.uid, { tablets: nextTablets });
      }
      return nextTablets;
    });
  };

  // Determine Title of Current view
  const getViewTitle = () => {
    switch (currentTab) {
      case 'meditation':
        return 'Meditation Timer';
      case 'breathwork':
        return 'Box Breathing';
      case 'tablets':
        return 'Tablets Tracker';
      case 'schedule':
        return 'Daily Planner';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        theme={theme} 
        setTheme={setTheme}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Panel Content Area */}
      <div className="main-wrapper">
        <Header 
          title={getViewTitle()} 
          userStats={userStats}
          userSettings={userSettings}
          onProfileClick={() => setIsProfileOpen(true)}
          onMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
        />

        <main className="content-area">
          {currentTab === 'meditation' && (
            <MeditationTimer onSessionComplete={handleSessionComplete} />
          )}
          {currentTab === 'breathwork' && (
            <BoxBreathing onSessionComplete={handleSessionComplete} />
          )}
          {currentTab === 'tablets' && (
            <TabletsTracker 
              tablets={tablets}
              onToggleTake={handleToggleTakeTablet}
              onAddTablet={handleAddTablet}
              onDeleteTablet={handleDeleteTablet}
            />
          )}
        </main>
      </div>

      {/* Profile drawer slider */}
      <ProfileDrawer 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        userStats={userStats}
        userSettings={userSettings}
        onUpdateSettings={handleUpdateSettings}
        currentUser={currentUser}
        onRegister={registerUser}
        onLogin={loginUser}
        onLogout={logoutUser}
      />
    </div>
  );
}
