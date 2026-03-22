import React, { useState, useReducer, useEffect, useRef } from 'react';
import { GameState, GameAction, GameConfig } from '../engine/types';
import { createGame, applyAction } from '../engine/engine';
import { STRATEGY_NAMES } from '../ai/strategies';
import { CONSPIRACIES } from '../data/conspiracies';
import { EVIDENCE_CARDS } from '../data/evidence';
import { createAdvancedAI, AdvancedAI } from '../ai/social/advancedAgent';
import { SOCIAL_PERSONALITY_NAMES } from '../ai/social/personalities';
import { Signal } from '../ai/social/types';
import { formatSignalDisplay } from '../ai/social/signalFlavor';
import GameView from './game/GameView';

type AppMode = 'menu' | 'playing';

function gameReducer(state: GameState, action: GameAction): GameState {
  try {
    return applyAction(state, action);
  } catch (e) {
    console.error('Invalid action:', action, e);
    return state;
  }
}

function pickRandomStrategies(count: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(STRATEGY_NAMES[Math.floor(Math.random() * STRATEGY_NAMES.length)]);
  }
  return result;
}

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

function pickRandomPersonalities(count: number): string[] {
  return Array.from({ length: count }, () =>
    SOCIAL_PERSONALITY_NAMES[Math.floor(Math.random() * SOCIAL_PERSONALITY_NAMES.length)]
  );
}

