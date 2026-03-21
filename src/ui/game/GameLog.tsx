import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../../engine/types';

interface GameLogProps {
  entries: LogEntry[];
}

export default function GameLog({ entries }: GameLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  const recent = entries.slice(-50);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>EVENT LOG</h3>
      <div style={styles.logArea}>
        {recent.map((entry, i) => (
          <div key={i} style={styles.entry}>
            <span style={styles.round}>R{entry.round}</span>
            <span style={styles.phase}>[{entry.phase}]</span>
            <span style={styles.details}>{entry.details}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '8px', fontFamily: 'monospace' },
  title: { color: '#0f0', fontSize: '14px', margin: '0 0 8px' },
  logArea: {
    maxHeight: '200px',
    overflowY: 'auto',
    background: '#0a0a0a',
    border: '1px solid #222',
    borderRadius: '4px',
    padding: '6px',
    fontSize: '10px',
  },
  entry: { marginBottom: '2px', lineHeight: '1.4' },
  round: { color: '#fa0', marginRight: '4px' },
  phase: { color: '#0af', marginRight: '4px' },
  details: { color: '#888' },
};
