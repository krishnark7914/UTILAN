import React, { useState } from 'react';
import { Plus, Check, Trash2, Clock, Pill } from 'lucide-react';

export default function TabletsTracker({
  tablets = [],
  onToggleTake,
  onAddTablet,
  onDeleteTablet
}) {
  // State Management for Add Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [newTabDose, setNewTabDose] = useState('1 pill');

  const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

  // Add a new tablet
  const handleAddTabletSubmit = (e) => {
    e.preventDefault();
    if (!newTabName.trim()) return;

    onAddTablet(newTabName.trim(), newTabDose.trim() || '1 pill');
    
    setNewTabName('');
    setNewTabDose('1 pill');
    setIsFormOpen(false);
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%' }}>
      
      {/* Unified tablets checklist glass card */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', minHeight: '300px' }}>
        
        {/* Header containing title and Plus trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.8rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Pill size={18} className="text-accent" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Checklist</span>
          </div>
          
          <button 
            onClick={() => setIsFormOpen(true)}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              border: 'none', 
              background: 'var(--accent-light)', 
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 10px hsla(var(--accent-rgb), 0.15)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--accent-light)';
              e.currentTarget.style.color = 'var(--accent)';
            }}
            title="Add tablet"
            aria-label="Add tablet"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Medication checklist items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tablets.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--card-border)', borderRadius: '14px' }}>
              No tablets registered. Tap the "+" button above to add your first supplement!
            </div>
          ) : (
            tablets.map((tab) => {
              const todayLog = tab.takenLogs ? tab.takenLogs.find(log => log.date === todayStr) : null;
              const isTaken = !!todayLog;

              return (
                <div 
                  key={tab.id}
                  onClick={() => onToggleTake(tab.id)}
                  className={`pill-card ${isTaken ? 'taken' : ''} ${!isTaken ? 'active-pulse' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, minWidth: 0 }}>
                    
                    {/* Glowing Pill Icon badge on Left */}
                    <div className="pill-icon-badge">
                      <Pill 
                        size={18} 
                        style={{ 
                          transform: isTaken ? 'rotate(45deg)' : 'none', 
                          transition: 'transform 0.4s ease' 
                        }} 
                      />
                    </div>

                    {/* Pill info (Name & Dosage) */}
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.92rem',
                        textDecoration: isTaken ? 'line-through' : 'none',
                        color: isTaken ? 'var(--text-muted)' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {tab.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {tab.dosage}
                      </span>
                    </div>
                  </div>

                  {/* Checkbox badge or delete button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    {isTaken && todayLog && (
                      <span className="clock-badge">
                        <Clock size={11} />
                        <span>{todayLog.time}</span>
                      </span>
                    )}
                    
                    {/* Custom Circular Checkbox */}
                    <div className="circular-checkbox">
                      {isTaken && <Check size={12} strokeWidth={3} />}
                    </div>

                    {/* Direct safe delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTablet(tab.id);
                      }}
                      className="delete-btn-circle"
                      title="Delete supplement"
                      aria-label="Delete tablet"
                      style={{ marginLeft: '0.25rem' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Slide-up bottom sheet modal (Renders conditionally for adding tablet) */}
      {isFormOpen && (
        <>
          {/* Backdrop for mobile slide-up bottom sheet */}
          <div 
            className="bottom-sheet-backdrop"
            onClick={() => setIsFormOpen(false)}
          />
          
          {/* Add Tablet Form (Bottom sheet style) */}
          <div className="bottom-sheet">
            <div className="bottom-sheet-drag-handle" />
            
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: 800 }}>
              <Plus size={18} className="text-accent" />
              <span>Add Supplement</span>
            </h4>
            
            <form onSubmit={handleAddTabletSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Tablet Name Input */}
              <div className="glowing-input-container">
                <label htmlFor="tablet-name">Supplement Name</label>
                <input
                  id="tablet-name"
                  type="text"
                  required
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder="e.g. Vitamin C, Omega-3, Zinc"
                  className="glowing-input"
                  autoFocus
                />
              </div>

              {/* Dosage Input */}
              <div className="glowing-input-container">
                <label htmlFor="tablet-dosage">Dosage Description</label>
                <input
                  id="tablet-dosage"
                  type="text"
                  value={newTabDose}
                  onChange={(e) => setNewTabDose(e.target.value)}
                  placeholder="e.g. 1 pill, 500mg, 2 capsules"
                  className="glowing-input"
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.55rem', fontSize: '0.8rem', justifyContent: 'center' }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </>
      )}

    </div>
  );
}