function GameContainer({ playerName, aiCount, onBack }: {
  playerName: string;
  aiCount: number;
  onBack: () => void;
}) {
  const aiStrategies = useRef(pickRandomStrategies(aiCount)).current;
  const aiPersonalities = useRef(pickRandomPersonalities(aiCount)).current;
  const names = [playerName, ...aiPersonalities.map((p, i) => `The ${p}`)];
  const config: GameConfig = {
    playerNames: names,
    humanPlayerIds: ['player_0'],
    aiStrategies: ['', ...aiStrategies],
  };

  const [state, dispatch] = useReducer(
    gameReducer,
    config,
    (cfg) => createGame(cfg, CONSPIRACIES, EVIDENCE_CARDS)
  );

  const aiTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const agentsRef = useRef<AdvancedAI[]>(
    aiStrategies.map((s, i) => createAdvancedAI(`player_${i + 1}`, s, aiPersonalities[i]))
  );
  const signalsRef = useRef<Signal[]>([]);
  const [signalDisplay, setSignalDisplay] = useState<string[]>([]);
  const [showSignals, setShowSignals] = useState(false);
  const signalsGenerated = useRef(false);

  const currentPlayerId = state.phase === 'COMMIT' || state.phase === 'BROADCAST'
    ? state.turnOrder[state.currentPlayerIndex]
    : undefined;
  const currentPlayer = currentPlayerId
    ? state.players.find(p => p.id === currentPlayerId)
    : undefined;
  const isAITurn = currentPlayer ? !currentPlayer.isHuman : false;

  // Generate signals when transitioning from COMMIT to BROADCAST
  useEffect(() => {
    if (state.phase === 'BROADCAST' && !signalsGenerated.current) {
      signalsGenerated.current = true;
      const signals: Signal[] = [];
      const displays: string[] = [];
      for (const agent of agentsRef.current) {
        const signal = agent.generateSignal(state);
        signals.push(signal);
        const conspiracy = state.activeConspiracies.find(c => c.card.id === signal.conspiracyId);
        const conspiracyName = conspiracy?.card.name ?? signal.conspiracyId;
        displays.push(formatSignalDisplay(signal, agent.personalityName, conspiracyName));
      }
      signalsRef.current = signals;
      setSignalDisplay(displays);
      setShowSignals(true);
      // Auto-hide after a few seconds
      setTimeout(() => setShowSignals(false), 4000);
    }
    if (state.phase === 'COMMIT') {
      signalsGenerated.current = false;
    }
  }, [state.phase, state]);

  // AI turns
  useEffect(() => {
    if (state.phase === 'GAME_OVER') return;

    if (state.phase === 'COMMIT' && isAITurn && currentPlayer) {
      const agent = agentsRef.current.find(a => a.playerId === currentPlayer.id);
      if (agent) {
        aiTimeoutRef.current = setTimeout(() => {
          const actions = agent.decideCommit(state);
          for (const a of actions) {
            try { dispatch(a); } catch { /* skip */ }
          }
          dispatch({ type: 'DONE_COMMITTING', playerId: currentPlayer.id });
        }, 300);
        return () => clearTimeout(aiTimeoutRef.current);
      }
    }

    if (state.phase === 'BROADCAST' && isAITurn && currentPlayer) {
      const agent = agentsRef.current.find(a => a.playerId === currentPlayer.id);
      if (agent) {
        aiTimeoutRef.current = setTimeout(() => {
          const action = agent.decideBroadcast(state, signalsRef.current);
          dispatch(action);
        }, 500);
        return () => clearTimeout(aiTimeoutRef.current);
      }
    }

    if (state.phase === 'RESOLVE') {
      aiTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'RESOLVE' });
        setTimeout(() => {
          // Update agents after resolve
          for (const agent of agentsRef.current) {
            agent.onRoundEnd(state, signalsRef.current);
          }
          dispatch({ type: 'NEXT_ROUND' });
        }, 1500);
      }, 800);
      return () => clearTimeout(aiTimeoutRef.current);
    }
  }, [state.phase, state.currentPlayerIndex, isAITurn, currentPlayer, state]);

  return (
    <div>
      <button style={styles.backButton} onClick={onBack}>← Menu</button>
      {showSignals && signalDisplay.length > 0 && (
        <div style={styles.signalPanel}>
          <div style={styles.signalTitle}>📡 Pre-broadcast signals:</div>
          {signalDisplay.map((s, i) => (
            <div key={i} style={styles.signalEntry}>{s}</div>
          ))}
        </div>
      )}
      <GameView state={state} dispatch={dispatch} isAITurn={isAITurn} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  menuContainer: {
    background: '#0a0a0a',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'monospace',
  },
  menuBox: {
    background: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    maxWidth: '400px',
  },
  title: { color: '#0f0', fontSize: '28px', margin: '0 0 4px' },
  subtitle: { color: '#888', fontSize: '14px', margin: '0 0 30px' },
  field: { marginBottom: '16px', textAlign: 'left' },
  label: { color: '#888', fontSize: '12px', display: 'block', marginBottom: '4px' },
  input: {
    background: '#1a1a2e',
    border: '1px solid #333',
    color: '#fff',
    fontFamily: 'monospace',
    fontSize: '14px',
    padding: '8px',
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: '4px',
  },
  slider: { width: '100%' },
  playButton: {
    background: '#0a3d0a',
    border: '2px solid #0f0',
    color: '#0f0',
    fontFamily: 'monospace',
    fontSize: '18px',
    padding: '12px 40px',
    cursor: 'pointer',
    borderRadius: '6px',
    marginTop: '12px',
  },
  version: { color: '#333', fontSize: '10px', marginTop: '20px' },
  backButton: {
    background: 'none',
    border: '1px solid #333',
    color: '#888',
    fontFamily: 'monospace',
    fontSize: '12px',
    padding: '4px 12px',
    cursor: 'pointer',
    margin: '8px',
    borderRadius: '3px',
  },
  signalPanel: {
    background: '#111a11',
    border: '1px solid #0a3d0a',
    borderRadius: '6px',
    padding: '12px 16px',
    margin: '8px',
    fontFamily: 'monospace',
  },
  signalTitle: {
    color: '#0f0',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
  },
  signalEntry: {
    color: '#aaa',
    fontSize: '11px',
    marginBottom: '4px',
    paddingLeft: '8px',
    fontStyle: 'italic' as const,
  },
};
