import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, Bell, HelpCircle, Heart, X, CheckCircle, SkipForward, Clock, ChevronUp, ChevronDown, Wind } from 'lucide-react';
import audioEngine from '../services/AudioEngine';
import confetti from 'canvas-confetti';

const PRESETS = [
  { label: '2m', value: 2 },
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
];

export default function BoxBreathing({ onSessionComplete }) {
  // Breathing Phase Configurations (Seconds)
  const [inhaleTime, setInhaleTime] = useState(4);
  const [holdInTime, setHoldInTime] = useState(4);
  const [exhaleTime, setExhaleTime] = useState(4);
  const [holdOutTime, setHoldOutTime] = useState(4);

  // Session Duration (overall)
  const [duration, setDuration] = useState(5 * 60); // Default 5 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  // Active Breathing State
  const [currentPhase, setCurrentPhase] = useState('inhale'); // 'inhale', 'holdIn', 'exhale', 'holdOut'
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(4);

  // Audio Configs
  const [startSound, setStartSound] = useState('bowl');
  const [endSound, setEndSound] = useState('gong');
  const [transitionSound, setTransitionSound] = useState('chime'); // 'chime', 'bowl', 'gong', 'none'
  const [ambientSound, setAmbientSound] = useState('none'); // 'none', 'rain', 'ocean', 'forest'
  const [ambientVolume, setAmbientVolume] = useState(0.5);

  // Animation state (Dynamic scaling & transitions)
  const [currentScale, setCurrentScale] = useState(0.85);
  const [transitionDuration, setTransitionDuration] = useState(0.5);

  // References
  const timerRef = useRef(null);

  // Circular progress maths
  const strokeRadius = 150;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (timeLeft / duration) * strokeCircumference;

  // Sync phase changes with the circular visual guide scaling
  useEffect(() => {
    if (!isRunning) {
      setCurrentScale(0.85);
      setTransitionDuration(0.5);
      return;
    }

    if (currentPhase === 'inhale') {
      setCurrentScale(1.35);
      setTransitionDuration(inhaleTime);
    } else if (currentPhase === 'holdIn') {
      setCurrentScale(1.35);
      setTransitionDuration(0.1);
    } else if (currentPhase === 'exhale') {
      setCurrentScale(0.85);
      setTransitionDuration(exhaleTime);
    } else if (currentPhase === 'holdOut') {
      setCurrentScale(0.85);
      setTransitionDuration(0.1);
    }
  }, [currentPhase, isRunning, inhaleTime, exhaleTime]);

  // Adjust ambient volume dynamically
  useEffect(() => {
    if (isRunning && ambientSound !== 'none') {
      audioEngine.setAmbientVolume(ambientVolume);
    }
  }, [ambientVolume, isRunning, ambientSound]);

  // Manage ambient sound play/pause on state switch
  useEffect(() => {
    if (isRunning) {
      if (ambientSound !== 'none') {
        audioEngine.startAmbient(ambientSound, ambientVolume);
      }
    } else {
      audioEngine.stopAmbient();
    }
  }, [isRunning, ambientSound]);

  // Clean up audio loops on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopAmbient();
    };
  }, []);

  // Main ticking timer engine
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        // 1. Decrement overall session timer
        let completed = false;
        setTimeLeft((prev) => {
          if (prev <= 1) {
            completed = true;
            return 0;
          }
          return prev - 1;
        });

        if (completed) {
          handleTimerComplete();
          return;
        }

        // 2. Decrement current phase seconds
        setPhaseTimeLeft((prevPhaseSecs) => {
          if (prevPhaseSecs <= 1) {
            // Determine the next active phase
            let nextPhase = 'inhale';
            let nextDuration = inhaleTime;

            if (currentPhase === 'inhale') {
              if (holdInTime > 0) {
                nextPhase = 'holdIn';
                nextDuration = holdInTime;
              } else {
                nextPhase = 'exhale';
                nextDuration = exhaleTime;
              }
            } else if (currentPhase === 'holdIn') {
              nextPhase = 'exhale';
              nextDuration = exhaleTime;
            } else if (currentPhase === 'exhale') {
              if (holdOutTime > 0) {
                nextPhase = 'holdOut';
                nextDuration = holdOutTime;
              } else {
                nextPhase = 'inhale';
                nextDuration = inhaleTime;
              }
            } else if (currentPhase === 'holdOut') {
              nextPhase = 'inhale';
              nextDuration = inhaleTime;
            }

            setCurrentPhase(nextPhase);

            // Play transition sound alert if enabled
            if (transitionSound !== 'none') {
              audioEngine.playAlert(transitionSound);
            }

            return nextDuration;
          }

          return prevPhaseSecs - 1;
        });

      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, currentPhase, inhaleTime, holdInTime, exhaleTime, holdOutTime, transitionSound]);

  // Duration select preset handler
  const handlePresetSelect = (mins) => {
    if (isRunning) return;
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
    setCustomMinutes('');
  };

  const handleCustomMinutesChange = (e) => {
    if (isRunning) return;
    const val = e.target.value;
    setCustomMinutes(val);
    const mins = parseInt(val, 10);
    if (mins && mins > 0) {
      setDuration(mins * 60);
      setTimeLeft(mins * 60);
    }
  };

  const handleStart = () => {
    audioEngine.init();

    // Reset phase if starting fresh from the beginning
    if (timeLeft === duration) {
      setCurrentPhase('inhale');
      setPhaseTimeLeft(inhaleTime);
      audioEngine.playAlert(startSound);
    }

    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    audioEngine.stopAmbient();
    setTimeLeft(duration);
    setCurrentPhase('inhale');
    setPhaseTimeLeft(inhaleTime);
    setIsCompleted(false);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    audioEngine.stopAmbient();

    // Play ending bell
    if (endSound !== 'none') {
      audioEngine.playAlert(endSound);
    }

    // Canvas Confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#18d2bc', '#a855f7', '#0ea5e9', '#ffffff']
    });

    setIsCompleted(true);

    // Save completed stats to App state (round to nearest minute)
    const minutesCompleted = Math.max(1, Math.round(duration / 60));
    onSessionComplete(minutesCompleted);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Stepper adjustment buttons
  const adjustInhale = (amt) => {
    if (isRunning) return;
    setInhaleTime(prev => {
      const val = Math.max(1, Math.min(prev + amt, 20));
      if (currentPhase === 'inhale') setPhaseTimeLeft(val);
      return val;
    });
  };

  const adjustHoldIn = (amt) => {
    if (isRunning) return;
    setHoldInTime(prev => {
      const val = Math.max(0, Math.min(prev + amt, 20));
      if (currentPhase === 'holdIn') setPhaseTimeLeft(val);
      return val;
    });
  };

  const adjustExhale = (amt) => {
    if (isRunning) return;
    setExhaleTime(prev => {
      const val = Math.max(1, Math.min(prev + amt, 20));
      if (currentPhase === 'exhale') setPhaseTimeLeft(val);
      return val;
    });
  };

  const adjustHoldOut = (amt) => {
    if (isRunning) return;
    setHoldOutTime(prev => {
      const val = Math.max(0, Math.min(prev + amt, 20));
      if (currentPhase === 'holdOut') setPhaseTimeLeft(val);
      return val;
    });
  };

  // Fetch active phase specs
  const getPhaseDetails = (phase) => {
    if (!isRunning) {
      return {
        text: 'Ready 🌬️',
        color: 'var(--accent)',
        bg: 'radial-gradient(circle, hsla(var(--accent-rgb), 0.25) 0%, hsla(var(--accent-rgb), 0.02) 70%)',
        glow: '0 0 25px hsla(var(--accent-rgb), 0.25)'
      };
    }
    switch (phase) {
      case 'inhale':
        return {
          text: 'Breathe In... 🌬️',
          color: 'var(--accent)',
          bg: 'radial-gradient(circle, hsla(172, 90%, 46%, 0.35) 0%, hsla(172, 90%, 46%, 0.05) 70%)',
          glow: '0 0 35px hsla(172, 90%, 46%, 0.45)'
        };
      case 'holdIn':
        return {
          text: 'Hold Breath... 🧘',
          color: '#a855f7',
          bg: 'radial-gradient(circle, hsla(270, 85%, 60%, 0.35) 0%, hsla(270, 85%, 60%, 0.05) 70%)',
          glow: '0 0 35px hsla(270, 85%, 60%, 0.45)'
        };
      case 'exhale':
        return {
          text: 'Breathe Out... 🍃',
          color: '#0ea5e9',
          bg: 'radial-gradient(circle, hsla(199, 89%, 48%, 0.35) 0%, hsla(199, 89%, 48%, 0.05) 70%)',
          glow: '0 0 35px hsla(199, 89%, 48%, 0.45)'
        };
      case 'holdOut':
        return {
          text: 'Hold Empty... 🤫',
          color: '#94a3b8',
          bg: 'radial-gradient(circle, hsla(215, 16%, 45%, 0.25) 0%, hsla(215, 16%, 45%, 0.02) 70%)',
          glow: '0 0 25px hsla(215, 16%, 45%, 0.35)'
        };
      default:
        return {
          text: 'Breathe',
          color: 'var(--accent)',
          bg: 'radial-gradient(circle, hsla(var(--accent-rgb), 0.25) 0%, hsla(var(--accent-rgb), 0.02) 70%)',
          glow: 'none'
        };
    }
  };

  const phaseDetails = getPhaseDetails(currentPhase);

  return (
    <div className="timer-layout">
      {/* Visual Timer ring card */}
      <div className="glass-panel timer-display-section">
        {isCompleted && (
          <div className="complete-overlay">
            <div className="complete-icon" style={{ background: 'var(--accent-gradient)' }}>
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>
            <h3 className="complete-title">Stillness Achieved</h3>
            <p className="complete-desc">
              You completed {Math.round(duration / 60)} minutes of calming box breathing exercises.
            </p>
            <button className="btn btn-primary" onClick={handleReset}>
              Continue
            </button>
          </div>
        )}

        <div className="timer-circle-container">
          <svg className="timer-svg" viewBox="0 0 320 320">
            <circle
              className="timer-ring-bg"
              cx="160"
              cy="160"
              r={strokeRadius}
            />
            <circle
              className="timer-ring-progress"
              cx="160"
              cy="160"
              r={strokeRadius}
              strokeDasharray={strokeCircumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                stroke: phaseDetails.color,
                transition: 'stroke 0.5s ease, stroke-dashoffset 0.1s linear'
              }}
            />
          </svg>

          {/* Calming Breathing guide circle */}
          <div 
            className="breathe-circle"
            style={{
              transform: `scale(${currentScale})`,
              transition: `transform ${transitionDuration}s linear, background 0.5s ease, box-shadow 0.5s ease`,
              background: phaseDetails.bg,
              boxShadow: phaseDetails.glow
            }}
          >
            <span className="time-number">{formatTime(timeLeft)}</span>
            <span className="breathe-text" style={{ color: phaseDetails.color }}>
              {phaseDetails.text}
            </span>
            {isRunning && (
              <span style={{ 
                fontSize: '1.75rem', 
                fontWeight: '800', 
                color: phaseDetails.color, 
                marginTop: '0.25rem',
                fontFamily: 'var(--font-heading)'
              }}>
                {phaseTimeLeft}s
              </span>
            )}
          </div>
        </div>

        {/* Play / Pause controls panel */}
        <div className="timer-controls">
          {isRunning ? (
            <button 
              className="btn btn-secondary btn-circle" 
              onClick={handlePause}
              aria-label="Pause box breathing session"
            >
              <Pause size={22} fill="currentColor" />
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-circle" 
              onClick={handleStart}
              aria-label="Start box breathing session"
            >
              <Play size={22} fill="currentColor" style={{ marginLeft: '4px' }} />
            </button>
          )}

          {(timeLeft < duration || isCompleted) && (
            <button 
              className="btn btn-danger btn-circle" 
              onClick={handleReset}
              aria-label="Reset box breathing session"
            >
              <RotateCcw size={20} />
            </button>
          )}

          {isRunning && (
            <button
              className="btn btn-secondary btn-circle"
              onClick={handleTimerComplete}
              title="End session early and save stats"
              aria-label="Skip breathing session"
            >
              <SkipForward size={20} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Heart size={14} fill="var(--danger)" stroke="none" />
          <span>Box breathing aligns focus, balances energy, and settles the nerves.</span>
        </div>
      </div>

      {/* Settings Panel column */}
      <div className="timer-settings-section">
        {/* Step custom durations config */}
        <div className="glass-panel settings-card">
          <h4 className="settings-card-title">
            <Wind size={18} className="text-accent" />
            <span>Customize Breath Phases</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            {/* Inhale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>1. Inhale</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={() => adjustInhale(-1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronDown size={16} />
                </button>
                <span style={{ width: '2rem', textAlign: 'center', fontWeight: 800 }}>{inhaleTime}s</span>
                <button 
                  onClick={() => adjustInhale(1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>

            {/* Hold after Inhale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>2. Hold In (Stop)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={() => adjustHoldIn(-1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronDown size={16} />
                </button>
                <span style={{ width: '2rem', textAlign: 'center', fontWeight: 800 }}>{holdInTime}s</span>
                <button 
                  onClick={() => adjustHoldIn(1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>

            {/* Exhale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>3. Exhale</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={() => adjustExhale(-1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronDown size={16} />
                </button>
                <span style={{ width: '2rem', textAlign: 'center', fontWeight: 800 }}>{exhaleTime}s</span>
                <button 
                  onClick={() => adjustExhale(1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>

            {/* Hold after Exhale */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>4. Hold Out (Stop)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={() => adjustHoldOut(-1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronDown size={16} />
                </button>
                <span style={{ width: '2rem', textAlign: 'center', fontWeight: 800 }}>{holdOutTime}s</span>
                <button 
                  onClick={() => adjustHoldOut(1)} 
                  disabled={isRunning}
                  className="btn btn-secondary" 
                  style={{ padding: '0.3rem 0.5rem', borderRadius: '8px' }}
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Duration configuration */}
        <div className="glass-panel settings-card">
          <h4 className="settings-card-title">
            <Clock size={18} className="text-accent" />
            <span>Session Duration</span>
          </h4>
          <div className="duration-grid">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`duration-opt ${duration === preset.value * 60 && !customMinutes ? 'selected' : ''}`}
                disabled={isRunning}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="custom-duration-input">
            <input
              type="number"
              value={customMinutes}
              onChange={handleCustomMinutesChange}
              disabled={isRunning}
              placeholder="Custom duration..."
              min="1"
              max="180"
              aria-label="Custom duration in minutes"
            />
            <span>mins</span>
          </div>
        </div>

        {/* Bell acoustics settings */}
        <div className="glass-panel settings-card">
          <h4 className="settings-card-title">
            <Bell size={18} className="text-accent" />
            <span>Acoustics & Bells</span>
          </h4>

          <div className="control-row">
            <label htmlFor="start-bell-select">Starting Bell</label>
            <select
              id="start-bell-select"
              value={startSound}
              onChange={(e) => setStartSound(e.target.value)}
              disabled={isRunning}
              className="select-control"
            >
              <option value="bowl">Tibetan Singing Bowl</option>
              <option value="gong">Meditation Gong</option>
              <option value="chime">Soft Wind Chime</option>
              <option value="none">No starting bell</option>
            </select>
          </div>

          <div className="control-row">
            <label htmlFor="end-bell-select">Ending Bell</label>
            <select
              id="end-bell-select"
              value={endSound}
              onChange={(e) => setEndSound(e.target.value)}
              disabled={isRunning}
              className="select-control"
            >
              <option value="gong">Meditation Gong</option>
              <option value="bowl">Tibetan Singing Bowl</option>
              <option value="chime">Soft Wind Chime</option>
              <option value="none">No ending bell</option>
            </select>
          </div>

          <div className="control-row">
            <label htmlFor="transition-bell-select">Phase Transition Sound</label>
            <select
              id="transition-bell-select"
              value={transitionSound}
              onChange={(e) => setTransitionSound(e.target.value)}
              disabled={isRunning}
              className="select-control"
            >
              <option value="chime">Wind Chime Tick</option>
              <option value="bowl">Bowl Resonance</option>
              <option value="gong">Short Gong</option>
              <option value="none">Silence (None)</option>
            </select>
          </div>
        </div>

        {/* Ambient environmental audio soundscapes */}
        <div className="glass-panel settings-card">
          <h4 className="settings-card-title">
            <Music size={18} className="text-accent" />
            <span>Ambient Environments</span>
          </h4>

          <div className="control-row">
            <label htmlFor="ambient-noise-select">Background Soundscape</label>
            <select
              id="ambient-noise-select"
              value={ambientSound}
              onChange={(e) => setAmbientSound(e.target.value)}
              className="select-control"
            >
              <option value="none">Silence (None)</option>
              <option value="rain">Deep Autumn Rain</option>
              <option value="ocean">Rolling Ocean Waves</option>
              <option value="forest">Enchanted Forest Drone</option>
            </select>
          </div>

          {ambientSound !== 'none' && (
            <div className="control-row ambient-controls" style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span htmlFor="ambient-volume-slider" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Volume</span>
                <span style={{ color: 'var(--accent)' }}>{Math.round(ambientVolume * 100)}%</span>
              </div>
              <div className="volume-slider-container">
                <Volume2 size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  id="ambient-volume-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  aria-label="Ambient volume"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
