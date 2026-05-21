import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Music, Bell, HelpCircle, Heart, X, CheckCircle, SkipForward, Clock } from 'lucide-react';
import audioEngine from '../services/AudioEngine';
import confetti from 'canvas-confetti';

const PRESETS = [
  { label: '5m', value: 5 },
  { label: '10m', value: 10 },
  { label: '15m', value: 15 },
  { label: '20m', value: 20 },
  { label: '30m', value: 30 },
];

export default function MeditationTimer({ onSessionComplete }) {
  // Timer States
  const [duration, setDuration] = useState(10 * 60); // Default 10 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');

  // Audio Configs
  const [startSound, setStartSound] = useState('bowl');
  const [endSound, setEndSound] = useState('gong');
  const [intervalTime, setIntervalTime] = useState('none'); // 'none', '1', '2', '3', '5' (minutes)
  const [intervalSound, setIntervalSound] = useState('chime');
  const [ambientSound, setAmbientSound] = useState('none'); // 'none', 'rain', 'ocean', 'forest'
  const [ambientVolume, setAmbientVolume] = useState(0.5);

  // References
  const timerRef = useRef(null);
  const lastIntervalTriggeredRef = useRef(0);

  // Circular progress maths
  const strokeRadius = 150;
  const strokeCircumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = strokeCircumference - (timeLeft / duration) * strokeCircumference;

  // Handle duration selection
  const handlePresetSelect = (mins) => {
    if (isRunning) return;
    setDuration(mins * 60);
    setTimeLeft(mins * 60);
    setCustomMinutes('');
    lastIntervalTriggeredRef.current = 0;
  };

  const handleCustomMinutesChange = (e) => {
    if (isRunning) return;
    const val = e.target.value;
    setCustomMinutes(val);
    const mins = parseInt(val, 10);
    if (mins && mins > 0) {
      setDuration(mins * 60);
      setTimeLeft(mins * 60);
      lastIntervalTriggeredRef.current = 0;
    }
  };

  // Manage timer ticking
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer Complete
            handleTimerComplete();
            return 0;
          }

          const newTimeLeft = prev - 1;
          const elapsedSeconds = duration - newTimeLeft;

          // Interval Check
          if (intervalTime !== 'none') {
            const intervalSec = parseInt(intervalTime, 10) * 60;
            if (elapsedSeconds > 0 && elapsedSeconds % intervalSec === 0 && elapsedSeconds !== lastIntervalTriggeredRef.current) {
              lastIntervalTriggeredRef.current = elapsedSeconds;
              // Play Interval Sound alert
              audioEngine.playAlert(intervalSound);
            }
          }

          return newTimeLeft;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, duration, intervalTime, intervalSound]);

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

  const handleStart = () => {
    audioEngine.init();
    
    // Play start chime if timer is starting from the beginning
    if (timeLeft === duration) {
      audioEngine.playAlert(startSound);
      lastIntervalTriggeredRef.current = 0;
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
    setIsCompleted(false);
    lastIntervalTriggeredRef.current = 0;
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    audioEngine.stopAmbient();
    
    // Play end sound
    audioEngine.playAlert(endSound);
    
    // Trigger celebration confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#18d2bc', '#1e90ff', '#ffffff']
    });

    setIsCompleted(true);
    
    // Save details to parent
    const minutesCompleted = Math.round(duration / 60);
    onSessionComplete(minutesCompleted);
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Breathing Visualizer State
  // 4s Inhale, 4s Hold, 4s Exhale (12s total cycle)
  const elapsed = duration - timeLeft;
  const breatheCycle = elapsed % 12;
  let breathePhase = 'inhale';
  let breatheText = 'Inhale';
  
  if (!isRunning) {
    breathePhase = 'idle';
    breatheText = 'Ready';
  } else if (breatheCycle < 4) {
    breathePhase = 'inhale';
    breatheText = 'Inhale... 🌬️';
  } else if (breatheCycle < 8) {
    breathePhase = 'hold';
    breatheText = 'Hold... 🧘';
  } else {
    breathePhase = 'exhale';
    breatheText = 'Exhale... 🍃';
  }

  return (
    <div className="timer-layout">
      {/* Visual Timer circle card */}
      <div className="glass-panel timer-display-section">
        {isCompleted && (
          <div className="complete-overlay">
            <div className="complete-icon">
              <CheckCircle size={40} strokeWidth={2.5} />
            </div>
            <h3 className="complete-title">Peace Attained</h3>
            <p className="complete-desc">
              You completed {Math.round(duration / 60)} minutes of silent mindfulness.
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
            />
          </svg>

          {/* Breathing Guide Core */}
          <div className={`breathe-circle ${breathePhase}`}>
            <span className="time-number">{formatTime(timeLeft)}</span>
            {isRunning && <span className="breathe-text">{breatheText}</span>}
          </div>
        </div>

        {/* Play/Pause control panel */}
        <div className="timer-controls">
          {isRunning ? (
            <button 
              className="btn btn-secondary btn-circle" 
              onClick={handlePause}
              aria-label="Pause session"
            >
              <Pause size={22} fill="currentColor" />
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-circle" 
              onClick={handleStart}
              aria-label="Start session"
            >
              <Play size={22} fill="currentColor" style={{ marginLeft: '4px' }} />
            </button>
          )}

          {(timeLeft < duration || isCompleted) && (
            <button 
              className="btn btn-danger btn-circle" 
              onClick={handleReset}
              aria-label="Reset timer"
            >
              <RotateCcw size={20} />
            </button>
          )}

          {isRunning && (
            <button
              className="btn btn-secondary btn-circle"
              onClick={handleTimerComplete}
              title="End session early and save stats"
              aria-label="Skip session"
            >
              <SkipForward size={20} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <Heart size={14} fill="var(--danger)" stroke="none" />
          <span>Mindful breathing guides are calibrated to normal pace.</span>
        </div>
      </div>

      {/* Settings section cards */}
      <div className="timer-settings-section">
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

        {/* Sounds setting configuration */}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="control-row">
              <label htmlFor="interval-bell-select">Interval Bell</label>
              <select
                id="interval-bell-select"
                value={intervalTime}
                onChange={(e) => setIntervalTime(e.target.value)}
                disabled={isRunning}
                className="select-control"
              >
                <option value="none">None</option>
                <option value="1">Every 1 min</option>
                <option value="2">Every 2 mins</option>
                <option value="3">Every 3 mins</option>
                <option value="5">Every 5 mins</option>
              </select>
            </div>

            <div className="control-row">
              <label htmlFor="interval-type-select">Bell Tone</label>
              <select
                id="interval-type-select"
                value={intervalSound}
                onChange={(e) => setIntervalSound(e.target.value)}
                disabled={isRunning || intervalTime === 'none'}
                className="select-control"
              >
                <option value="chime">Wind Chime</option>
                <option value="bowl">Singing Bowl</option>
                <option value="gong">Gong</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ambient environment configuration */}
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
