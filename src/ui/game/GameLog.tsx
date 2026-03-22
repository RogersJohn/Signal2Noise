import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../engine/types';

interface GameLogProps {
  entries: LogEntry[];
}

function formatEntry(entry: LogEntry): string {
  if (entry.action === 'GAME_OVER') return '🏆 Game complete!';
  return entry.details;
}

export default function GameLog({ entries }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  // Group by round
  const recent = entries.slice(-60);
  let lastRound = -1;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>EVENT LOG</h3>
      <div style={styles.logArea}>
        {recent.map((entry, i) => {
          const showRoundHeader = entry.round !== lastRound;
          lastRound = entry.round;
          return (
            <React.Fragment key={i}>
              {showRoundHeader && (
                <div style={styles.roundHeader}>
                  ── Round {entry.round} ──
                </div>
              )}
              <div style={styles.entry}>
                <span style={styles.phase}>[{entry.phase}]</span>
                <span style={styles.text}>{formatEntry(entry)}</span>
              </div>
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px', fontFamily: 'monospace' },
  title: { color: '#0f0', fontSize: '14px', margin: '0 0 8px' },
  logArea: {
    maxHeight: '250px', overflowY: 'auto', background: '#0a0a0a',
    border: '1px solid #222', borderRadius: '4px', padding: '6px', fontSize: '10px',
  },
  roundHeader: { color: '#fa0', margin: '6px 0 2px', fontWeight: 'bold', fontSize: '10px' },
  entry: { marginBottom: '2px', lineHeight: '1.4' },
  phase: { color: '#0af', marginRight: '4px', fontSize: '9px' },
  text: { color: '#888' },
};
