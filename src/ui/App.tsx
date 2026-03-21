import React, { useState, useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction, GameConfig } from '../engine/types';
import { createGame, applyAction, getWinner } from '../engine/engine';
import { getStrategy, STRATEGY_NAMES } from '../ai/strategies';
import { CONSPIRACIES } from '../data/conspiracies';
import { EVIDENCE_CARDS } from '../data/evidence';
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

function GameContainer({ playerName, aiCount, onBack }: {
  playerName: string;
  aiCount: number;
  onBack: () => void;
}) {
  const aiStrategies = useRef(pickRandomStrategies(aiCount)).current;
  const names = [playerName, ...aiStrategies.map((s, i) => `${s} AI ${i + 1}`)];
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

  const currentPlayerId = state.phase === 'COMMIT' || state.phase === 'BROADCAST'
    ? state.turnOrder[state.currentPlayerIndex]
    : undefined;
  const currentPlayer = currentPlayerId
    ? state.players.find(p => p.id === currentPlayerId)
    : undefined;
  const isAITurn = currentPlayer ? !currentPlayer.isHuman : false;

  // AI turns
  useEffect(() => {
    if (state.phase === 'GAME_OVER') return;

    if (state.phase === 'COMMIT' && isAITurn && currentPlayer?.strategyName) {
      aiTimeoutRef.current = setTimeout(() => {
        const strategy = getStrategy(currentPlayer.strategyName!);
        const actions = strategy.decideCommit(state, currentPlayer.id);
        for (const a of actions) {
          try { dispatch(a); } catch { /* skip */ }
        }
        dispatch({ type: 'DONE_COMMITTING', playerId: currentPlayer.id });
      }, 300);
      return () => clearTimeout(aiTimeoutRef.current);
    }

    if (state.phase === 'BROADCAST' && isAITurn && currentPlayer?.strategyName) {
      aiTimeoutRef.current = setTimeout(() => {
        const strategy = getStrategy(currentPlayer.strategyName!);
        const action = strategy.decideBroadcast(state, currentPlayer.id);
        dispatch(action);
      }, 500);
      return () => clearTimeout(aiTimeoutRef.current);
    }

    if (state.phase === 'RESOLVE') {
      aiTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'RESOLVE' });
        setTimeout(() => dispatch({ type: 'NEXT_ROUND' }), 1500);
      }, 800);
      return () => clearTimeout(aiTimeoutRef.current);
    }
  }, [state.phase, state.currentPlayerIndex, isAITurn, currentPlayer, state]);

  return (
    <div>
      <button style={styles.backButton} onClick={onBack}>← Menu</button>
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
};
