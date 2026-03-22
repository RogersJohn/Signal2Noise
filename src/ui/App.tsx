import React, { useState } from 'react';
import GameContainer from './game/GameContainer';

type AppMode = 'menu' | 'playing';

export default function App() {
  const [mode, setMode] = useState<AppMode>('menu');
  const [aiCount, setAICount] = useState(3);
  const [playerName, setPlayerName] = useState('Investigator');
  const [gameKey, setGameKey] = useState(0);

  const startGame = () => {
    setGameKey(k => k + 1);
    setMode('playing');
  };

  if (mode === 'menu') {
    return (
      <div style={styles.menuContainer}>
        <div style={styles.menuBox}>
          <h1 style={styles.title}>📡 SIGNAL TO NOISE</h1>
          <p style={styles.subtitle}>A Social Deduction Card Game</p>

          <div style={styles.field}>
            <label style={styles.label}>Your Name:</label>
            <input
              style={styles.input}
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>AI Opponents: {aiCount}</label>
            <input
              type="range"
              min={2}
              max={4}
              value={aiCount}
              onChange={e => setAICount(Number(e.target.value))}
              style={styles.slider}
            />
          </div>

          <button style={styles.playButton} onClick={startGame}>
            ▶ START GAME
          </button>

          <p style={styles.version}>v2.0</p>
        </div>
      </div>
    );
  }

  return (
    <GameContainer
      key={gameKey}
      playerName={playerName}
      aiCount={aiCount}
      onBack={() => setMode('menu')}
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  menuContainer: {
    background: '#0a0a0a', minHeight: '100vh', display: 'flex',
    justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace',
  },
  menuBox: {
    background: '#111', border: '1px solid #333', borderRadius: '8px',
    padding: '40px', textAlign: 'center', maxWidth: '400px',
  },
  title: { color: '#0f0', fontSize: '28px', margin: '0 0 4px' },
  subtitle: { color: '#888', fontSize: '14px', margin: '0 0 30px' },
  field: { marginBottom: '16px', textAlign: 'left' },
  label: { color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' },
  input: {
    background: '#1a1a2e', border: '1px solid #333', color: '#fff',
    fontFamily: 'monospace', fontSize: '14px', padding: '8px', width: '100%',
    boxSizing: 'border-box' as const, borderRadius: '4px',
  },
  slider: { width: '100%' },
  playButton: {
    background: '#0a3d0a', border: '2px solid #0f0', color: '#0f0',
    fontFamily: 'monospace', fontSize: '18px', padding: '12px 40px',
    cursor: 'pointer', borderRadius: '6px', marginTop: '12px',
  },
  version: { color: '#333', fontSize: '10px', marginTop: '20px' },
};
